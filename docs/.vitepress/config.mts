import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Finance Tracker',
  description: 'Self-hosted personal finance tracking system documentation',
  base: '/docs/',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    siteTitle: 'Finance Tracker Docs',
    logo: undefined,

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/guide/architecture' },
      { text: 'Database', link: '/database/schema' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'Workflows', link: '/workflows/core-workflows' },
      { text: 'Deployment', link: '/deployment/docker' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview & Quickstart', link: '/guide/getting-started' },
          { text: 'System Architecture', link: '/guide/architecture' },
          { text: 'Configuration Reference', link: '/guide/configuration' }
        ]
      },
      {
        text: 'Database Architecture',
        items: [
          { text: 'Data Schema (14 Tables)', link: '/database/schema' },
          { text: 'Migrations & Seed Engine', link: '/database/migrations' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'API Overview & Standards', link: '/api/overview' },
          { text: 'Authentication & Session', link: '/api/auth' },
          { text: 'Wallets & Adjustments', link: '/api/wallets' },
          { text: 'Incomes & Sources', link: '/api/incomes' },
          { text: 'Spendings & Receipts', link: '/api/spendings' },
          { text: 'Budgets & Goals', link: '/api/budgets' },
          { text: 'Dashboard & Analytics', link: '/api/dashboard' },
          { text: 'Reports & Export', link: '/api/reports' }
        ]
      },
      {
        text: 'Financial Workflows',
        items: [
          { text: 'Core Financial Workflows', link: '/workflows/core-workflows' }
        ]
      },
      {
        text: 'Deployment & Operations',
        items: [
          { text: 'Docker & Compose Stack', link: '/deployment/docker' },
          { text: 'CI/CD & Image Pruning', link: '/deployment/ci-cd' },
          { text: 'Backup & Disaster Recovery', link: '/deployment/backup-restore' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Self-hosted Personal Finance Tracker Documentation',
      copyright: 'Production Ready & Fully Tested'
    }
  }
});
