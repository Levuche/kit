# Releasing @levuche/kit

Apps install the kit from a Git tag, never from a branch, so a change only
reaches an app when someone moves that app to the new tag on purpose.

## Versions

The version follows [semantic versioning](https://semver.org):

- **Patch** (0.1.1): a fix that changes nothing apps rely on.
- **Minor** (0.2.0): something new, such as a component or a helper. While
  the version starts with 0, a minor release may also change or remove
  something; the changelog says what and how to move.
- **Major** (1.0.0 and up): a change apps have to adapt to.

## Steps

1. Every pull request into `dev` adds its line under **Unreleased** in
   CHANGELOG.md.
2. On a `chore/release-x.y.z` branch from `dev`, set `version` in
   package.json, move the Unreleased lines under a new `## x.y.z` heading, and
   open the pull request into `dev`.
3. After it merges, open the release pull request from `dev` into `main` and
   merge it with a merge commit.
4. Tag that merge commit on `main` and push the tag:

   ```sh
   git switch main && git pull
   git tag -a vx.y.z -m "@levuche/kit x.y.z"
   git push origin vx.y.z
   ```

5. The Release workflow checks that the tag matches package.json and sits on
   `main`, runs every check, and publishes the GitHub release with the
   changelog section as its notes.
6. In each app, change the dependency to `github:Levuche/kit#vx.y.z` in its own
   pull request, and test it there.

Never move or delete a tag after it's pushed: apps may already be built from
it. Fix a bad release with a new patch release.
