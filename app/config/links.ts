export type LinkType = 'collection' | 'static' | 'comingSoon';

export interface SiteLink {
  type: LinkType;
  title: string;
  handle?: string;
  url?: string;
  fallbackTitle?: string;
}

export const NAV_LINKS: SiteLink[] = [
  {type: 'collection', handle: 'trail-running', title: 'Trail Running'},
  {type: 'collection', handle: 'road-running', title: 'Road Running'},
  {type: 'collection', handle: 'ultralight', title: 'Ultralight'},
  {type: 'static', title: 'Run Club', url: '/run-club', handle: 'run-club'},
  {type: 'comingSoon', title: 'Blog', handle: 'blog', url: '/blog'},
];

export const FOOTER_LINKS: SiteLink[] = [
  {type: 'static', title: 'FAQ', url: '/faq', handle: 'faq'},
  {type: 'static', title: 'Careers', url: '/careers', handle: 'careers'},
  {type: 'static', title: 'Run Club', url: '/run-club', handle: 'run-club'},
  {type: 'comingSoon', title: 'Blog', handle: 'blog', url: '/blog'},
  {type: 'comingSoon', title: 'Sustainability', handle: 'sustainability', url: '/sustainability'},
];
