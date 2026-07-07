// ============================================================
// I SHOW YOU LIGHT — сервопетля строя (прототип v0.1)
// System Suicide
//
// Железо:
//   MCU:      Raspberry Pi Pico (RP2040), ядро Earle Philhower
//   Мотор:    gimbal BLDC, 7 пар полюсов (GM2804 и т.п.)
//   Драйвер:  SimpleFOC Mini (DRV8313), 3-PWM
//   Энкодер:  AS5047P по SPI0, диаметральный магнит на валу
//   CV:       ADS1115 по I2C1 (или потенциометр на GP26 для стенда)
//
// Библиотеки (Library Manager):
//   Simple FOC (>= 2.3.x), Adafruit ADS1X15
// ============================================================

#include <SimpleFOC.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

// ---------- режим стенда ----------
// true  = pitch задаётся потенциометром на GP26 (0..3.3V -> 0..5 октав)
// false = pitch с ADS1115 (настоящий 1V/oct вход через фронтенд)
#define USE_POT_CV true

// ---------- пины ----------
#define PIN_SPI_SCK   2   // AS5047P CLK
#define PIN_SPI_MOSI  3   // AS5047P MOSI
#define PIN_SPI_MISO  4   // AS5047P MISO
#define PIN_ENC_CS    5   // AS5047P CSn

#define PIN_PWM_A     6   // SimpleFOC Mini IN1
#define PIN_PWM_B     7   // SimpleFOC Mini IN2
#define PIN_PWM_C     8   // SimpleFOC Mini IN3
#define PIN_DRV_EN    9   // SimpleFOC Mini EN

#define PIN_I2C_SDA   14  // ADS1115
#define PIN_I2C_SCL   15

#define PIN_MUX_A     12  // CD4052: выбор дорожки (фотодиода)
#define PIN_MUX_B     13
#define PIN_POT_CV    26  // стендовый потенциометр
#define PIN_POT_GLIDE 27  // потенциометр Glide
#define PIN_LOCK_LED  25  // встроенный LED = quartz lock

// ---------- мотор / механика ----------
#define POLE_PAIRS    7
#define VOLTAGE_PSU   12.0f
#define VOLTAGE_LIMIT 6.0f    // gimbal-моторы высокоомные, 6В хватает
#define ALIGN_VOLTAGE 3.0f    // напряжение калибровки энкодер<->мотор

// ---------- музыка ----------
#define BASE_FREQ     32.703f  // C1 при CV = 0V
#define RPM_MIN       300.0f   // ниже — коггинг и вялая петля
#define RPM_MAX       12000.0f
#define LOCK_CENTS    6.0f     // порог лока для LED

// дорожки диска: число прорезей (регистры "коробки передач")
const int RINGS[] = {8, 16, 32};
const int N_RINGS = 3;

// ---------- объекты ----------
MagneticSensorSPI sensor = MagneticSensorSPI(AS5047_SPI, PIN_ENC_CS);
BLDCDriver3PWM driver = BLDCDriver3PWM(PIN_PWM_A, PIN_PWM_B, PIN_PWM_C, PIN_DRV_EN);
BLDCMotor motor = BLDCMotor(POLE_PAIRS);
Adafruit_ADS1115 ads;
Commander command = Commander(Serial);

// ---------- состояние ----------
float pitch_target_st = 0;   // цель, в полутонах от C1
float pitch_now_st    = 0;   // текущий (слю-ограниченный) питч
int   ring_idx        = 1;   // активная дорожка (старт: 16 прорезей)
uint32_t t_cv_last    = 0;
bool  ads_pending     = false;

void onMotor(char* cmd) { command.motor(&motor, cmd); }

// ============================================================
// setup
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1500);

  pinMode(PIN_MUX_A, OUTPUT);
  pinMode(PIN_MUX_B, OUTPUT);
  pinMode(PIN_LOCK_LED, OUTPUT);
  analogReadResolution(12);

  // --- SPI для энкодера ---
  SPI.setSCK(PIN_SPI_SCK);
  SPI.setTX(PIN_SPI_MOSI);
  SPI.setRX(PIN_SPI_MISO);
  sensor.init();

  // --- I2C для ADS1115 ---
  if (!USE_POT_CV) {
    Wire1.setSDA(PIN_I2C_SDA);
    Wire1.setSCL(PIN_I2C_SCL);
    Wire1.begin();
    ads.begin(0x48, &Wire1);
    ads.setGain(GAIN_ONE);            // +/-4.096V, шаг 125 мкВ
    ads.setDataRate(RATE_ADS1115_860SPS);
  }

  // --- драйвер ---
  driver.voltage_power_supply = VOLTAGE_PSU;
  driver.voltage_limit = VOLTAGE_LIMIT;
  driver.init();

  // --- мотор: скоростная петля ---
  motor.linkSensor(&sensor);
  motor.linkDriver(&driver);
  motor.controller = MotionControlType::velocity;
  motor.torque_controller = TorqueControlType::voltage;

  // стартовый PID (тюнить через Commander: "M" + параметры)
  motor.PID_velocity.P = 0.15f;
  motor.PID_velocity.I = 2.0f;
  motor.PID_velocity.D = 0.0f;
  motor.PID_velocity.output_ramp = 500.0f;
  motor.LPF_velocity.Tf = 0.005f;
  motor.voltage_limit = VOLTAGE_LIMIT;
  motor.voltage_sensor_align = ALIGN_VOLTAGE;

  motor.useMonitoring(Serial);
  motor.init();
  motor.initFOC();                    // калибровка: мотор дёрнется — норма

  command.add('M', onMotor, (char*)"motor");
  setRing(ring_idx);

  Serial.println(F("I SHOW YOU LIGHT: servo up. Commander: M<...>"));
}

