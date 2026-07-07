// LITHOSEQ — рамка пластины образца и слот стенда (04-PLATE-SPEC)
// Рендер: openscad -o plate_frame.stl -D 'part="frame"' plate.scad
//         openscad -o slot_base.stl   -D 'part="slot"'  plate.scad
// Печать: PETG/SLA, слой <=0.2 мм. Все размеры в мм.

part = "frame"; // "frame" | "slot"

/* ---------- параметры (единый источник правды) ---------- */
frame_w      = 50;    // внешний габарит рамки (вдоль вставки)
frame_h      = 40;
frame_t      = 6;     // толщина рамки (стёкла 2x1 + образец до 4)
window       = 25;    // окно образца
glass_w      = 38.5;  // карман под полустекло 26x38x1 (+0.5 допуск)
glass_h      = 26.5;
glass_t      = 1.1;
sample_gap   = 3.8;   // пространство под образец между стёклами
pin_d        = 2.0;   // регистрационные штифты
pin_hole_d   = 2.2;   // отверстие (посадка с зазором)
pin_spacing  = 40;    // межцентровое штифтов
tab_len      = 8;     // язычок-ручка
chamfer      = 4;     // асимметричный скос угла (защита от неверной вставки)
id_bits      = 4;     // метки ID по нижней кромке (читает камера, 04 §5)
id_notch     = 2.5;
dual_zone    = 4;     // зона под электроды по двум кромкам (dual-ready, D2)
slot_wall    = 3;
clearance    = 0.3;

/* ---------- рамка пластины ---------- */
module plate_frame(id_code = 0) {
    difference() {
        // тело с язычком
        union() {
            cube([frame_w, frame_h, frame_t]);
            translate([frame_w, frame_h/2 - 6, 0])
                cube([tab_len, 12, frame_t]);
        }
        // скос угла — единственная ориентация вставки
        translate([-1, -1, -1])
            rotate([0, 0, 45])
                cube([chamfer*1.5, chamfer*1.5, frame_t+2]);
        // карман стёкол: нижнее + образец + верхнее (сквозной паз сборки)
        translate([(frame_w-glass_w)/2, (frame_h-glass_h)/2,
                   (frame_t - (2*glass_t + sample_gap))/2])
            cube([glass_w, glass_h, 2*glass_t + sample_gap]);
        // окно (сквозное)
        translate([(frame_w-window)/2, (frame_h-window)/2, -1])
            cube([window, window, frame_t+2]);
        // регистрация: отверстие + овальный паз (класика kinematic)
        translate([(frame_w-pin_spacing)/2, frame_h/2, -1])
            cylinder(d=pin_hole_d, h=frame_t+2, $fn=32);
        translate([(frame_w+pin_spacing)/2, frame_h/2, -1])
            hull() {
                cylinder(d=pin_hole_d, h=frame_t+2, $fn=32);
                translate([1.5, 0, 0])
                    cylinder(d=pin_hole_d, h=frame_t+2, $fn=32);
            }
        // ID-метки: сквозные окошки по нижней кромке окна (в поле камеры)
        for (i = [0 : id_bits-1])
            if (floor(id_code / pow(2, i)) % 2 == 1)
                translate([(frame_w-window)/2 + 3 + i*6,
                           (frame_h-window)/2 - 3, -1])
                    cube([id_notch, id_notch, frame_t+2]);
        // dual-ready: подрез под плёнку электродов по двум кромкам (D2)
        for (y = [(frame_h-window)/2 - dual_zone,
                  (frame_h+window)/2])
            translate([(frame_w-window)/2 - dual_zone, y, frame_t-1])
                cube([window + 2*dual_zone, dual_zone, 1.01]);
    }
}

/* ---------- слот стенда ---------- */
module slot_base() {
    pocket_w = frame_w + clearance*2;
    pocket_h = frame_h + clearance*2;
    difference() {
        cube([pocket_w + 2*slot_wall, pocket_h + 2*slot_wall,
              frame_t + slot_wall]);
        // карман пластины (вставка сверху-сбоку со стороны язычка)
        translate([slot_wall, slot_wall, slot_wall])
            cube([pocket_w + slot_wall + 1, pocket_h, frame_t + 1]);
        // окно под оптический тракт (сквозное)
        translate([slot_wall + (pocket_w-window)/2 - dual_zone,
                   slot_wall + (pocket_h-window)/2 - dual_zone, -1])
            cube([window + 2*dual_zone, window + 2*dual_zone,
                  slot_wall + 2]);
    }
    // регистрационные штифты (или отверстия под стальные 2мм — надёжнее:
    // печатные штифты сточатся; для стальных заменить на цилиндры-отверстия)
    for (dx = [-pin_spacing/2, pin_spacing/2])
        translate([slot_wall + pocket_w/2 + dx,
                   slot_wall + pocket_h/2, slot_wall])
            cylinder(d=pin_d, h=frame_t*0.7, $fn=32);
}

if (part == "frame") plate_frame(id_code = 0);
if (part == "slot")  slot_base();
