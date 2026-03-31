export interface TemplateDefinition {
  key: string
  label: string
  content: string
}

export const TEMPLATES: Record<string, string> = {
  databaseConfig: `# Database Config
## Connection
- host: localhost
- port: 5432
- database: myapp_db
- user: admin
- password: 

## Pool
- min: 2
- max: 10
- idleTimeout: 30000
- acquireTimeout: 30000`,

  apiEndpoint: `# API Endpoints
## Base Configuration
- baseUrl: https://api.example.com
- timeout: 30000
- retries: 3

## Authentication
- type: Bearer
- header: Authorization

## Endpoints
### GET Users
- path: /users
- method: GET
- description: Fetch all users

### POST User
- path: /users
- method: POST
- description: Create new user`,

  userProfile: `# User Profile
## Personal Info
- firstName: John
- lastName: Doe
- email: john@example.com
- phone: +1-234-567-8900

## Address
- street: 123 Main St
- city: New York
- state: NY
- zipCode: 10001

## Preferences
- theme: dark
- language: en
- notifications: true`,

  settings: `# Application Settings
## General
- appName: MyApp
- version: 1.0.0
- environment: production

## Features
- featureA: true
- featureB: false
- betaFeatures: false

## Limits
- maxUsers: 1000
- maxStorage: 5000
- requestsPerMinute: 100`,
}

export const TEMPLATE_LIST: TemplateDefinition[] = [
  { key: 'databaseConfig', label: 'Database Config', content: TEMPLATES.databaseConfig },
  { key: 'apiEndpoint', label: 'API Endpoints', content: TEMPLATES.apiEndpoint },
  { key: 'userProfile', label: 'User Profile', content: TEMPLATES.userProfile },
  { key: 'settings', label: 'Settings Object', content: TEMPLATES.settings },
]
