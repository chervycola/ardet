/* SYSTEM SUICIDE — root app. */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroIcon": "amex",
  "leftRail": "system",
  "rightRail": "rope-anim",
  "accent": "#c63a2a",
  "rails": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent live as a CSS variable.
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  return (
    <React.Fragment>
      <Rails left={t.leftRail} right={t.rightRail} enabled={t.rails} />

      <TopBar />
      <Hero icon={t.heroIcon} />
      <CounterStrip />
      <SignalChain />
      <Catalog />
      <LastNight />
      <Patches />
      <Lexicon />
      <Manifesto />
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero icon">
          <TweakSelect
            label="Method"
            value={t.heroIcon}
            options={["amex", "none", "razor", "shotgun", "capsule", "noose", "tablets", "match", "knife", "bottle", "cassette", "hourglass"]}
            onChange={(v) => setTweak("heroIcon", v)}
          />
        </TweakSection>

        <TweakSection label="Side rails">
          <TweakSelect
            label="Left"
            value={t.leftRail}
            options={["system", "razor", "rope", "x", "barbed", "tally", "rope-anim"]}
            onChange={(v) => setTweak("leftRail", v)}
          />
          <TweakSelect
            label="Right"
            value={t.rightRail}
            options={["rope-anim", "system", "razor", "rope", "x", "barbed", "tally"]}
            onChange={(v) => setTweak("rightRail", v)}
          />
          <TweakToggle
            label="Show rails"
            value={t.rails}
            onChange={(v) => setTweak("rails", v)}
          />
        </TweakSection>

        <TweakSection label="Accent">
          <TweakColor
            label="Accent"
            value={t.accent}
            options={["#c63a2a", "#e8e6df", "#a02525", "#d9501b", "#7a1e16"]}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<LangProvider><App /></LangProvider>);
