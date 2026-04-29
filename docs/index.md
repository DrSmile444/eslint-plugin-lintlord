---
layout: home
hero:
  image:
    src: /logo.svg
    alt: 'eslint-plugin-lintlord logo'
  name: 'Lintlord'
  text: 'Useful ESLint rules for cleaner TypeScript'
  tagline: 'A focused ESLint plugin with practical rules that enforce better code patterns across your codebase.'
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Rules
      link: /rules/
features:
  - title: Practical Rules
    details: Rules that solve real-world problems and enforce patterns that actually improve code quality.
    icon: 🔧
  - title: Autofix & Suggestions
    details: Every rule comes with intelligent autofix or manual suggestions — your codebase stays clean automatically.
    icon: ✨
  - title: Fully Typed
    details: Written in TypeScript with full type safety. Works with ESLint v8, v9, and v10.
    icon: 📦
  - title: Well Tested
    details: Comprehensive test suites for every rule covering valid, invalid, autofix, and edge cases.
    icon: ✅
---

## Rules at a glance

| Rule                                                                        | Description                                                          | Fixable                  |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| [no-inline-interface-object-types](/rules/no-inline-interface-object-types) | Disallow inline object type literals; extract to named interfaces    | ✅ Autofix / Suggestions |
| [prefer-logger](/rules/prefer-logger)                                       | Disallow `console.log` (or all `console` calls) in favor of a logger | 💡 Suggestions           |

---

## License

MIT © 2026-Present [Dmytro Vakulenko](https://github.com/DrSmile444) 🇺🇦
