# Changelog

What changed in each release of @levuche/kit. Apps install a release by its
tag, such as `github:Levuche/kit#v0.1.0`; how to release is in
[docs/RELEASING.md](docs/RELEASING.md).

## Unreleased

- Shared sign-in: `@levuche/kit/server` names the session cookie and sets it
  on levuche.com, so the website and the app share one sign-in
  (`sessionCookieName()`, `sessionCookieOptions()`, `sharedCookieDomain()`,
  `expireHostOnlySessionCookie()`).
- Affiliate links: `withReferral()` and `forwardReferral()` carry an
  affiliate's code from one Levuche site to another, with
  `isReferralCode()`, `REFERRAL_PARAM` and `REFERRAL_EVENT`.
- `buildbaseEnvironmentId()`: the id Buildbase knows an environment by.
- Block tracking: `sendBlockAction()` sends what @levuche/ui's
  `useBlockActions()` reports to Buildbase tracking, as goals, with
  sign-ups also sent as the `lead` event.
- Forms: `forwardForm()` in `@levuche/kit/server` checks a form post and
  forwards it to a Buildbase form, and `refuseCrossSitePost()` refuses a
  post from another site.
- Release workflow: fills in the title and notes of a release already made on
  GitHub, instead of failing.

## 0.1.0

The first release.

- `@levuche/kit/theme.css`: the product theme from design tokens v1.1
  (`--lv-*`, light and dark), its shadcn/ui and Tailwind names, and the size
  presets (`text-h1`, `py-section`, `max-w-layout`, `rounded-card`,
  `min-h-control` and the rest).
- `cn()`, which joins class names and knows the size presets.
- `formatPrice()` and `formatPercent()`.
- `brand`: Levuche's name, owner and addresses.
- `buildbaseConfig()` and `isOrgId()`: checked public Buildbase settings.
- `@levuche/kit/server`: `readEnv()`, `requireEnv()` and `assertServer()`.
