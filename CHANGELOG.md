# Changelog

What changed in each release of @levuche/kit. Apps install a release by its
tag, such as `github:Levuche/kit#v0.1.0`; how to release is in
[docs/RELEASING.md](docs/RELEASING.md).

## Unreleased

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
