/* SYSTEM SUICIDE — animated metaphor library.
   Ten small SVG + CSS animations, one per method. Each is a candidate
   replacement for the word "suicide" wherever the brand mark appears.
   Loop infinitely, drop-in size by container, no JS state. */

function AnimRazor() {
  const id = useMemo(() => nextBladeId(), []);
  return (
    <svg viewBox="0 0 320 80" className="anim-icon" aria-label="cut">
      {/* trail growing horizontally as the blade passes */}
      <rect className="ar-trail" x="22" y="38" width="240" height="4" fill="var(--accent)" />
      {/* razor blade body */}
      <g className="ar-blade">
        <defs>
          <mask id={id}>
            <rect width="100%" height="100%" fill="white" />
            <g fill="black">
              <rect x="14" y="36" width="32" height="8" />
              <circle cx="14" cy="40" r="8" />
              <circle cx="46" cy="40" r="8" />
            </g>
          </mask>
        </defs>
        <rect x="0" y="20" width="60" height="40" rx="4"
              fill="oklch(0.78 0.005 60)"
              stroke="var(--accent)" strokeWidth="1.4"
              mask={`url(#${id})`} />
      </g>
    </svg>
  );
}

function AnimShotgun() {
  return (
    <svg viewBox="0 0 360 100" className="anim-icon" aria-label="trigger">
      <g className="sg-body">
        {/* twin barrels */}
        <rect x="20" y="40" width="200" height="6" fill="var(--accent)" />
        <rect x="20" y="54" width="200" height="6" fill="var(--accent)" />
        <rect x="14" y="38" width="8" height="24" fill="var(--accent)" />
        {/* stock */}
        <path d="M 220 32 L 320 22 L 340 70 L 226 78 Z" fill="var(--accent)" />
        <rect x="222" y="60" width="22" height="14" fill="var(--bg)" />
        <path d="M 222 60 Q 222 74 234 74 L 246 74 L 246 70 L 234 70 Q 226 70 226 60 Z" fill="var(--accent)" />
      </g>
      {/* muzzle flash */}
      <g className="sg-flash">
        <circle cx="6" cy="50" r="10" fill="var(--accent)" opacity="0.95" />
        <circle cx="2" cy="50" r="16" fill="var(--accent)" opacity="0.45" />
        <path d="M 14 50 L -4 42 L -4 58 Z" fill="var(--accent)" />
      </g>
      {/* smoke puff */}
      <g className="sg-smoke">
        <circle cx="0" cy="50" r="6" fill="oklch(0.55 0.005 60)" opacity="0.6" />
        <circle cx="-8" cy="44" r="5" fill="oklch(0.55 0.005 60)" opacity="0.45" />
        <circle cx="-12" cy="56" r="4" fill="oklch(0.55 0.005 60)" opacity="0.35" />
      </g>
    </svg>
  );
}

function AnimCapsule() {
  return (
    <svg viewBox="0 0 260 80" className="anim-icon" aria-label="dose">
      <g className="cap-left">
        <path d="M 40 40 A 30 30 0 0 1 70 10 L 130 10 L 130 70 L 70 70 A 30 30 0 0 1 40 40 Z" fill="var(--accent)" />
        <ellipse cx="86" cy="22" rx="14" ry="3" fill="rgba(0,0,0,0.18)" />
      </g>
      <g className="cap-right">
        <path d="M 130 10 L 190 10 A 30 30 0 0 1 220 40 A 30 30 0 0 1 190 70 L 130 70 Z" fill="oklch(0.88 0.01 60)" />
      </g>
      {/* spilling particles */}
      <g className="cap-spill">
        <circle cx="130" cy="40" r="2.4" fill="var(--accent)" />
        <circle cx="124" cy="50" r="1.8" fill="var(--accent)" />
        <circle cx="138" cy="52" r="2" fill="var(--accent)" />
        <circle cx="130" cy="64" r="1.6" fill="var(--accent)" />
      </g>
    </svg>
  );
}

