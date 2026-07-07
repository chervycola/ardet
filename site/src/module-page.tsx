import { Fragment } from 'react';
import { MODULES, PRODUCT_PAGES, PRODUCT_PAGES_RU, isNameRevealed } from './data';
import { useT, useLang } from './i18n';
import { XMark } from './motifs';
import { RedactionBars } from './sections';
import type {
  Module,
  ProductDetail,
  StatRow,
  ControlRow,
} from './types';

const WORKSHOP_EMAIL = 'workshop@systemsuicide.cc';

export function getSlugFromURL(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('m') ?? 'last-night';
}

function ProductBreadcrumb({ module: m }: { module: Module }) {
  const t = useT();
  return (
    <div className="pp-breadcrumb">
      <a href="index.html">{t('pp_back')}</a>
      <span className="sep">/</span>
      <span className="here">M·{m.idx} · <span className={isNameRevealed(m.slug) ? '' : 'blur-name'}>{m.name}</span></span>
    </div>
  );
}

function ProductHeader({ module: m }: { module: Module }) {
  const isShipping = m.phase.includes('SHIP');
  return (
    <header className="pp-header">
      <div className="pp-meta">
        <span className="t-eyebrow">M·{m.idx}</span>
        <span className="t-eyebrow">— {m.fn}</span>
        <span className="t-eyebrow">{m.hp === 'TBD' ? 'TBD' : `${m.hp} HP`}</span>
        <span className={'t-eyebrow ' + (isShipping ? 'red' : '')}>{m.phase}</span>
      </div>
      <h1 className={'pp-title' + (isNameRevealed(m.slug) ? '' : ' blur-name')}>{m.name}</h1>
      <div className="pp-line"></div>
    </header>
  );
}

function ClassifiedBody({ module: m }: { module: Module }) {
  const t = useT();
  const [before, after] = t('pp_embargo').split('{email}');
  return (
    <section className="pp-classified">
      <div className="cls-stamp">
        <span className="cls-mark">▣</span>
        <span>{t('pp_classified')}</span>
        <span className="cls-sep">·</span>
        <span>{m.phase} · {t('pp_release')}</span>
      </div>

      <p className="cls-blurb" style={{ whiteSpace: 'pre-line' }}>
        {before}
        <a href={`mailto:${WORKSHOP_EMAIL}`}>{WORKSHOP_EMAIL}</a>
        {after}
      </p>

      <div className="cls-block">
        <span className="cls-key">{t('pp_h_core')}</span>
        <RedactionBars lines={6} />
      </div>

      <div className="cls-block">
        <span className="cls-key">{t('pp_h_chain')}</span>
        <RedactionBars lines={5} />
      </div>

      <div className="cls-block">
        <span className="cls-key">{t('pp_h_controls')}</span>
        <RedactionBars lines={4} />
      </div>

      <div className="cls-block">
        <span className="cls-key">{t('pp_h_connect')}</span>
        <RedactionBars lines={3} />
      </div>
    </section>
  );
}

function StatsTable({ stats }: { stats: StatRow[] }) {
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

function ControlsTable({ rows }: { rows: ControlRow[] }) {
  const t = useT();
  return (
    <div className="pp-controls">
      <div className="pp-controls-head">
        <span>{t('pp_col_control')}</span>
        <span>{t('pp_col_function')}</span>
        <span>{t('pp_col_cv')}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="pp-controls-row">
          <span className="ctrl">{r.ctrl}</span>
          <span className="fn">{r.fn}</span>
          <span className="cv">{r.cv ? '✓' : '—'}</span>
        </div>
      ))}
    </div>
  );
}

function SigChain({ lines }: { lines: string[] }) {
  return <pre className="pp-sigchain">{lines.join('\n')}</pre>;
}

