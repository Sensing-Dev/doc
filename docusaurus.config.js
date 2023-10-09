// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sensing-Dev Doc',
  tagline: 'You can find startup guide, tutorials, Q&A, and support!',
  favicon: 'img/tentative-icon.png',

  organizationName: 'Sensing-Dev',
  projectName: 'doc',
  // Set the production url of your site here
  url: 'https://${organizationName}.github.io ',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/${projectName}/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
      },
      ja: {
        label: '日本語',
        direction: 'ltr',
        htmlLang: 'ja',
        calendar: 'gregory',
      },
    }
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Sensing-Dev',
        logo: {
          alt: 'Sensing-Dev Logo',
          src: 'img/tentative-icon.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'defaultSidebar',
            position: 'left',
            label: 'Guide',
          },
          // blog content
          {to: '/blog', label: 'Update Logs', position: 'left'},
          // github
          {
            href: 'https://github.com/orgs/Sensing-Dev/repositories',
            label: 'GitHub',
            position: 'right',
          },
          { type: 'localeDropdown' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guide',
            items: [
              {
                label: 'Top Page',
                to: '/'
              },
              {
                label: 'Grossary',
                to: '/cross-reference'
              },
              {
                label: 'Update log',
                to: '/blog'
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Forum',
                href: 'https://github.com/orgs/Sensing-Dev/discussions',
              },
            ],
          },
          {
            title: 'Other project',
            items: [
              {
                label: 'GitHub organization',
                href: 'https://github.com/orgs/Sensing-Dev/repositories',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sensinv-Dev.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
