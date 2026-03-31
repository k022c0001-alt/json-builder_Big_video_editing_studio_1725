export type TemplateKey = 'blank' | 'database' | 'api' | 'userProfile' | 'settings'

export interface TemplateInfo {
  key: TemplateKey
  label: string
  icon: string
  description: string
  content: string
}

const TEMPLATE_CONTENT: Record<TemplateKey, string> = {
  blank: '',

  database: `# Project: Database Config
## Connection
- host: localhost
- port: 5432
- database: mydb
- username: admin
- password: secret

## Pool
- min: 2
- max: 10
- idleTimeoutMillis: 30000`,

  api: `# Project: API Endpoint
## Base Configuration
- baseUrl: https://api.example.com
- version: v1
- timeout: 5000

## Authentication
- type: Bearer
- headerName: Authorization

## Endpoints
- GET /users: Fetch all users
- POST /users: Create new user
- PUT /users/:id: Update user
- DELETE /users/:id: Delete user`,

  userProfile: `# Project: User Profile
## Personal Info
- firstName: John
- lastName: Doe
- email: john@example.com
- phone: +1-234-567-8900

## Address
- street: 123 Main St
- city: New York
- state: NY
- zip: 10001
- country: USA

## Preferences
- theme: dark
- language: en
- notifications: true`,

  settings: `# Project: Application Settings
## General
- appName: MyApp
- version: 1.0.0
- environment: production

## Features
- darkMode: true
- analytics: true
- socialSharing: true

## Limits
- maxUploadSize: 10485760
- maxConnections: 100
- requestTimeout: 30000`,
}

export const TEMPLATES: TemplateInfo[] = [
  {
    key: 'blank',
    label: 'Blank',
    icon: '📄',
    description: 'Start with an empty editor',
    content: TEMPLATE_CONTENT.blank,
  },
  {
    key: 'database',
    label: 'Database Config',
    icon: '🗄️',
    description: 'DB connection and pool settings',
    content: TEMPLATE_CONTENT.database,
  },
  {
    key: 'api',
    label: 'API Endpoint',
    icon: '🔌',
    description: 'REST API base config and endpoints',
    content: TEMPLATE_CONTENT.api,
  },
  {
    key: 'userProfile',
    label: 'User Profile',
    icon: '👤',
    description: 'Personal info, address and preferences',
    content: TEMPLATE_CONTENT.userProfile,
  },
  {
    key: 'settings',
    label: 'App Settings',
    icon: '⚙️',
    description: 'General app configuration object',
    content: TEMPLATE_CONTENT.settings,
  },
]