function RevealedBody({ module: m, detail }: { module: Module; detail: ProductDetail }) {
  const t = useT();
  return (
    <Fragment>
      <section className="pp-quote-row">
        <p className="pp-quote">"{detail.quote}"</p>
        <p className="pp-intro">{detail.intro}</p>
      </section>

      <section className="pp-two-col">
        <div className="left">
          <h3 className="pp-h">{t('pp_h_specs')}</h3>
          <StatsTable stats={detail.stats} />
        </div>
        <div className="right">
          <h3 className="pp-h">{t('pp_h_core')}</h3>
          {detail.physical.map((p, i) => (
            <p key={i} className="pp-p">{p}</p>
          ))}
        </div>
      </section>

      <section className="pp-block">
        <h3 className="pp-h">{t('pp_h_chain')}</h3>
        <SigChain lines={detail.sigchain} />
      </section>

      <section className="pp-block">
        <h3 className="pp-h">{t('pp_h_controls')}</h3>
        <ControlsTable rows={detail.controls} />
      </section>

      {detail.remote ? (
        <section className="pp-block">
          <h3 className="pp-h">{t('pp_h_remote')}</h3>
          <p className="pp-p">{detail.remote.blurb}</p>
          <pre className="pp-sigchain">{detail.remote.layout.join('\n')}</pre>
        </section>
      ) : null}

      {detail.cartridges ? (
        <section className="pp-block">
          <h3 className="pp-h">{t('pp_h_cartridges')}</h3>
          <ul className="pp-uses">
            {detail.cartridges.map((c, i) => (
              <li key={i}><XMark size={14} /> <span>{c}</span></li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="pp-block">
        <h3 className="pp-h">{t('pp_h_uses')}</h3>
        <ul className="pp-uses">
          {detail.uses.map((u, i) => (
            <li key={i}><XMark size={14} /> <span>{u}</span></li>
          ))}
        </ul>
      </section>

      {detail.safety ? (
        <section className="pp-block">
          <h3 className="pp-h">{t('pp_h_safety')}</h3>
          <ul className="pp-uses">
            {detail.safety.map((s, i) => (
              <li key={i}><XMark size={14} /> <span>{s}</span></li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="pp-cta">
        <a
          className="btn primary"
          href={`mailto:${WORKSHOP_EMAIL}?subject=Pre-order ${m.name}`}
        >
          <span>{t('pp_cta_preorder')}</span>
          <span className="arrow">→</span>
        </a>
        <a className="btn" href="index.html#catalog">
          <span>{t('pp_cta_back')}</span>
          <span className="arrow">→</span>
        </a>
      </section>
    </Fragment>
  );
}

function NeighbourNav({ module: m }: { module: Module }) {
  const t = useT();
  const i = MODULES.findIndex((x) => x.slug === m.slug);
  const prev = MODULES[(i - 1 + MODULES.length) % MODULES.length];
  const next = MODULES[(i + 1) % MODULES.length];
  return (
    <nav className="pp-neighbours">
      <a href={`module.html?m=${prev.slug}`} className="prev">
        <div className="dir">{t('pp_prev')}{prev.idx}</div>
        <div className={'name' + (isNameRevealed(prev.slug) ? '' : ' blur-name')}>{prev.name}</div>
      </a>
      <a href={`module.html?m=${next.slug}`} className="next">
        <div className="dir">{t('pp_next')}{next.idx} →</div>
        <div className={'name' + (isNameRevealed(next.slug) ? '' : ' blur-name')}>{next.name}</div>
      </a>
    </nav>
  );
}

export function ProductPage({ slug }: { slug: string }) {
  const t = useT();
  const { lang } = useLang();
  const m = MODULES.find((x) => x.slug === slug);
  if (!m) {
    return (
      <main className="pp">
        <div className="shell">
          <h1 className="pp-title">{t('pp_404_h')}</h1>
          <p className="pp-p">
            {t('pp_404_p_a')}{slug}{t('pp_404_p_b')}
            <br />
            <a href="index.html">{t('pp_404_back')}</a>
          </p>
        </div>
      </main>
    );
  }

  const detail =
    (lang === 'ru' ? PRODUCT_PAGES_RU[slug] : undefined) ?? PRODUCT_PAGES[slug];

  return (
    <main className="pp">
      <div className="shell">
        <div className="section-page">Page №002·000·{m.idx}</div>
        <ProductBreadcrumb module={m} />
        <ProductHeader module={m} />

        {detail ? (
          <RevealedBody module={m} detail={detail} />
        ) : (
          <ClassifiedBody module={m} />
        )}

        <NeighbourNav module={m} />
      </div>
    </main>
  );
}
