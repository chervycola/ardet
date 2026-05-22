import type { Module, Cartridge, Patch, ProductPages } from './types';

export const MODULES: Module[] = [
  {
    idx: '01', slug: 'i-show-you-light',
    name: 'I Show You Light', fn: 'Oscillator',
    hp: 16, phase: 'PHASE 3', redacted: true,
    core: 'Optical tone-wheel. BLDC motor spins a cut disc; LED→photodiode reads the pattern. Swappable discs = different waveforms. Piezo stylus picks up surface texture (DUST out).',
  },
  {
    idx: '02', slug: 'body-blood-and-salt',
    name: 'Body Blood And Salt', fn: 'Liquid synth / processor',
    hp: 20, phase: 'PHASE 5', redacted: true,
    core: 'Body fluids and skin in the audio path. Four touch pads — gate, filter, bend, chaos — plus a liquid well with swappable electrodes.',
  },
  {
    idx: '03', slug: 'all-bones-dust',
    name: 'All Bones Dust', fn: 'Waveshaper / distortion / VCA',
    hp: 10, phase: 'SHIP — PHASE 1', redacted: true,
    core: 'Audio transformer in saturation + mechanical rattle plate.',
  },
  {
    idx: '04', slug: 'be-careful',
    name: 'Be Careful', fn: 'Glass resonant filter',
    hp: 'TBD', phase: 'PHASE 3', redacted: true,
    core: 'Glass plate as filter element. Motorised clamp shifts effective length = cutoff. Self-oscillates near Q=max. Plate can crack.',
  },
  {
    idx: '05', slug: 'fuck-abandoned-sleep',
    name: 'Fuck Abandoned Sleep', fn: 'Pendulum LFO',
    hp: 8, phase: 'PHASE 3', redacted: true,
    core: 'Brass weight on a carbon rod. Optical readout, electromagnet sustains the swing.',
  },
  {
    idx: '06', slug: 'is-my',
    name: 'Is My', fn: 'MOSFET shaper · VCA · ring · gate',
    hp: 10, phase: 'PHASE 2', redacted: false,
    core: 'MOSFET core from a recycled drone ESC. Three modes — SHAPER / RING / GATE — switched from an external pilot remote over MIDI/TRS. Edition of 13 with documented provenance.',
  },
  {
    idx: '07', slug: 'last-day',
    name: 'Last Day', fn: 'Delay / amp / EQ',
    hp: 40, phase: 'PHASE 2', redacted: true,
    core: 'Pre-apocalypse finaliser. Oil can delay + solar-powered starved amplifier + inductive EQ with a tongue resonator.',
  },
  {
    idx: '08', slug: 'and-my',
    name: 'And My', fn: 'TBD',
    hp: 'TBD', phase: 'PHASE 2', redacted: true,
    core: 'TBD.',
  },
  {
    idx: '09', slug: 'last-night',
    name: 'Last Night', fn: 'Resonator reverb',
    hp: 40, phase: 'SHIP — PHASE 1', redacted: false, flagship: true,
    core: 'Swappable plates of wood, stone, metal, bone, glass. No DSP.',
  },
];

export const CARTRIDGES: Cartridge[] = [
  { sw: 'sw-oak',      nm: 'Oak / raw',       rt: '0.1–0.3 s', ch: 'Warm, soft, perc. The wood baseline.' },
  { sw: 'sw-maple',    nm: 'Maple / shellac', rt: '0.2–0.5 s', ch: 'Violin-bright. Most musical.' },
  { sw: 'sw-marble',   nm: 'Marble',          rt: '0.8–2 s',   ch: 'Cathedral. Warm and slow.' },
  { sw: 'sw-brass',    nm: 'Brass',           rt: '1–3 s',     ch: 'Bell-like, sitar shimmer.' },
  { sw: 'sw-steel',    nm: 'Spring steel',    rt: '2–6 s',     ch: 'Infinite shimmer. 0.5 mm.' },
  { sw: 'sw-bone',     nm: 'Scapula bone',    rt: '1–3 s',     ch: 'Dry, ritual, percussive.' },
  { sw: 'sw-glass',    nm: 'Pyrex glass',     rt: '2–6 s',     ch: 'Crystalline. Compatible with Be Careful.' },
  { sw: 'sw-nephrite', nm: 'Nephrite',        rt: '1–4 s',     ch: 'Singing, meditative, ancient.' },
];

