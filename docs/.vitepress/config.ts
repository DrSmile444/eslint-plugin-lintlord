import { defineConfig } from 'vitepress';

function resolveBase(): string {
  if (!process.env.GITHUB_ACTIONS) {
    return '/';
  }

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

  if (!repo) {
    return '/';
  }

  return `/${repo}/`;
}

export default defineConfig({
  base: resolveBase(),
  title: 'ESLint Plugin Lintlord',
  description: 'A collection of useful ESLint rules for cleaner, more maintainable TypeScript code.',
  lastUpdated: true,
  cleanUrls: true,

  head: [['link', { rel: 'icon', href: `${resolveBase()}logo.svg` }]],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Get Started', link: '/getting-started' },
      { text: 'Rules', link: '/rules/' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Rules',
        items: [
          { text: 'Overview', link: '/rules/' },
          { text: 'no-inline-interface-object-types', link: '/rules/no-inline-interface-object-types' },
        ],
      },
      {
        text: 'Usage',
        items: [
          { text: 'Flat Config (ESLint v9+)', link: '/usage/flat-config' },
          { text: 'Legacy .eslintrc', link: '/usage/eslintrc' },
        ],
      },
      {
        text: 'Reference',
        items: [{ text: 'Changelog', link: '/reference/changelog' }],
      },
    ],

    search: { provider: 'local' },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/DrSmile444/eslint-plugin-lintlord',
      },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/eslint-plugin-lintlord',
      },
    ],
  },
});
