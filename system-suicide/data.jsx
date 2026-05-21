/* SYSTEM SUICIDE — module data + per-module product-page detail. */

/* Tokens used by the catalog cards on the homepage AND by the product-page
   header. `redacted: true` means the homepage hides the description and the
   product page renders a CLASSIFIED treatment. */
const MODULES = [
  {
    idx: "01", slug: "i-show-you-light",
    name: "I Show You Light", fn: "Oscillator",
    hp: 16, phase: "PHASE 3", redacted: true,
    core: "Optical tone-wheel. BLDC motor spins a cut disc; LED→photodiode reads the pattern. Swappable discs = different waveforms. Piezo stylus picks up surface texture (DUST out).",
  },
  {
    idx: "02", slug: "body-blood-and-salt",
    name: "Body Blood And Salt", fn: "Tactile processor",
    hp: 10, phase: "PHASE 5", redacted: true,
    core: "Skin resistance is in the audio path. Four touch pads — gate, filter, bend, chaos.",
  },
  {
    idx: "03", slug: "all-bones-dust",
    name: "All Bones Dust", fn: "Saturator / VCA",
    hp: 10, phase: "SHIP — PHASE 1", redacted: true,
    core: "Audio transformer in saturation + mechanical rattle plate.",
  },
  {
    idx: "04", slug: "be-careful",
    name: "Be Careful", fn: "Glass resonant filter",
    hp: 14, phase: "PHASE 3", redacted: true,
    core: "Glass plate as filter element. Motorised clamp shifts effective length = cutoff. Self-oscillates near Q=max. Plate can crack.",
  },
  {
    idx: "05", slug: "fuck-abandoned-sleep",
    name: "Fuck Abandoned Sleep", fn: "Pendulum LFO",
    hp: 10, phase: "PHASE 3", redacted: true,
    core: "Brass weight on a carbon rod. Optical readout, electromagnet sustains the swing.",
  },
  {
    idx: "06", slug: "is-my",
    name: "Is My", fn: "Optical crossfader",
    hp: 6, phase: "PHASE 2", redacted: false,
    core: "Two vactrols, matched pair. LDR inertia gives 30 ms optical lag — every transition has a small spring. For live morphing and triggered A/B jumps.",
  },
  {
    idx: "07", slug: "last-day",
    name: "Last Day", fn: "Delay / amp / EQ",
    hp: 40, phase: "PHASE 2", redacted: true,
    core: "Pre-apocalypse finaliser. Oil can delay + solar-powered starved amplifier + inductive EQ with a tongue resonator.",
  },
  {
    idx: "08", slug: "and-my",
    name: "And My", fn: "MOSFET shaper · VCA · ring · gate",
    hp: 10, phase: "PHASE 2", redacted: false,
    core: "MOSFET core from a recycled drone ESC. Three modes — SHAPER / RING / GATE — switched from an external pilot remote over MIDI/TRS. Edition of 13 with documented provenance.",
  },
  {
    idx: "09", slug: "last-night",
    name: "Last Night", fn: "Resonator reverb",
    hp: 20, phase: "SHIP — PHASE 1", redacted: true, flagship: true,
    core: "Swappable plates of wood, stone, metal, bone, glass. No DSP.",
  },
];

const CARTRIDGES = [
  { sw: "sw-oak",     nm: "Oak / raw",      rt: "0.1–0.3 s",  ch: "Warm, soft, perc. The wood baseline." },
  { sw: "sw-maple",   nm: "Maple / shellac",rt: "0.2–0.5 s",  ch: "Violin-bright. Most musical." },
  { sw: "sw-marble",  nm: "Marble",         rt: "0.8–2 s",    ch: "Cathedral. Warm and slow." },
  { sw: "sw-brass",   nm: "Brass",          rt: "1–3 s",      ch: "Bell-like, sitar shimmer." },
  { sw: "sw-steel",   nm: "Spring steel",   rt: "2–6 s",      ch: "Infinite shimmer. 0.5 mm." },
  { sw: "sw-bone",    nm: "Scapula bone",   rt: "1–3 s",      ch: "Dry, ritual, percussive." },
  { sw: "sw-glass",   nm: "Pyrex glass",    rt: "2–6 s",      ch: "Crystalline. Compatible with Be Careful." },
  { sw: "sw-nephrite",nm: "Nephrite",       rt: "1–4 s",      ch: "Singing, meditative, ancient." },
];

