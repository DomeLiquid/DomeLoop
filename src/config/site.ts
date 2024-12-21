import { Icons } from '@/components/icons';
import { env } from '@/env.mjs';
import { SiteConfig } from '@/types';

export const OPEN_SOURCE_URL = 'https://github.com/domeliquid';

export const siteConfig: SiteConfig = {
  name: 'DomeFi Loop',
  author: 'lixv',
  description:
    'DomeFi Loop is a decentralized lending protocol that enables users to borrow and lend assets with a wide range of stablecoins, cryptocurrencies, and derivatives.',
  keywords: ['Mixin', 'DomeFi', 'Lend', 'Borrow', 'Loop'],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: 'https://github.com/lixvyang',
  },
  headerLinks: [{ name: 'repo', href: OPEN_SOURCE_URL, icon: Icons.github }],
  links: {
    github: OPEN_SOURCE_URL,
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png?${new Date().getTime()}`,
};
