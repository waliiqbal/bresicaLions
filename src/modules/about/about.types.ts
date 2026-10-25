export interface AboutStat {
  label: string;
  value: string;
}

export interface CrestElement {
  title: string;
  subtitle?: string;
  /** Lines are split on "\n"; a "LABEL: text" line shows the label in gold. */
  text: string;
}

export interface Owner {
  name: string;
  /** Small gold line above the name. */
  kicker: string;
  paragraphs: string[];
  /** Large gold closing lines. */
  closing: string[];
  /** Sign-off line under the closing text. */
  signature: string;
  image?: string;
}

/** Everything the admin can edit on the About Us page and the home page intro. */
export interface AboutContent {
  /** Home page intro. */
  heading: string;
  paragraphs: string[];
  image: string;
  stats: AboutStat[];
  /** About Us page. */
  history: string[];
  /** Short closing lines shown in large gold text under the history. */
  historyClosing: string[];
  historyImage: string;
  owner: Owner;
  crestIntro: string;
  crestElements: CrestElement[];
  mission: string;
  vision: string;
}

/** The three pictures, so the admin form knows which ones are saved uploads. */
export type AboutImageKey = "image" | "historyImage" | "ownerImage";

export interface AboutForAdmin {
  content: AboutContent;
  /** Cloudinary ids of the uploaded pictures (missing = default picture). */
  publicIds: Partial<Record<AboutImageKey, string>>;
  /** True once the admin has saved something. */
  customized: boolean;
}
