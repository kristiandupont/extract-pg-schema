export default {
  title: 'extract-pg-schema',
  description: 'Extract Schema from Postgres Database',
  base: '/extract-pg-schema/',
  outDir: '../docs/',
  markdown: { attrs: { disable: true } }, // Required for api-extractor markdown (https://github.com/vuejs/vitepress/pull/664)
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'API', link: '/api/' },
          {
            text: 'extractSchemas',
            link: '/api/extract-pg-schema.extractschemas.html',
          },
          { text: 'Output', link: '/api/extract-pg-schema.schema.html' },
        ],
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/kristiandupont/extract-pg-schema',
      },
    ],
  },
};