export const PATCHES: Patch[] = [
  { nm: 'Drone Cathedral', sub: '01 → 04 → 09',           dur: 'Q∞ / freeze' },
  { nm: 'Red Mirage',      sub: 'EXT → 07 → 09',          dur: 'Dub kill + drag' },
  { nm: 'Pendulum Clock',  sub: '05 → 01 → 03 → 07',      dur: 'Self-evolving' },
  { nm: 'Glass and Bone',  sub: '01·dust → 04 → 03 → 09', dur: 'Mineral perc.' },
  { nm: 'Day Into Night',  sub: '07 ⇌ 09 (FB loop)',      dur: 'Infinite decay' },
  { nm: 'Solar Storm',     sub: '07 standalone, SUN 0',   dur: 'Noise / live' },
];

export const PRODUCT_PAGES: ProductPages = {
  'is-my': {
    quote: 'The hand that flew now plays.',
    intro: 'A VCA-saturator-shaper with three modes (SHAPER / RING / GATE), built around a MOSFET stage harvested from a flight-controller ESC. The module is operated from an external pilot remote — a joystick, knobs, foot switch, on a tethered MIDI/TRS link.',
    stats: [
      { k: 'Format',  v: 'Eurorack · 10 HP + remote' },
      { k: 'Power',   v: '±12 V · 60 mA (remote: LiPo · USB-C)' },
      { k: 'Core',    v: 'MOSFET stage from FPV drone ESC' },
      { k: 'Modes',   v: 'SHAPER · RING · GATE (switched at remote)' },
      { k: 'Link',    v: 'TRS · MIDI Type A · 14-bit on joystick' },
      { k: 'Edition', v: '13 numbered · provenance certificate' },
      { k: 'Phase',   v: 'Phase 2 · ships Q4 2026' },
      { k: 'Price',   v: '€ 1 480 (module + remote)' },
    ],
    physical: [
      "Each module's gain stage is built around a power MOSFET pulled from a flight-controller ESC of a downed drone. The board is identified — model, region, date — and a photograph travels with the unit as a provenance certificate. The component does the same job it did in flight: it switches power. The signal is just smaller now.",
      'In SHAPER mode the MOSFET runs as a VCA with controllable saturation; Drive pushes the device into nonlinearity, Bias offsets the operating point (even ↔ odd harmonics). In RING mode an internal carrier (200 Hz–10 kHz) modulates duty cycle against the audio — metallic, inharmonic. In GATE mode the same device is a hard limiter + noise gate; transients become percussive, tails are cropped.',
      'Mode switching crossfades over ~50 ms to suppress clicks. Because each ESC is a different unit with different thermal history and silicon variance, every numbered module sounds slightly different. This is documented, not corrected.',
    ],
    sigchain: [
      'AUDIO IN ──► input buffer ──► MOSFET shaper core ──► output buffer ──► AUDIO OUT',
      '                                ▲',
      'VIDEO IN ──► audifier ──────────┤  (composite NTSC/PAL as parallel source)',
      '                                ▲',
      'CV bus ────────────────────────┘  (DRIVE / BIAS / LEVEL / TONE)',
      '                                ▲',
      '                       MIDI IN ◄── pilot remote (TRS, MIDI Type A)',
      '',
      'Remote outs: X / Y / GATE on 3.5 mm jacks — patch to any other module.',
    ],
    controls: [
      { ctrl: 'LEVEL',    fn: 'VCA gain. Knob on remote, CV on panel',                cv: true  },
      { ctrl: 'DRIVE',    fn: 'Saturation / PWM carrier / upper threshold',           cv: true  },
      { ctrl: 'BIAS',     fn: 'Operating-point offset (mode-dependent)',              cv: true  },
      { ctrl: 'TONE',     fn: 'Spectral tilt after the core',                         cv: true  },
      { ctrl: 'MODE',     fn: 'SHAPER · RING · GATE (3-position toggle, remote)',     cv: false },
      { ctrl: 'ARM',      fn: 'Global gate enable. Foot switch can also drive it.',   cv: false },
      { ctrl: 'LINK',     fn: 'Joystick axis link · independent / synchronous',       cv: false },
      { ctrl: 'JOYSTICK', fn: 'X→BIAS · Y→DRIVE · press→GATE trigger (14-bit MIDI)',  cv: false },
    ],
    remote: {
      blurb: 'The pilot remote is the module\'s interface. It runs on its own LiPo and charges over USB-C — which also doubles as a USB-MIDI controller for DAW use. The body is either a generic CNC enclosure or, when a donor is available, the original radio handset, fully retained as found.',
      layout: [
        'Top row     ARM · MODE · LINK              (left hand, toggles)',
        'Left zone   LEVEL · TONE · LED activity   (left hand, knobs)',
        'Right zone  Joystick · press = GATE       (right hand)',
        'Lower edge  Foot · MIDI OUT · CV OUT × 3  (X / Y / GATE)',
      ],
    },
    uses: [
      'Live performance: foot switch holds ARM, the joystick shapes the signal in real time, the CV outs simultaneously modulate the rest of the system. One gesture, four modules moving.',
      'Studio: USB-MIDI to the DAW, the remote becomes a generic controller, the module is silent unless armed.',
      "Hybrid: drive the module from another module's CV (panel inputs override the remote), keep the remote as a CV source for the rest of the rack.",
    ],
  },

  'last-night': {
    quote: 'Post-apocalypse. The breath of ruins. An old gramophone in an empty room.',
    intro: 'An analogue reverb with no DSP. A surface exciter drives a thin plate held in a cartridge — wood, stone, metal, glass, bone, jade. Two piezo pickups read the resonance from the other face. A solenoid damps. A feedback loop freezes. Each cartridge is a different room.',
    stats: [
      { k: 'Format',    v: 'Eurorack · 40 HP' },
      { k: 'Power',     v: '±12 V · 180 mA' },
      { k: 'I/O',       v: 'Mono in / stereo out · 3.5 mm' },
      { k: 'Pickups',   v: '2 × piezo · mini-XLR shielded' },
      { k: 'Exciter',   v: 'Dayton DAEX25 · 4 Ω' },
      { k: 'Cartridges',v: '6 ship · 6 phase 2' },
      { k: 'Phase',     v: 'Phase 1 · ships now' },
      { k: 'Price',     v: '€ 640 · cartridge € 25–95' },
      { k: 'Lead time', v: '4 weeks · made to order' },
    ],
    physical: [
      'There is no chip doing the reverb. A surface exciter (Dayton DAEX25) is bolted to one face of a thin plate held under tension in a swappable cartridge. The dry signal drives the exciter; the plate physically rings. Two piezo pickups on the opposite face read that resonance back as a stereo image — the room is the material, not a model of it.',
      'The plate material is the entire character. Oak is warm and percussive; spring steel shimmers for seconds; marble is a slow cathedral; scapula bone is dry and ritual. A solenoid presses the plate to damp the tail on a CV, and a feedback path can be latched to freeze a resonance into an endless drone. Six cartridges ship; six more arrive in phase 2.',
    ],
    sigchain: [
      'AUDIO IN ──► Drive amp ──► Surface exciter ──┐',
      '                                              ▼',
      '                                  [ Cartridge plate ] rings',
      '                                              │',
      '2 × piezo pickup ──► Stereo preamp ──► Dry / wet mix ──► OUT L·R',
      '                                              │',
      'DAMP CV ──► Solenoid (presses plate)          └──► Feedback loop ──► FREEZE',
    ],
    controls: [
      { ctrl: 'DRIVE',     fn: 'Exciter level into the plate',                  cv: true  },
      { ctrl: 'DAMP',      fn: 'Solenoid pressure — shortens the decay',        cv: true  },
      { ctrl: 'FREEZE',    fn: 'Latches the feedback loop into infinite sustain', cv: true  },
      { ctrl: 'MIX',       fn: 'Dry / wet balance',                             cv: true  },
      { ctrl: 'TONE',      fn: 'Tilt EQ on the wet return',                     cv: false },
      { ctrl: 'CARTRIDGE', fn: 'Physical swap — selects the resonant body',     cv: false },
    ],
    uses: [
      'Drone Cathedral — freeze a sustained chord from I Show You Light through a marble cartridge for an endless hall.',
      'Day Into Night — close a feedback loop with Last Day (07 ⇌ 09) for infinite, slowly-collapsing decay.',
      'Mineral percussion — a bone or glass cartridge turns transients into dry, ritual hits.',
    ],
  },
};