const PATCHES = [
  { nm: "Drone Cathedral",  sub: "01 → 04 → 09",         dur: "Q∞ / freeze" },
  { nm: "Red Mirage",       sub: "EXT → 07 → 09",        dur: "Dub kill + drag" },
  { nm: "Pendulum Clock",   sub: "05 → 01 → 03 → 07",    dur: "Self-evolving" },
  { nm: "Glass and Bone",   sub: "01·dust → 04 → 03 → 09", dur: "Mineral perc." },
  { nm: "Day Into Night",   sub: "07 ⇌ 09 (FB loop)",    dur: "Infinite decay" },
  { nm: "Solar Storm",      sub: "07 standalone, SUN 0", dur: "Noise / live" },
];

/* ---- product page detail — only the two revealed modules ---- */

const PRODUCT_PAGES = {
  "is-my": {
    quote: "Every transition has a small spring.",
    intro: "A two-channel optical crossfader on matched vactrols. The 30 ms inertia of the LDR is the whole point — fast jumps feel sprung, slow morphs feel breathed.",
    stats: [
      { k: "Format",  v: "Eurorack · 6 HP" },
      { k: "Power",   v: "±12 V · 24 mA" },
      { k: "I/O",     v: "2 × audio in · 1 audio out · CV · sync" },
      { k: "Curve",   v: "Linear / equal-power / reverse-log" },
      { k: "Lag",     v: "~30 ms optical (LDR rise/fall)" },
      { k: "Phase",   v: "Phase 2 · ships Q3 2026" },
      { k: "Price",   v: "€ 220" },
    ],
    physical: [
      "Two vactrols (VTL5C3 or VTL5C4, hand-matched) wired in complementary configuration: one LED inverted from the CV signal, one direct. The CV summs the manual POSITION baseline with the external input through an attenuverter, then drives both LEDs through a current source.",
      "The cells themselves are slow — LDR rise ~10 ms, fall ~50 ms. Fast CV sweeps get smeared by the photoresistor's inertia; this is the audible signature. At rest, the cell sits at a specific resistance that adds about 1 dB of midrange colour to whichever channel is open."
    ],
    sigchain: [
      "AUDIO A ──► Input A buffer ──► Vactrol A (LDR1) ──┐",
      "                                                   ├──► Summing amp ──► OUTPUT",
      "AUDIO B ──► Input B buffer ──► Vactrol B (LDR2) ──┘",
      "",
      "CV ──► LED driver ──┬──► LED in Vactrol A (inverted)",
      "                    └──► LED in Vactrol B (direct)",
      "",
      "Manual POSITION ──► mixed into CV summing node",
      "SYNC IN ──► gate latch ──► momentary A/B flip",
    ],
    controls: [
      { ctrl: "POSITION",   fn: "Manual baseline. 0 = A · 10 = B · 5 = mix",   cv: false },
      { ctrl: "CV AMOUNT",  fn: "Attenuverter on CV input",                    cv: false },
      { ctrl: "CURVE",      fn: "Switch · linear / equal-power / reverse-log", cv: false },
      { ctrl: "SYNC IN",    fn: "Gate-triggered A/B momentary flip",           cv: true  },
      { ctrl: "LED A · B",  fn: "Visual indicator of each vactrol's open state", cv: false },
    ],
    uses: [
      "Live crossfade between two voices — rhythmic SYNC triggers in time with the sequencer give audible 30 ms fades instead of hard switches.",
      "Slow morph between two reverb tails. CV from Fuck Abandoned Sleep pendulum LFO breathes the balance.",
      "Triggered drum bus mute. The lag turns a kick mute into a perceptible duck rather than a hard cut.",
    ],
  },

  "and-my": {
    quote: "The hand that flew now plays.",
    intro: "A VCA-saturator-shaper with three modes (SHAPER / RING / GATE), built around a MOSFET stage harvested from a flight-controller ESC. The module is operated from an external pilot remote — a joystick, knobs, foot switch, on a tethered MIDI/TRS link.",
    stats: [
      { k: "Format",    v: "Eurorack · 10 HP + remote" },
      { k: "Power",     v: "±12 V · 60 mA (remote: LiPo · USB-C)" },
      { k: "Core",      v: "MOSFET stage from FPV drone ESC" },
      { k: "Modes",     v: "SHAPER · RING · GATE (switched at remote)" },
      { k: "Link",      v: "TRS · MIDI Type A · 14-bit on joystick" },
      { k: "Edition",   v: "13 numbered · provenance certificate" },
      { k: "Phase",     v: "Phase 2 · ships Q4 2026" },
      { k: "Price",     v: "€ 1 480 (module + remote)" },
    ],
    physical: [
      "Each module's gain stage is built around a power MOSFET pulled from a flight-controller ESC of a downed drone. The board is identified — model, region, date — and a photograph travels with the unit as a provenance certificate. The component does the same job it did in flight: it switches power. The signal is just smaller now.",
      "In SHAPER mode the MOSFET runs as a VCA with controllable saturation; Drive pushes the device into nonlinearity, Bias offsets the operating point (even ↔ odd harmonics). In RING mode an internal carrier (200 Hz–10 kHz) modulates duty cycle against the audio — metallic, inharmonic. In GATE mode the same device is a hard limiter + noise gate; transients become percussive, tails are cropped.",
      "Mode switching crossfades over ~50 ms to suppress clicks. Because each ESC is a different unit with different thermal history and silicon variance, every numbered module sounds slightly different. This is documented, not corrected."
    ],
    sigchain: [
      "AUDIO IN ──► input buffer ──► MOSFET shaper core ──► output buffer ──► AUDIO OUT",
      "                                ▲",
      "VIDEO IN ──► audifier ──────────┤  (composite NTSC/PAL as parallel source)",
      "                                ▲",
      "CV bus ────────────────────────┘  (DRIVE / BIAS / LEVEL / TONE)",
      "                                ▲",
      "                       MIDI IN ◄── pilot remote (TRS, MIDI Type A)",
      "",
      "Remote outs: X / Y / GATE on 3.5 mm jacks — patch to any other module.",
    ],
    controls: [
      { ctrl: "LEVEL",       fn: "VCA gain. Knob on remote, CV on panel",                cv: true },
      { ctrl: "DRIVE",       fn: "Saturation / PWM carrier / upper threshold",           cv: true },
      { ctrl: "BIAS",        fn: "Operating-point offset (mode-dependent)",              cv: true },
      { ctrl: "TONE",        fn: "Spectral tilt after the core",                         cv: true },
      { ctrl: "MODE",        fn: "SHAPER · RING · GATE (3-position toggle, remote)",    cv: false },
      { ctrl: "ARM",         fn: "Global gate enable. Foot switch can also drive it.",  cv: false },
      { ctrl: "LINK",        fn: "Joystick axis link · independent / synchronous",      cv: false },
      { ctrl: "JOYSTICK",    fn: "X→BIAS · Y→DRIVE · press→GATE trigger (14-bit MIDI)",cv: false },
    ],
    remote: {
      blurb: "The pilot remote is the module's interface. It runs on its own LiPo and charges over USB-C — which also doubles as a USB-MIDI controller for DAW use. The body is either a generic CNC enclosure or, when a donor is available, the original radio handset, fully retained as found.",
      layout: [
        "Top row     ARM · MODE · LINK              (left hand, toggles)",
        "Left zone   LEVEL · TONE · LED activity   (left hand, knobs)",
        "Right zone  Joystick · press = GATE       (right hand)",
        "Lower edge  Foot · MIDI OUT · CV OUT × 3  (X / Y / GATE)",
      ],
    },
    uses: [
      "Live performance: foot switch holds ARM, the joystick shapes the signal in real time, the CV outs simultaneously modulate the rest of the system. One gesture, four modules moving.",
      "Studio: USB-MIDI to the DAW, the remote becomes a generic controller, the module is silent unless armed.",
      "Hybrid: drive the module from another module's CV (panel inputs override the remote), keep the remote as a CV source for the rest of the rack.",
    ],
  },
};

Object.assign(window, { MODULES, CARTRIDGES, PATCHES, PRODUCT_PAGES });
