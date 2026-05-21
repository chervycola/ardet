/* SYSTEM SUICIDE — module page mount.
   Reads URL slug, mounts a minimal app: top bar + product page + footer. */

const { useEffect: usePEffect } = React;

const PP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "leftRail": "system",
  "rightRail": "rope-anim",
  "accent": "#c63a2a",
  "rails": true
}/*EDITMODE-END*/;

function PPApp() {
  const [t, setTweak] = useTweaks(PP_TWEAK_DEFAULTS);
  const slug = getSlugFromURL();

  usePEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  // Set the document title from the resolved module
  usePEffect(() => {
    const m = MODULES.find((x) => x.slug === slug);
    if (m) document.title = `SYSTEM — ${m.name}`;
  }, [slug]);

  return (
    <React.Fragment>
      <Rails left={t.leftRail} right={t.rightRail} enabled={t.rails} />

      <TopBar />
      <ProductPage slug={slug} />
      <Footer />

      <TweaksPanel title="Tweaks">
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

const ppRoot = ReactDOM.createRoot(document.getElementById("root"));
ppRoot.render(<LangProvider><PPApp /></LangProvider>);