// ============================================================
// pitch-математика
// ============================================================

// читаем CV, возвращаем цель в полутонах от C1 (неблокирующе)
void updatePitchTarget() {
  if (millis() - t_cv_last < 5) return;   // ~200 Гц опрос
  t_cv_last = millis();

  float volts = 0;
  if (USE_POT_CV) {
    volts = (analogRead(PIN_POT_CV) / 4095.0f) * 5.0f;  // 0..5 "октав"
  } else {
    // фронтенд: 0..+8V CV -> делитель /2.5 -> 0..3.2V на ADS1115
    if (!ads_pending) {
      ads.startADCReading(MUX_BY_CHANNEL[0], false);
      ads_pending = true;
      return;
    }
    if (!ads.conversionComplete()) return;
    ads_pending = false;
    volts = ads.computeVolts(ads.getLastConversionResults()) * 2.5f;
  }
  pitch_target_st = volts * 12.0f;   // 1V/oct -> 12 полутонов на вольт
}

// слю-лимитер в питч-домене: глайд музыкальный, а не линейный по RPM
void applyGlide() {
  // Glide-ручка: 0 = ~мгновенно (упрёмся в физику), макс = 2 c/октаву
  float pot = analogRead(PIN_POT_GLIDE) / 4095.0f;
  float st_per_s = 6000.0f * powf(1.0f - pot, 3.0f) + 6.0f;
  static uint32_t t_last = 0;
  uint32_t now = micros();
  float dt = (now - t_last) * 1e-6f;
  t_last = now;
  if (dt > 0.05f) dt = 0.05f;

  float d = pitch_target_st - pitch_now_st;
  float step = st_per_s * dt;
  if (d >  step) d =  step;
  if (d < -step) d = -step;
  pitch_now_st += d;
}

// частота ноты -> RPM диска для дорожки n: rpm = 60 * f / n
float rpmForRing(float note_hz, int n_slots) {
  return 60.0f * note_hz / (float)n_slots;
}

void setRing(int idx) {
  ring_idx = idx;
  digitalWrite(PIN_MUX_A, idx & 1);
  digitalWrite(PIN_MUX_B, (idx >> 1) & 1);
}

// коробка передач: выбрать дорожку так, чтобы RPM был в допуске
// и как можно ближе к текущим оборотам (меньше механики - быстрее скачок)
void gearshift(float note_hz, float rpm_now) {
  int best = ring_idx;
  float best_cost = 1e9f;
  for (int i = 0; i < N_RINGS; i++) {
    float rpm = rpmForRing(note_hz, RINGS[i]);
    if (rpm < RPM_MIN || rpm > RPM_MAX) continue;
    float cost = fabsf(logf(rpm / max(rpm_now, 1.0f)));
    // лёгкий гистерезис: текущая дорожка чуть выгоднее
    if (i == ring_idx) cost *= 0.7f;
    if (cost < best_cost) { best_cost = cost; best = i; }
  }
  if (best != ring_idx) setRing(best);
}

// ============================================================
// loop
// ============================================================
void loop() {
  motor.loopFOC();                       // держать быстрым, ничего блокирующего!

  updatePitchTarget();
  applyGlide();

  float note_hz = BASE_FREQ * powf(2.0f, pitch_now_st / 12.0f);
  float rpm_now = fabsf(motor.shaft_velocity) * 60.0f / _2PI;

  gearshift(note_hz, rpm_now);

  float rpm_target = rpmForRing(note_hz, RINGS[ring_idx]);
  rpm_target = constrain(rpm_target, RPM_MIN, RPM_MAX);
  float vel_target = rpm_target * _2PI / 60.0f;  // rad/s

  motor.move(vel_target);

  // lock LED: ошибка < LOCK_CENTS центов
  float cents = 1200.0f * log2f(max(rpm_now, 1.0f) / rpm_target);
  digitalWrite(PIN_LOCK_LED, fabsf(cents) < LOCK_CENTS);

  command.run();
}
