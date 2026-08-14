export type SocialLink = {
  label: string;
  url: string;
};

export type SiteSettings = {
  name: string;
  role: string;
  tagline: string;
  email: string;
  location: string;
  socials: SocialLink[];
  resumePdfUrl?: string;
  summary: string;
  /** Movie-poster image shown beside Experiences on Home */
  experiencePoster?: string;
};

export type Project = {
  _id: string;
  title: string;
  slug: string;
  /** Movie-poster style image for Netflix rows / work cards */
  cover: string;
  /** Wide hero image on project detail page */
  detailCover?: string;
  /** Extra images shown in the project gallery */
  gallery?: string[];
  preview?: string;
  tags: string[];
  excerpt: string;
  body: string;
  featured: boolean;
  year: string;
  role: string;
  client?: string;
  liveUrl?: string;
};

export type Skill = {
  _id: string;
  name: string;
  category: string;
  level: number;
};

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Freelance";

export type WorkMode = "On-site" | "Hybrid" | "Remote";

export type Experience = {
  _id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  employmentType: EmploymentType;
  workMode: WorkMode;
  companyLogo?: string;
  description: string;
  highlights: string[];
};

export type Service = {
  _id: string;
  title: string;
  description: string;
  deliverables: string[];
  icon?: string;
};

export type ActivityItem = {
  _id: string;
  type: "ship" | "speak" | "write" | "award" | "milestone";
  title: string;
  date: string;
  summary: string;
  /** Card thumbnail image */
  thumbnail?: string;
  link?: string;
};

export type Article = {
  _id: string;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  /** HTML or plain-text body rendered on the article detail page */
  body: string;
  /** Extra images shown in the More photos section */
  gallery?: string[];
  tags: string[];
  publishedAt: string;
};

export type AboutContent = {
  headline: string;
  bio: string[];
  portrait: string;
  values: { title: string; description: string }[];
};

export type Education = {
  _id: string;
  school: string;
  degree: string;
  year: string;
  details?: string;
};

export type PortfolioData = {
  settings: SiteSettings;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  services: Service[];
  activity: ActivityItem[];
  articles: Article[];
  about: AboutContent;
  education: Education[];
};
