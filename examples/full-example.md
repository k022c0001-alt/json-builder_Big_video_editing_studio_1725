# 全機能を使った完全版サンプル

json-builder がサポートするすべての機能を網羅したサンプルです。

---

# Full Feature Demo

> このメモはデモ用です（> で始まる行はコメントとして無視されます）

## Project Metadata
- id: demo-001
- name: Full Feature Demo
- version: 2.5.0
- created: 2024-01-15
- active: true
- archived: false
- priority: null

## Numeric Values
- integer: 42
- negative: -10
- float: 3.14159
- zero: 0
- large: 1000000

## String Values
- simple: hello world
- with_spaces: this is a sentence
- path: /home/user/documents/file.json
- url: https://example.com/api/v2

## Boolean Flags
- enabled: true
- disabled: false
- flag_only

## Array Values
- tags: [typescript, react, electron]
- counts: [1, 2, 3, 4, 5]
- mixed: [alpha, 1, true]

## Nested Structure
### Database
- host: localhost
- port: 5432
- name: mydb
- ssl: true

### Cache
- driver: redis
- host: localhost
- port: 6379
- ttl: 3600

### API
- endpoint: https://api.example.com/v2
- timeout: 5000
- retries: 3

## Inline JSON Block
```json
{
  "build": {
    "target": "production",
    "minify": true,
    "sourcemap": false,
    "outDir": "./dist"
  },
  "env": {
    "NODE_ENV": "production",
    "LOG_LEVEL": "warn"
  }
}
```

## Empty Section
> このセクションは空です

## Final Flags
- production_ready
- reviewed
- deployed: false
