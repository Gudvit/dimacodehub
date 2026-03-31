# Dimacodehub Portfolio

Personal portfolio built with Angular 21, styled as a single-page experience and covered by Vitest + Playwright tests.

## Start locally

```bash
npm install
npm run start
```

Open `http://localhost:4200/`.

## Tests

Unit tests:

```bash
npm run test:unit
```

E2E tests (Playwright):

```bash
npx playwright install
npm run test:e2e
```

## GitHub Pages deployment

The repository includes a GitHub Actions workflow that builds and publishes the site to GitHub Pages. The build uses:

```bash
npm run build:gh
```

Make sure the repository name matches the base href in `package.json`:

```json
"build:gh": "ng build --base-href /dimacodehub/"
```

If your repo name differs, update the base href accordingly.
