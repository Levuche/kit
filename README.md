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
  Also the affiliate-link helpers (`withReferral()`, `forwardReferral()`) and
  `sendBlockAction()` for block tracking.
- **`@levuche/kit/server`**: `readEnv()`, `requireEnv()` and `assertServer()`;
  the shared session cookie (`sessionCookieName()`, `sessionCookieOptions()`);
  and `forwardForm()`, which sends a form to Buildbase Forms. Server code only.

Kit doesn't depend on the Buildbase SDK. Where a helper needs the SDK, the
app passes the SDK's function in, as below.

## Shared sign-in, tracking and forms

The website and the app must use these, not copies of their own: a
different cookie name or domain makes a second cookie, and shared sign-in
stops working.

```ts
// Sign-in and sign-out routes: one cookie for every levuche.com site.
import {
  expireHostOnlySessionCookie,
  sessionCookieName,
  sessionCookieOptions,
} from '@levuche/kit/server';

const name = sessionCookieName(buildbase.environment);
response.cookies.set(name, sessionId, sessionCookieOptions(request.nextUrl));
const old = expireHostOnlySessionCookie(name, request.nextUrl);
if (old) response.headers.append('Set-Cookie', old);
```

```tsx
// A client component near the top of the page: block clicks and sign-ups.
'use client';
import { useBlockActions } from '@levuche/ui';
import { trackGoal, useTracking } from '@buildbase/sdk/tracking';
import { sendBlockAction } from '@levuche/kit';

export function BlockTracking() {
  const { track } = useTracking();
  useBlockActions((action) => sendBlockAction(action, { trackGoal, track }));
  return null;
}
```

```ts
// app/api/contact/route.ts: a form, checked and sent to Buildbase Forms.
import { forwardForm } from '@levuche/kit/server';

export const POST = (request: Request) =>
  forwardForm(request, {
    ...buildbase,
    formId: process.env.BUILDBASE_CONTACT_FORM_ID,
    fields: {
      name: { max: 200, required: true },
      email: { max: 320, required: true, email: true },
      message: { max: 5000, required: true },
    },
  });
```

Affiliate links: keep the referral with the SDK's `captureReferral()` under
`buildbaseEnvironmentId(buildbase)`, and put the code on links into another
Levuche site with `withReferral(href, code)`. Buildbase keeps a referral for
one site only, so the code has to travel in the link.

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
