/* SYSTEM SUICIDE — single-module product page.
   Reads ?m=<slug> from URL, looks the module up in MODULES + PRODUCT_PAGES,
   and renders either a full detail page (is-my / and-my) or a CLASSIFIED
   placeholder for the rest. */

function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("m") || "last-night";
}

function ProductBreadcrumb({ module: m }) {
  return (
    <div className="pp-breadcrumb">
      <a href="index.html">← System catalogue</a>
      <span className="sep">/</span>
      <span className="here">M·{m.idx} · {m.name}</span>
    </div>
  );
}

function ProductHeader({ module: m }) {
  const isShipping = m.phase.includes("SHIP");
  return (
    <header className="pp-header">
      <div className="pp-meta">
        <span className="t-eyebrow">M·{m.idx}</span>
        <span className="t-eyebrow">— {m.fn}</span>
        <span className="t-eyebrow">{m.hp} HP</span>
        <span className={"t-eyebrow " + (isShipping ? "red" : "")}>{m.phase}</span>
      </div>
      <h1 className="pp-title">{m.name}</h1>
      <div className="pp-line"></div>
    </header>
  );
}

function ClassifiedBody({ module: m }) {
  return (
    <section className="pp-classified">
      <div className="cls-stamp">
        <span className="cls-mark">▣</span>
        <span>CLASSIFIED</span>
        <span className="cls-sep">·</span>
        <span>{m.phase} · release scheduled</span>
      </div>

      <p className="cls-blurb">
        This module is under embargo. Details — physical core, signal chain,
        controls and exchange components — are withheld until ship.
        <br/>
        For pre-order interest, write to <a href="mailto:workshop@systemsuicide.cc">workshop@systemsuicide.cc</a>.
      </p>

      <div className="cls-block">
        <span className="cls-key">Physical core</span>
        <RedactionBars lines={6} />
      </div>

      <div className="cls-block">
        <span className="cls-key">Signal chain</span>
        <RedactionBars lines={5} />
      </div>

      <div className="cls-block">
        <span className="cls-key">Controls</span>
        <RedactionBars lines={4} />
      </div>

      <div className="cls-block">
        <span className="cls-key">Connection to the system</span>
        <RedactionBars lines={3} />
      </div>
    </section>
  );
}

function StatsTable({ stats }) {
  return (
    <div className="pp-stats">
      {stats.map((s, i) => (
        <div key={i} className="pp-stat-row">
          <span className="k">{s.k}</span>
          <span className="v">{s.v}</span>
        </div>
      ))}
    </div>
  );
}

function ControlsTable({ rows }) {
  return (
    <div className="pp-controls">
      <div className="pp-controls-head">
        <span>Control</span>
        <span>Function</span>
        <span>CV</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="pp-controls-row">
          <span className="ctrl">{r.ctrl}</span>
          <span className="fn">{r.fn}</span>
          <span className="cv">{r.cv ? "✓" : "—"}</span>
        </div>
      ))}
    </div>
  );
}

function SigChain({ lines }) {
  return (
    <pre className="pp-sigchain">{lines.join("\n")}</pre>
  );
}

function RevealedBody({ module: m, detail }) {
  return (
    <React.Fragment>
      <section className="pp-quote-row">
        <p className="pp-quote">"{detail.quote}"</p>
        <p className="pp-intro">{detail.intro}</p>
      </section>

      <section className="pp-two-col">
        <div className="left">
          <h3 className="pp-h">Specs</h3>
          <StatsTable stats={detail.stats} />
        </div>
        <div className="right">
          <h3 className="pp-h">Physical core</h3>
          {detail.physical.map((p, i) => <p key={i} className="pp-p">{p}</p>)}
        </div>
      </section>

      <section className="pp-block">
        <h3 className="pp-h">Signal chain</h3>
        <SigChain lines={detail.sigchain} />
      </section>

      <section className="pp-block">
        <h3 className="pp-h">Controls</h3>
        <ControlsTable rows={detail.controls} />
      </section>

      {detail.remote ? (
        <section className="pp-block">
          <h3 className="pp-h">The pilot remote</h3>
          <p className="pp-p">{detail.remote.blurb}</p>
          <pre className="pp-sigchain">{detail.remote.layout.join("\n")}</pre>
        </section>
      ) : null}

      <section className="pp-block">
        <h3 className="pp-h">Uses</h3>
        <ul className="pp-uses">
          {detail.uses.map((u, i) => (
            <li key={i}><XMark size={14} /> <span>{u}</span></li>
          ))}
        </ul>
      </section>

      <section className="pp-cta">
        <a className="btn primary" href={`mailto:workshop@systemsuicide.cc?subject=Pre-order ${m.name}`}>
          <span>Pre-order — write to workshop</span><span className="arrow">→</span>
        </a>
        <a className="btn" href="index.html#catalog">
          <span>Back to catalogue</span><span className="arrow">→</span>
        </a>
      </section>
    </React.Fragment>
  );
}

function NeighbourNav({ module: m }) {
  const i = MODULES.findIndex((x) => x.slug === m.slug);
  const prev = MODULES[(i - 1 + MODULES.length) % MODULES.length];
  const next = MODULES[(i + 1) % MODULES.length];
  return (
    <nav className="pp-neighbours">
      <a href={`module.html?m=${prev.slug}`} className="prev">
        <div className="dir">← Previous · M·{prev.idx}</div>
        <div className="name">{prev.name}</div>
      </a>
      <a href={`module.html?m=${next.slug}`} className="next">
        <div className="dir">Next · M·{next.idx} →</div>
        <div className="name">{next.name}</div>
      </a>
    </nav>
  );
}

function ProductPage({ slug }) {
  const m = MODULES.find((x) => x.slug === slug);
  if (!m) {
    return (
      <main className="pp">
        <div className="shell">
          <h1 className="pp-title">404 / no such module</h1>
          <p className="pp-p">
            The slug "{slug}" does not exist in the catalogue.
            <br/><a href="index.html">← Back to system</a>
          </p>
        </div>
      </main>
    );
  }

  const detail = PRODUCT_PAGES[slug];
  const isShipping = m.phase.includes("SHIP");

  return (
    <main className="pp">
      <div className="shell">
        <ProductBreadcrumb module={m} />
        <ProductHeader module={m} />

        {detail ? <RevealedBody module={m} detail={detail} /> : <ClassifiedBody module={m} />}

        <NeighbourNav module={m} />
      </div>
    </main>
  );
}

Object.assign(window, {
  ProductPage, getSlugFromURL,
});
