export interface Website {
  id: string;
  url: string;
  active: boolean;
}

export interface InputProps {
  url: string;
  setUrl: (url: string) => void;
  setWebsites: (websites: Website[] | ((prev: Website[]) => Website[])) => void;
  websites: Website[];
}

export interface WebsiteProps {
  website: Website;
  websites: Website[];
  setWebsites: (websites: Website[] | ((prev: Website[]) => Website[])) => void;
  isLast?: boolean;
}

export interface WebsitesProps {
  websites: Website[];
  setWebsites: (websites: Website[] | ((prev: Website[]) => Website[])) => void;
  url: string;
  setUrl: (url: string) => void;
}