function AnimNoose() {
  return (
    <svg viewBox="0 0 120 160" className="anim-icon" aria-label="suspend">
      <g className="no-swing">
        {/* hanging rope */}
        <line x1="60" y1="0" x2="60" y2="32" stroke="var(--accent)" strokeWidth="3" />
        {/* hangman's knot — coil bundle */}
        <g transform="translate(60, 32)">
          <path d="M -11 0 Q -14 18 -11 36 L 11 36 Q 14 18 11 0 Z"
                fill="oklch(0.16 0.04 25)" stroke="var(--accent)" strokeWidth="1.4" />
          <line x1="-2" y1="0" x2="-2" y2="36" stroke="oklch(0.30 0.10 25)" strokeWidth="1" />
          {Array.from({length: 7}).map((_, i) => {
            const y = 3 + i * 4;
            return <line key={i} x1="-11" y1={y} x2="11" y2={y + 3}
              stroke="var(--accent)" strokeWidth="1.4" />;
          })}
          <line x1="-11" y1="6" x2="-19" y2="11" stroke="var(--accent)" strokeWidth="1.6" />
        </g>
        {/* working end → loop */}
        <line x1="60" y1="70" x2="60" y2="82" stroke="var(--accent)" strokeWidth="3" />
        <ellipse cx="60" cy="120" rx="22" ry="32" fill="none" stroke="var(--accent)" strokeWidth="3" />
      </g>
    </svg>
  );
}

function AnimTablets() {
  return (
    <svg viewBox="0 0 280 80" className="anim-icon" aria-label="decay">
      {[40, 140, 240].map((cx, i) => (
        <g key={i} className={`tab tab-${i}`}>
          <circle cx={cx} cy="40" r="30" fill="var(--accent)" />
          <line x1={cx - 20} y1="40" x2={cx + 20} y2="40" stroke="var(--bg)" strokeWidth="2.4" />
          <ellipse cx={cx - 10} cy="26" rx="7" ry="2" fill="rgba(255,255,255,0.20)" />
        </g>
      ))}
    </svg>
  );
}

function AnimMatch() {
  return (
    <svg viewBox="0 0 80 220" className="anim-icon" aria-label="ignite">
      {/* stick */}
      <rect x="36" y="74" width="8" height="138" fill="oklch(0.55 0.04 70)" />
      {/* match head */}
      <ellipse cx="40" cy="64" rx="9" ry="12" fill="var(--accent)" />
      {/* flame — flickers via CSS */}
      <g className="match-flame">
        <path d="M 40 4 Q 22 28 40 46 Q 58 28 40 4 Z" fill="var(--accent)" />
        <path d="M 40 14 Q 30 28 40 38 Q 50 28 40 14 Z" fill="oklch(0.92 0.05 60)" opacity="0.55" />
      </g>
      <g className="match-spark">
        <circle cx="40" cy="48" r="1.6" fill="oklch(0.92 0.05 60)" />
      </g>
    </svg>
  );
}

function AnimKnife() {
  return (
    <svg viewBox="0 0 320 80" className="anim-icon" aria-label="splice">
      {/* trail */}
      <rect className="kn-trail" x="20" y="38" width="240" height="3" fill="var(--accent)" />
      {/* knife sliding across */}
      <g className="kn-blade">
        {/* blade */}
        <path d="M 0 40 L 130 24 L 144 40 L 130 56 Z" fill="var(--accent)" />
        {/* highlight */}
        <line x1="6" y1="40" x2="124" y2="32" stroke="rgba(255,255,255,0.30)" strokeWidth="1.2" />
        {/* guard */}
        <rect x="140" y="28" width="6" height="24" fill="var(--accent)" />
        {/* handle */}
        <rect x="146" y="32" width="80" height="16" fill="oklch(0.30 0.005 60)" rx="2" />
        <circle cx="170" cy="40" r="2.4" fill="var(--bg)" />
        <circle cx="196" cy="40" r="2.4" fill="var(--bg)" />
      </g>
    </svg>
  );
}

function AnimBottle() {
  return (
    <svg viewBox="0 0 100 220" className="anim-icon" aria-label="fill">
      {/* cap */}
      <rect x="40" y="0" width="20" height="20" fill="oklch(0.30 0.005 60)" />
      {/* neck */}
      <rect x="42" y="20" width="16" height="38" fill="var(--accent)" />
      {/* body outline */}
      <path d="M 42 58 Q 20 76 20 96 L 20 200 Q 20 216 36 216 L 64 216 Q 80 216 80 200 L 80 96 Q 80 76 58 58 Z"
            fill="none" stroke="var(--accent)" strokeWidth="2" />
      {/* liquid level rising — clipped to bottle body */}
      <clipPath id="bottle-body-clip">
        <path d="M 42 58 Q 20 76 20 96 L 20 200 Q 20 216 36 216 L 64 216 Q 80 216 80 200 L 80 96 Q 80 76 58 58 Z" />
      </clipPath>
      <g clipPath="url(#bottle-body-clip)">
        <rect className="bo-level" x="18" y="216" width="64" height="0" fill="var(--accent)" />
      </g>
      {/* label X */}
      <rect x="28" y="120" width="44" height="50" fill="oklch(0.93 0.005 60)" />
      <line x1="40" y1="136" x2="60" y2="156" stroke="var(--bg)" strokeWidth="2.4" />
      <line x1="60" y1="136" x2="40" y2="156" stroke="var(--bg)" strokeWidth="2.4" />
    </svg>
  );
}

