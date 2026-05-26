import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { Lang } from './types';

type Dict = Record<string, string>;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
});

const TRANSLATIONS: Record<Lang, Dict> = {
  en: {
    nav_signal_chain: 'Signal chain',
    nav_modules: 'Modules',
    nav_last_night: 'Last Night',
    nav_patches: 'Patches',
    nav_manifesto: 'Manifesto',
    nav_contact: 'Contact',
    top_workshop: 'Workshop still open',
    top_cart: 'Cart',

    hero_lot: 'Page',
    hero_synthesis: 'From Russia with love',
    hero_n_modules: 'Dules',
    hero_format: 'Eurorack · 3U',
    hero_blurb:
      'Nine modules. Each one carries a {strong}physical core{/strong} — an oil-soaked disc, a brass weight on a carbon rod, a pyrex plate that can crack from its own resonance. Electronics serve the physics, never the opposite. Together they form a complete voice — generation, body, distortion, filter, modulation, mix, the burning day, and the cold night after.',
    hero_blurb_strong: 'physical core',
    cta_catalogue: 'Catalogue',
    cta_last_night: 'Last Night · pre-order',
    cta_read_chain: 'Read the signal chain',

    counter_days: 'Days since the system',
    counter_burned: 'prototypes burned',
    counter_ships: 'Next batch · December 2026',

    sig_tag: '',
    sig_fig: 'Fig. 01 / 09',
    sig_h_a: 'Signal',
    sig_h_b: 'chain.',
    sig_h_c: '',
    sig_foot_in: 'SOLVE',
    sig_foot_arrow: 'To be decomposed, divested of light and stone,\nvariable as the molecule, durable as the atom,\nheartless as the earth itself.',
    sig_foot_out: 'COAGULA',

    cat_h_a: 'Catalogue',
    cat_h_b: '2026 — 2030',
    cat_meta_1: '9 modules · ~144 HP · Be Careful + And My TBD',
    cat_meta_2: 'Eurorack/pedal · ±12 V',
    cat_meta_3: 'Hand-built · Moscow',
    cat_phys_core: 'Physical core',
    cat_classified: 'Physical core · CLASSIFIED',

    ln_eyebrow: 'M·09 / Flagship / Pre-order',
    ln_h_a: 'Last',
    ln_h_b: 'Night.',
    ln_quote: '"A post-apocalyptic resonator on swappable plates. A Geiger counter and an old gramophone."',
    ln_desc:
      'An analogue multi-effect workstation. A surface exciter drives a thin plate held in a cartridge — wood, stone, metal, glass, bone, jade. Two piezo pickups read the resonance from the other face. A solenoid damps. A feedback loop freezes. Each cartridge is a different room.',
    ln_spec_format: 'Format',
    ln_spec_format_v: 'Eurorack 40 HP / pedal',
    ln_spec_power: 'Power',
    ln_spec_power_v: '±12 V · 200 mA (450 peak)',
    ln_spec_io: 'I/O',
    ln_spec_io_v: 'Mono / stereo in (summed) · stereo out · 3.5 mm TS + sidechain',
    ln_spec_pickups: 'Pickups',
    ln_spec_pickups_v: '2 × piezo · in-module contact',
    ln_spec_exciter: 'Exciter',
    ln_spec_exciter_v: 'Dayton DAEX32Q-4 · 4 Ω',
    ln_spec_carts: 'Cartridges',
    ln_spec_carts_v: '6 ship · 6 phase 2',
    ln_spec_price: 'Price',
    ln_spec_price_v: '€ 3640 · all cartridges',
    ln_spec_lead: 'Lead time',
    ln_spec_lead_v: '3-4 months · made to order',
    ln_cart_lib: 'Cartridge library · phase 1 + phase 2',
    ln_preorder: 'Pre-order — €3640',
    ln_schematic: 'Schematic PDF',

    pat_h_a: 'Six ways',
    pat_h_b: 'to be heard.',
    pat_sub: '— Patch atlas · live-tested · February 2026',

    lex_h_a: 'Lexicon',
    lex_h_b: 'of methods.',
    lex_meta: '10 metaphors · one vocabulary\nfor synthesis and for its end\n— read both ways',

    man_eyebrow: '— Manifesto · v3.0',
    man_h_a: 'Electronics',
    man_h_b: 'serve the physics,',
    man_h_c: 'not the opposite.',
    man_p1:
      'We make instruments. Each one has a body — a thing that resonates, vibrates, heats, decays. The circuit board exists to feed the body and listen to its answer. When the body sings, the circuit gets out of the way.',
    man_p2_part1: 'No DSP. No screens. No presets.',
    man_p2_part2:
      ' The voice of the instrument is the voice of its material — wood, brass, glass, oil, light, skin. Each cartridge is a different room. Each pendulum keeps its own time. Each plate ages and the sound ages with it.',
    man_p3:
      'We ship slowly. We replace what breaks. We refuse to certify anything as silent.',
    man_p3_red: 'The system will fail eventually — that is the point.',
    man_sig_a: '— SYSTEM',
    man_sig_b: '',
    man_sig_geo: '',

    foot_modules: '/ 9 MODULES',
    foot_h_catalogue: 'Catalogue',
    foot_h_workshop: 'Workshop',
    foot_h_contact: 'Contact',
    foot_all_modules: 'All modules',
    foot_last_night: 'Last Night',
    foot_cartridges: 'Cartridges',
    foot_schematics: 'Schematics',
    foot_service: 'Service',
    foot_manifesto: 'Manifesto',
    foot_visits: 'Studio visits',
    foot_demos: 'Live demos',
    foot_press: 'Press',
    foot_lookbook: 'Lookbook',
    foot_ig: 'Instagram',
    foot_bc: 'Bandcamp',
    foot_reddit: 'Reddit · r/modular',
    foot_crisis: 'Crisis lines · global',
    foot_copyright: '© 2024–2026 SYSTEM',
    foot_handbuilt: '/ All instruments hand-built',
    foot_motto: '"The system will fail eventually."',
    foot_version: 'v3.0 / canonical brief / hash 25445',

    pp_back: '← System catalogue',
    pp_classified: 'CLASSIFIED',
    pp_release: 'release scheduled',
    pp_embargo:
      'This module is under embargo. Details — physical core, signal chain, controls and exchange components — are withheld until ship.\nFor pre-order interest, write to {email}.',
    pp_h_specs: 'Specs',
    pp_h_core: 'Physical core',
    pp_h_chain: 'Signal chain',
    pp_h_controls: 'Controls',
    pp_h_remote: 'The pilot remote',
    pp_h_uses: 'Uses',
    pp_h_cartridges: 'Cartridge library',
    pp_h_safety: 'Safety',
    pp_h_connect: 'Connection to the system',
    pp_col_control: 'Control',
    pp_col_function: 'Function',
    pp_col_cv: 'CV',
    pp_cta_preorder: 'Pre-order — write to workshop',
    pp_cta_back: 'Back to catalogue',
    pp_prev: '← Previous · M·',
    pp_next: 'Next · M·',
    pp_404_h: '404 / no such module',
    pp_404_p_a: 'The slug "',
    pp_404_p_b: '" does not exist in the catalogue.',
    pp_404_back: '← Back to system',
  },

  ru: {
    nav_signal_chain: 'Сигнальная цепь',
    nav_modules: 'Модули',
    nav_last_night: 'Last Night',
    nav_patches: 'Патчи',
    nav_manifesto: 'Манифест',
    nav_contact: 'Контакты',
    top_workshop: 'Мастерская пока работает',
    top_cart: 'Корзина',

    hero_lot: 'Page',
    hero_synthesis: 'From Russia with love',
    hero_n_modules: 'Dules',
    hero_format: 'Eurorack · 3U',
    hero_blurb:
      'Девять модулей. Каждый несёт {strong}физическое ядро{/strong} — пропитанный маслом диск, латунный груз на углеродном стержне, стеклянную пластину, которая трескается от собственного резонанса. Электроника обслуживает физику, а не наоборот. Вместе они образуют законченный голос — генерация, тело, искажение, фильтр, модуляция, микс, горящий день и холодная ночь после.',
    hero_blurb_strong: 'физическое ядро',
    cta_catalogue: 'Каталог',
    cta_last_night: 'Last Night · pre-order',
    cta_read_chain: 'Читать сигнальную цепь',

    counter_days: 'Дней с начала системы',
    counter_burned: 'прототипов сожжено',
    counter_ships: 'Следующая партия · декабрь 2026',

    sig_tag: '',
    sig_fig: 'Рис. 01 / 09',
    sig_h_a: 'Сигнальная',
    sig_h_b: 'цепь.',
    sig_h_c: '',
    sig_foot_in: 'SOLVE',
    sig_foot_arrow: 'Разложиться на составные части. Стать свободным от света и камня.\n  Стать изменчивым как молекула, прочным, как атом. Бездушным\n                          как сама земля',
    sig_foot_out: 'COAGULA',

    cat_h_a: 'Каталог',
    cat_h_b: '2026 — 2030',
    cat_meta_1: '9 модулей · ~144 HP · Be Careful + And My TBD',
    cat_meta_2: 'Eurorack/pedal · ±12 В',
    cat_meta_3: 'Ручная сборка · Москва',
    cat_phys_core: 'Физическое ядро',
    cat_classified: 'Физическое ядро · ЗАСЕКРЕЧЕНО',

    ln_eyebrow: 'M·09 / Флагман / Предзаказ',
    ln_h_a: 'Last',
    ln_h_b: 'Night.',
    ln_quote: '"Резонатор постапокалипсиса на сменных пластинах. Счётчик Гейгера и старый граммофон"',
    ln_desc:
      'Аналоговый комбайн-мультиэффектор. Surface-эксайтер раскачивает тонкую пластину в картридже — дерево, камень, металл, стекло, кость, нефрит. Два пьезо-датчика снимают резонанс с обратной стороны. Соленоид демпфирует. Feedback-петля замораживает. Каждый картридж — другая комната.',
    ln_spec_format: 'Формат',
    ln_spec_format_v: 'Eurorack 40 HP / pedal',
    ln_spec_power: 'Питание',
    ln_spec_power_v: '±12 В · 200 мА (450 пик)',
    ln_spec_io: 'I/O',
    ln_spec_io_v: 'Моно / стерео вход (суммируется) · стерео выход · 3.5 мм TS + sidechain',
    ln_spec_pickups: 'Снятие',
    ln_spec_pickups_v: '2 × пьезо · контакт в модуле',
    ln_spec_exciter: 'Эксайтер',
    ln_spec_exciter_v: 'Dayton DAEX32Q-4 · 4 Ω',
    ln_spec_carts: 'Картриджи',
    ln_spec_carts_v: '6 в продаже · 6 в Phase 2',
    ln_spec_price: 'Цена',
    ln_spec_price_v: '€ 3640 · все картриджи',
    ln_spec_lead: 'Срок',
    ln_spec_lead_v: '3-4 месяца · под заказ',
    ln_cart_lib: 'Библиотека картриджей · phase 1 + phase 2',
    ln_preorder: 'Предзаказ — €3640',
    ln_schematic: 'PDF со схемой',

    pat_h_a: 'Шесть способов',
    pat_h_b: 'быть услышанным.',
    pat_sub: '— Атлас патчей · протестировано вживую · февраль 2026',

    lex_h_a: 'Лексикон',
    lex_h_b: 'методов.',
    lex_meta: '10 метафор · один словарь\nдля синтеза и его конца\n— читается в обе стороны',

    man_eyebrow: '— Манифест · v3.0',
    man_h_a: 'Электроника',
    man_h_b: 'обслуживает физику,',
    man_h_c: 'а не наоборот.',
    man_p1:
      'Мы делаем инструменты. У каждого есть тело — то, что резонирует, вибрирует, нагревается, распадается. Плата существует, чтобы кормить тело и слушать его ответ. Когда тело поёт, схема уходит с дороги.',
    man_p2_part1: 'Никаких DSP. Никаких экранов. Никаких пресетов.',
    man_p2_part2:
      ' Голос инструмента — это голос материала: дерево, латунь, стекло, масло, свет, кожа. Каждый картридж — другая комната. Каждый маятник держит своё время. Каждая пластина стареет, и звук стареет вместе с ней.',
    man_p3:
      'Мы отгружаем медленно. Заменяем то, что ломается. Отказываемся сертифицировать что-либо как «бесшумное».',
    man_p3_red: 'Система рано или поздно даст сбой — в этом и смысл.',
    man_sig_a: '— SYSTEM',
    man_sig_b: '',
    man_sig_geo: '',

    foot_modules: '/ 9 МОДУЛЕЙ',
    foot_h_catalogue: 'Каталог',
    foot_h_workshop: 'Мастерская',
    foot_h_contact: 'Контакты',
    foot_all_modules: 'Все модули',
    foot_last_night: 'Last Night',
    foot_cartridges: 'Картриджи',
    foot_schematics: 'Схемы',
    foot_service: 'Сервис',
    foot_manifesto: 'Манифест',
    foot_visits: 'Посетить студию',
    foot_demos: 'Лайв-демо',
    foot_press: 'Пресса',
    foot_lookbook: 'Лукбук',
    foot_ig: 'Instagram',
    foot_bc: 'Bandcamp',
    foot_reddit: 'Reddit · r/modular',
    foot_crisis: 'Кризисные линии · global',
    foot_copyright: '© 2024–2026 SYSTEM',
    foot_handbuilt: '/ Все инструменты собраны вручную',
    foot_motto: '«Система рано или поздно даст сбой.»',
    foot_version: 'v3.0 / canonical brief / hash 25445',

    pp_back: '← К каталогу',
    pp_classified: 'ЗАСЕКРЕЧЕНО',
    pp_release: 'релиз запланирован',
    pp_embargo:
      'Модуль под эмбарго. Детали — физическое ядро, сигнальная цепь, контролы и сменные компоненты — закрыты до отгрузки.\nДля предзаказа пишите на {email}.',
    pp_h_specs: 'Спецификации',
    pp_h_core: 'Физическое ядро',
    pp_h_chain: 'Сигнальная цепь',
    pp_h_controls: 'Контролы',
    pp_h_remote: 'Пилотный пульт',
    pp_h_uses: 'Применение',
    pp_h_cartridges: 'Библиотека картриджей',
    pp_h_safety: 'Безопасность',
    pp_h_connect: 'Связь с системой',
    pp_col_control: 'Контрол',
    pp_col_function: 'Функция',
    pp_col_cv: 'CV',
    pp_cta_preorder: 'Предзаказ — написать в мастерскую',
    pp_cta_back: 'Вернуться в каталог',
    pp_prev: '← Назад · M·',
    pp_next: 'Дальше · M·',
    pp_404_h: '404 / нет такого модуля',
    pp_404_p_a: 'Slug «',
    pp_404_p_b: '» не найден в каталоге.',
    pp_404_back: '← Вернуться к системе',
  },
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('ss_lang');
      return stored === 'en' ? 'en' : 'ru';
    } catch {
      return 'ru';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ss_lang', lang);
    } catch {
      /* noop */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  const { lang } = useContext(LangContext);
  return (key: string): string => {
    const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  };
}

export function useLang() {
  return useContext(LangContext);
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={'lang-toggle' + (compact ? ' compact' : '')}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={'lang-opt' + (lang === 'en' ? ' active' : '')}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <span className="lang-sep">·</span>
      <button
        type="button"
        className={'lang-opt' + (lang === 'ru' ? ' active' : '')}
        onClick={() => setLang('ru')}
        aria-pressed={lang === 'ru'}
      >
        RU
      </button>
    </div>
  );
}
