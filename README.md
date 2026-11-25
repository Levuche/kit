# @levuche/kit

What Levuche's own apps share: the product theme, components and helpers.
The [website](https://github.com/Levuche/website) (levuche.com), the
[app](https://github.com/Levuche/app) (app.levuche.com) and any admin screens
install it, so they look and behave the same.

Creator sites on levuche.page are built from a different package,
[@levuche/ui](https://github.com/Levuche/ui), and each creator themes them
with their own brand. The design source for both is
[Levuche/design](https://github.com/Levuche/design).

| Package      | What it's for                 | Tokens     |
| ------------ | ----------------------------- | ---------- |
| @levuche/kit | Levuche's own screens         | `--lv-*`   |
| @levuche/ui  | Creator sites on levuche.page | `--site-*` |

## What's in it

- **`@levuche/kit/theme.css`**: design tokens v1.1 for light and dark
  (`data-lv="light"` or `"dark"` on `<html>`), mapped to shadcn/ui's names and
  to Tailwind, plus the size presets (`text-h1`, `py-section`, `max-w-layout`,
  `rounded-card`, `min-h-control` and the rest).
- **`@levuche/kit`**: `cn()`, `formatPrice()`, `formatPercent()`, `brand`, and
  `buildbaseConfig()` for checked public Buildbase settings. Runs anywhere.
- **`@levuche/kit/server`**: `readEnv()`, `requireEnv()` and `assertServer()`.
  Server code only.

Shared components (buttons, fields, cards and the rest of the website's
shadcn/ui set) move here next; see the open issues.

## Use it in an app

Install a release by its tag, never a branch:

```sh
npm install github:Levuche/kit#v0.1.0
```

The package ships TypeScript source, so let Next.js compile it:

```ts
// next.config.ts
const nextConfig = { transpilePackages: ['@levuche/kit'] };
```

Load the theme after Tailwind in the global stylesheet:

```css
@import 'tailwindcss';
@import '@levuche/kit/theme.css';
```

Then:

```ts
import { brand, cn, formatPrice } from '@levuche/kit';

formatPrice(900, 'usd'); // "$9"
```

What changed in each version is in [CHANGELOG.md](CHANGELOG.md).

## Work on it

[CONTRIBUTING.md](CONTRIBUTING.md) explains how to report a problem, suggest
something or ask a question, and how the team works here. Security problems:
[SECURITY.md](SECURITY.md). Releases: [docs/RELEASING.md](docs/RELEASING.md).

## Licence

All rights reserved, Jagodana LLC. This repository is public so that people
can see how Levuche is built; it isn't open source. See [LICENSE](LICENSE)
and [TRADEMARKS.md](TRADEMARKS.md).
