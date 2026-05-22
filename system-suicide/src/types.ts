export interface Module {
  idx: string;
  slug: string;
  name: string;
  fn: string;
  hp: number | 'TBD';
  phase: string;
  redacted: boolean;
  core: string;
  flagship?: boolean;
}

export interface Cartridge {
  sw: string;
  nm: string;
  rt: string;
  ch: string;
}

export interface Patch {
  nm: string;
  sub: string;
  dur: string;
}

export interface StatRow {
  k: string;
  v: string;
}

export interface ControlRow {
  ctrl: string;
  fn: string;
  cv: boolean;
}

export interface RemoteSpec {
  blurb: string;
  layout: string[];
}

export interface ProductDetail {
  quote: string;
  intro: string;
  stats: StatRow[];
  physical: string[];
  sigchain: string[];
  controls: ControlRow[];
  remote?: RemoteSpec;
  uses: string[];
}

export type ProductPages = Record<string, ProductDetail>;

export type Lang = 'en' | 'ru';

export type RailKind =
  | 'system'
  | 'razor'
  | 'rope'
  | 'x'
  | 'barbed'
  | 'tally'
  | 'rope-anim';

export type HeroIcon =
  | 'amex'
  | 'none'
  | 'razor'
  | 'shotgun'
  | 'capsule'
  | 'noose'
  | 'tablets'
  | 'match'
  | 'knife'
  | 'bottle'
  | 'cassette'
  | 'hourglass';

export type MetaphorKey =
  | 'razor'
  | 'shotgun'
  | 'capsule'
  | 'noose'
  | 'tablets'
  | 'match'
  | 'knife'
  | 'bottle'
  | 'cassette'
  | 'hourglass';