function AnimCassette() {
  return (
    <svg viewBox="0 0 300 200" className="anim-icon" aria-label="wind">
      <rect x="10" y="10" width="280" height="180" rx="6" fill="none" stroke="var(--accent)" strokeWidth="3" />
      {[90, 210].map((cx, i) => (
        <g key={i} className={`cs-reel cs-reel-${i}`} style={{transformOrigin: `${cx}px 92px`}}>
          <circle cx={cx} cy="92" r="36" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <circle cx={cx} cy="92" r="6" fill="var(--accent)" />
          <line x1={cx} y1="60" x2={cx} y2="72" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx} y1="112" x2={cx} y2="124" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx - 32} y1="92" x2={cx - 20} y2="92" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx + 20} y1="92" x2={cx + 32} y2="92" stroke="var(--accent)" strokeWidth="2.4" />
        </g>
      ))}
      <line x1="126" y1="92" x2="174" y2="92" stroke="var(--accent)" strokeWidth="2" />
      <rect x="64" y="156" width="172" height="20" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
    </svg>
  );
}

function AnimHourglass() {
  return (
    <svg viewBox="0 0 100 220" className="anim-icon" aria-label="drain">
      <g className="hg-frame">
        <line x1="18" y1="10" x2="82" y2="10" stroke="var(--accent)" strokeWidth="3" />
        <line x1="18" y1="210" x2="82" y2="210" stroke="var(--accent)" strokeWidth="3" />
        <path d="M 24 12 L 76 12 L 50 110 L 76 208 L 24 208 L 50 110 Z"
              fill="none" stroke="var(--accent)" strokeWidth="2.4" />
        <clipPath id="hg-top-clip">
          <path d="M 24 12 L 76 12 L 50 110 Z" />
        </clipPath>
        <clipPath id="hg-bottom-clip">
          <path d="M 24 208 L 76 208 L 50 110 Z" />
        </clipPath>
        {/* sand — top */}
        <g clipPath="url(#hg-top-clip)">
          <rect className="hg-top-sand" x="22" y="12" width="56" height="96" fill="var(--accent)" />
        </g>
        {/* sand — bottom */}
        <g clipPath="url(#hg-bottom-clip)">
          <rect className="hg-bot-sand" x="22" y="208" width="56" height="0" fill="var(--accent)" />
        </g>
        {/* falling stream */}
        <line className="hg-stream" x1="50" y1="100" x2="50" y2="148" stroke="var(--accent)" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

const ANIM_METAPHOR_MAP = {
  razor:     AnimRazor,
  shotgun:   AnimShotgun,
  capsule:   AnimCapsule,
  noose:     AnimNoose,
  tablets:   AnimTablets,
  match:     AnimMatch,
  knife:     AnimKnife,
  bottle:    AnimBottle,
  cassette:  AnimCassette,
  hourglass: AnimHourglass,
};

const ANIM_METAPHOR_LABELS = {
  razor:     "M·01 / CUT",
  shotgun:   "M·02 / TRIGGER",
  capsule:   "M·03 / DOSE",
  noose:     "M·04 / SUSPEND",
  tablets:   "M·05 / DECAY",
  match:     "M·06 / IGNITE",
  knife:     "M·07 / SPLICE",
  bottle:    "M·08 / FILL",
  cassette:  "M·09 / WIND",
  hourglass: "M·10 / DRAIN",
};

const ANIM_METAPHOR_SUB = {
  razor:     "splicing tape, opening a vein",
  shotgun:   "envelope trigger, point blank",
  capsule:   "the amount, swallowed whole",
  noose:     "a held chord, a held breath",
  tablets:   "release time, slow release",
  match:     "ignite the signal, ignite the body",
  knife:     "razor-blade edit, the sharper cut",
  bottle:    "fill the buffer, fill the glass",
  cassette:  "wind the tape, wind the watch",
  hourglass: "drain the signal, drain the hour",
};

Object.assign(window, {
  AnimRazor, AnimShotgun, AnimCapsule, AnimNoose, AnimTablets,
  AnimMatch, AnimKnife, AnimBottle, AnimCassette, AnimHourglass,
  ANIM_METAPHOR_MAP, ANIM_METAPHOR_LABELS, ANIM_METAPHOR_SUB,
});
