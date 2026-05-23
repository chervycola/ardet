import { Fragment, type ReactNode } from 'react';
import { useT, LanguageToggle } from './i18n';
import { MODULES, CARTRIDGES, PATCHES } from './data';
import {
  AmexRazorBlade,
  BarbedDivider,
  HeroMark,
  RazorScratch,
  RazorSlash,
  TallyCounter,
  XMark,
} from './motifs';
import type { HeroIcon } from './types';

export function RedactionBars({ lines = 4 }: { lines?: number }) {
  const rng = (i: number, j: number) => {
    const s = Math.sin(i * 91.3 + j * 17.7) * 10000;
    return s - Math.floor(s);
  };
  return (
    <div className="redaction">
      {Array.from({ length: lines }).map((_unused, i) => {
        const segs = 2 + Math.floor(rng(i, 0) * 3);
        return (
          <div key={i} className="redact-line">
            {Array.from({ length: segs }).map((_unused2, j) => {
              const w = 12 + Math.floor(rng(i, j + 1) * 70);
              const isRed = (i * segs + j) % 5 === 2;
              return (
                <span
                  key={j}
                  className={'redact-seg' + (isRed ? ' red' : '')}
                  style={{ width: `${w}%` }}
                ></span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function TopBar() {
  const t = useT();
  return (
    <header className="topbar">
      <div className="shell row">
        <a className="brand" href="index.html">
          <span className="dot"></span>
          <span>SYSTEM</span>
          <span style={{ marginLeft: 10, display: 'inline-block', width: 64, verticalAlign: 'middle' }}>
            <RazorScratch width={64} />
          </span>
        </a>
        <nav>
          <a href="index.html#chain">{t('nav_signal_chain')}</a>
          <a href="index.html#catalog">{t('nav_modules')}</a>
          <a href="index.html#last-night">{t('nav_last_night')}</a>
          <a href="index.html#patches">{t('nav_patches')}</a>
          <a href="index.html#manifesto">{t('nav_manifesto')}</a>
          <a href="index.html#contact">{t('nav_contact')}</a>
        </nav>
        <div className="cart">
          <LanguageToggle />
          <span className="live">{t('top_workshop')}</span>
          <span>EUR</span>
          <span>{t('top_cart')} [0]</span>
        </div>
      </div>
    </header>
  );
}

export function Hero({ icon }: { icon: HeroIcon }) {
  const t = useT();
  const link = (slug: string, label: string, extraClass?: string): ReactNode => (
    <a href={`module.html?m=${slug}`} className={'mlink' + (extraClass ? ' ' + extraClass : '')}>
      {label}
    </a>
  );
  const blurb = t('hero_blurb');
  const strongTxt = t('hero_blurb_strong');
  const blurbParts = blurb.split(/\{strong\}.*?\{\/strong\}/);
  return (
    <section className="hero">
      <div className="shell">
        <div className="hero-eyebrow">
          <span className="t-eyebrow">
            {t('hero_lot')} <span className="lot">№001·000·001</span>
          </span>
          <span className="t-eyebrow" style={{ textAlign: 'center' }}>
            {t('hero_synthesis')}
          </span>
          <span className="t-eyebrow">{t('hero_n_modules')}</span>
          <span className="t-eyebrow">{t('hero_format')}</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-word">SYSTEM</span>
          {icon === 'amex' ? (
            <div className="hero-razor-corner" aria-hidden="false">
              <AmexRazorBlade />
            </div>
          ) : null}
        </h1>
        <HeroMark icon={icon} />

        <div className="hero-row">
          <div className="poem">
            {link('i-show-you-light', 'I SHOW YOU LIGHT')}<br />
            {link('body-blood-and-salt', 'BODY BLOOD AND SALT')}<br />
            {link('all-bones-dust', 'ALL BONES DUST')}<br />
            <span className="dim">— {link('be-careful', 'BE CAREFUL', 'dim')} —</span><br />
            {link('fuck-abandoned-sleep', 'FUCK ABANDONED SLEEP')}<br />
            <span className="red">
              {link('is-my', 'IS MY', 'red')} {link('last-day', 'LAST DAY', 'red')}<br />
              {link('and-my', 'AND MY', 'red')} {link('last-night', 'LAST NIGHT', 'red')}
            </span>
          </div>

          <p className="blurb">
            {blurbParts[0]}
            <strong>{strongTxt}</strong>
            {blurbParts[1]}
          </p>

          <div className="hero-cta">
            <a className="btn primary" href="#catalog">
              <span>{t('cta_catalogue')}</span>
              <span className="arrow">→</span>
            </a>
            <a className="btn" href="module.html?m=last-night">
              <span>{t('cta_last_night')}</span>
              <span className="arrow">→</span>
            </a>
            <a className="btn" href="#chain">
              <span>{t('cta_read_chain')}</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CounterStrip() {
  const t = useT();
  return (
    <section className="counter">
      <div
        className="shell"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}
      >
        <div className="label">
          <span>{t('counter_days')} / </span>
          <span className="red">{t('counter_burned')}</span>
          <span> / </span>
          <span className="red">{t('counter_ships')}</span>
        </div>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <TallyCounter count={0} />
        </div>
      </div>
    </section>
  );
}

export function SignalChain() {
  const t = useT();
  return (
    <section className="signal" id="chain">
      <div className="shell">
        <div className="tag-rule">
          <span className="dot"></span>
          <span>{t('sig_tag')}</span>
          <span className="spacer"></span>
          <span>{t('sig_fig')}</span>
        </div>

        <h2 style={{ marginTop: 48 }}>
          {t('sig_h_a')}<br />
          {t('sig_h_b')}<br />
          <span style={{ color: 'var(--accent)' }}>{t('sig_h_c')}</span>
        </h2>

        <div className="signal-grid">
          {MODULES.map((m) => (
            <a
              key={m.idx}
              className={'signal-node' + (m.flagship ? ' flag' : '')}
              href={`module.html?m=${m.slug}`}
            >
              <div className="num">{m.idx}</div>
              <div className="pin"></div>
              <div className="name">{m.name}</div>
              <div className="fn">{m.fn}</div>
            </a>
          ))}
        </div>

        <div className="signal-foot">
          <span>{t('sig_foot_in')}</span>
          <span className="arrow">{t('sig_foot_arrow')}</span>
          <span>{t('sig_foot_out')}</span>
        </div>
      </div>
    </section>
  );
}

export function Catalog() {
  return (
    <section className="catalog" id="catalog">
      <div className="shell">
        <div className="cat-head">
          <h2>
            Catalogue<br />2026 — 2030
          </h2>
          <div className="meta">
            9 modules · ~144 HP · Be Careful + And My TBD<br />
            Eurorack/pedal · ±12 V<br />
            Hand-built · Moscow
          </div>
        </div>

        <div className="cat-grid">
          {MODULES.map((m) => (
            <a
              key={m.idx}
              className={
                'module' + (m.flagship ? ' flagship' : '') + (m.redacted ? ' redacted' : '')
              }
              href={`module.html?m=${m.slug}`}
            >
              <div className="top">
                <span className="idx">M·{m.idx}</span>
                <span
                  className={'phase-inline' + (m.phase.includes('SHIP') ? ' ship' : '')}
                >
                  {m.phase}
                </span>
                <span className="hp">{m.hp === 'TBD' ? 'TBD' : `${m.hp} HP`}</span>
              </div>
              <h3 className="name">{m.name}</h3>
              <div className="fn">— {m.fn}</div>
              <div className="core">
                {m.redacted ? (
                  <Fragment>
                    <span className="key">Physical core · CLASSIFIED</span>
                    <RedactionBars lines={4} />
                  </Fragment>
                ) : (
                  <Fragment>
                    <span className="key">Physical core</span>
                    {m.core}
                  </Fragment>
                )}
              </div>
              <span className="card-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LastNight() {
  const t = useT();
  return (
    <section className="catalog" id="last-night" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div className="flagship-block">
          <div className="left">
            <div className="ey">{t('ln_eyebrow')}</div>
            <h2>
              {t('ln_h_a')}<br />{t('ln_h_b')}
            </h2>
            <p className="quote">{t('ln_quote')}</p>

            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--fg-2)',
                marginBottom: 32,
                maxWidth: '42ch',
              }}
            >
              {t('ln_desc')}
            </p>

            <div className="specs">
              <div className="row"><span className="k">{t('ln_spec_format')}</span><span className="v">{t('ln_spec_format_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_power')}</span><span className="v">{t('ln_spec_power_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_io')}</span><span className="v">{t('ln_spec_io_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_pickups')}</span><span className="v">{t('ln_spec_pickups_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_exciter')}</span><span className="v">{t('ln_spec_exciter_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_carts')}</span><span className="v">{t('ln_spec_carts_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_price')}</span><span className="v">{t('ln_spec_price_v')}</span></div>
              <div className="row"><span className="k">{t('ln_spec_lead')}</span><span className="v">{t('ln_spec_lead_v')}</span></div>
            </div>

            <div style={{ marginTop: 36, display: 'flex', gap: 12 }}>
              <a
                className="btn primary"
                href="module.html?m=last-night"
                style={{
                  padding: '16px 22px',
                  border: '1px solid var(--accent)',
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {t('ln_preorder')}
              </a>
              <a
                className="btn"
                href="#"
                style={{
                  padding: '16px 22px',
                  border: '1px solid var(--line)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {t('ln_schematic')}
              </a>
            </div>
          </div>

          <div className="right">
            <div className="tag-rule" style={{ marginBottom: 24 }}>
              <span className="dot"></span>
              <span>{t('ln_cart_lib')}</span>
              <span className="spacer"></span>
              <span>08</span>
            </div>
            <div className="cartridge-grid">
              {CARTRIDGES.map((c, i) => (
                <div key={i} className="cart">
                  <div className={'swatch ' + c.sw}>
                    <span>
                      {('0' + (i + 1)).slice(-2)} · {c.nm.split('/')[0].trim()}
                    </span>
                  </div>
                  <div className="label">
                    <span className="nm">{c.nm}</span>
                    <span className="rt">{c.rt}</span>
                  </div>
                  <div className="ch">{c.ch}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Patches() {
  const t = useT();
  return (
    <section className="patches" id="patches">
      <div className="shell">
        <h2>
          {t('pat_h_a')}<br />{t('pat_h_b')}
        </h2>
        <div className="sub">{t('pat_sub')}</div>

        <div className="patch-list">
          {PATCHES.map((p, i) => (
            <div key={i} className="patch">
              <span className="x"><XMark size={22} /></span>
              <div className="nm">
                {p.nm}
                <small>{p.sub}</small>
              </div>
              <span className="dur">{p.dur}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Manifesto() {
  const t = useT();
  return (
    <section className="manifesto" id="manifesto">
      <div
        className="shell"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 2.6fr)',
          gap: 56,
          alignItems: 'start',
        }}
      >
        <div>
          <div className="ey">{t('man_eyebrow')}</div>
          <h2>
            {t('man_h_a')}<br />{t('man_h_b')}<br />{t('man_h_c')}
          </h2>
        </div>
        <div>
          <p>{t('man_p1')}</p>
          <p>
            <strong>{t('man_p2_part1')}</strong>{t('man_p2_part2')}
          </p>
          <p>
            {t('man_p3')}{' '}
            <span style={{ color: 'var(--accent)' }}>{t('man_p3_red')}</span>
          </p>
          <div className="sig">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {t('man_sig_a')}
              <RazorScratch width={48} />
              {t('man_sig_b')}
            </span>
            <span>{t('man_sig_geo')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot" id="contact">
      <div className="barbed"><BarbedDivider /></div>
      <div className="shell">
        <div className="foot-grid">
          <div className="brand-block">
            SYSTEM
            <div className="foot-blade"><RazorSlash /></div>
            <span className="dim">2/ 9</span>
          </div>
          <div>
            <h3>Catalogue</h3>
            <ul>
              <li><a href="#catalog">All modules</a></li>
              <li><a href="#last-night">Last Night</a></li>
              <li><a href="#last-night">Cartridges</a></li>
              <li><a href="#">Schematics</a></li>
              <li><a href="#">Service</a></li>
            </ul>
          </div>
          <div>
            <h3>Workshop</h3>
            <ul>
              <li><a href="#manifesto">Manifesto</a></li>
              <li><a href="#">Studio visits</a></li>
              <li><a href="#">Live demos</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Lookbook</a></li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              <li><a href="mailto:workshop@systemsuicide.cc">workshop@systemsuicide.cc</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Bandcamp</a></li>
              <li><a href="#">Reddit · r/modular</a></li>
              <li><a href="#" className="help-line">Crisis lines · global</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            © 2026–203∞ SYSTEM
            <RazorScratch width={36} />
            / All instruments hand-built
          </span>
          <span className="center">РОССИЯ. ОРЁЛ-МОСКВА-ЗЕЛЕНОГРАД</span>
          <span className="right">END PAGE001-000-001</span>
        </div>
      </div>
    </footer>
  );
}
