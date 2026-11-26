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

## Start here

New to this repository, as a developer or an AI agent? Read this README, then
[CONTRIBUTING.md](CONTRIBUTING.md) for how the team works and
[docs/RELEASING.md](docs/RELEASING.md) before you release. Open work is in
[the issues](https://github.com/Levuche/kit/issues). The website's launch
checklist, [Levuche/website#83](https://github.com/Levuche/website/issues/83),
says what the sites need next.

Rules for every change:

- Kit holds no keys, tokens, private ids or `.env` files. The helpers read
  settings at run time from the app that installs them.
- Kit doesn't depend on the Buildbase SDK; an app passes the SDK's function in.
- An app only gets a change when it moves to a new tag on purpose, so every
  change that apps will see goes in CHANGELOG.md under **Unreleased**.

| Who installs it                                       | Tag it's on |
| ----------------------------------------------------- | ----------- |
| [Levuche/website](https://github.com/Levuche/website) | `v0.2.0`    |
| [Levuche/app](https://github.com/Levuche/app)         | `v0.1.0`    |

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
npm install github:Levuche/kit#v0.2.0   # the newest tag; see CHANGELOG.md
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

```sh
nvm use            # Node 22, from .nvmrc
npm ci
npm test           # the unit tests (Vitest)
npm run check      # ESLint, Prettier, the type check and the tests
```

| Folder or file  | What's in it                                                        |
| --------------- | ------------------------------------------------------------------- |
| `src/index.ts`  | Everything `@levuche/kit` exports, safe to run anywhere             |
| `src/server/`   | `@levuche/kit/server`: environment, session cookie and form helpers |
| `src/theme.css` | `@levuche/kit/theme.css`: the design tokens and size presets        |
| `test/`         | One test file per helper, and checks on the package and the theme   |

How a change gets in:

1. Branch from `dev` with a name like `feature/new-helper`. Types: `feature`,
   `fix`, `hotfix`, `chore`, `docs`, `ci`.
2. Add your line under **Unreleased** in CHANGELOG.md if apps will see the
   change.
3. Open a pull request into `dev`, fill in the template and write `Closes #N`.
   The checks **Branch rules**, **Check and test** and
   **dependency-review** must pass and someone else reviews it before it merges.
4. To release, follow [docs/RELEASING.md](docs/RELEASING.md): a release pull
   request into `dev`, then `dev` into `main` with a merge commit, then a
   version tag on `main`. Pushing the tag needs someone with permission to
   push tags; the Release workflow then publishes the GitHub release.
5. Move each app to the new tag in that app's own pull request.

How to report a problem or ask a question is in
[CONTRIBUTING.md](CONTRIBUTING.md). Security problems:
[SECURITY.md](SECURITY.md).

## Licence

All rights reserved, Jagodana LLC. This repository is public so that people
can see how Levuche is built; it isn't open source. See [LICENSE](LICENSE)
and [TRADEMARKS.md](TRADEMARKS.md).
