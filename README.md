# ANIME ID v0.5

ANIME ID is a mobile-first Korean anime personality test. The public website is the static `index.html` site, published from the repository root on GitHub Pages. It has a 25-question, seven-point questionnaire, four-axis scoring, 16 personality results, shareable cards, and PNG export.

## Project structure

- `index.html` — page shell and screen flow
- `404.html` — GitHub Pages fallback page
- `app.js` — scoring, result generation, survey logic, and sharing
- `data.js` — all questions, scale labels, type names, and metadata
- `assets/types/` — replaceable SVG character assets, one per personality code
- `survey-config.js` — public endpoint URLs only; never put credentials here
- `og.png` and `favicon.png` — social preview and site icon
- `tools/make-og.html` — browser-based generator for the PNG assets
- `app/api/anime-id-survey/route.ts` — optional private email-delivery endpoint

## Deployment and consent workflow

This static site is ready to deploy from the repository root on GitHub Pages.

1. Push the repository to the `main` branch.
2. Open GitHub → Settings → Pages.
3. Under Build and deployment, set Source to **GitHub Actions**. The workflow at `.github/workflows/pages.yml` publishes the repository root without a build step.
4. The intended project Pages URL is `https://yuyeona332.github.io/cc/`; keep it in sync with `SITE_URL` and metadata.
5. To enable test-response delivery, set `window.ANIME_ID_SURVEY_ENDPOINT` in `survey-config.js` to the public URL of the deployed Next.js endpoint (`https://<backend-host>/api/anime-id-survey`). The default is intentionally empty.

The end-of-test response flow is consent-based. Visitors see the consent request and can either submit all 25 answers or go directly to their result. A declined request makes no network call. The send action is one-shot and uses an idempotency key.

GitHub Pages is static and cannot run the email API. Deploy the existing Next.js app/API route to a serverless Next.js host such as Vercel, then configure these **server-only** environment variables there:

- `DATABASE_URL` — required by this repository's configured Vercel build command for database migrations.
- `RESEND_API_KEY` — secret Resend API key.
- `ANIME_ID_SURVEY_TO` — private destination address.
- `ANIME_ID_SURVEY_FROM` — sender address verified with Resend.
- `ANIME_ID_ALLOWED_ORIGINS` — comma-separated allowed browser origins; include `https://yuyeona332.github.io`.

The backend validates the full answer set, recalculates the result and percentages, and sends a plain-text email through Resend using the submission ID for provider idempotency. It does not expose the recipient or API key in client code. Until the backend, Resend sender/domain, environment variables, and endpoint URL are configured, selecting **응답 전송** displays the required failure message and still opens the result; no response is delivered.

The optional post-result feedback form is a separate integration. Set `window.ANIME_ID_FEEDBACK_ENDPOINT` in `survey-config.js` only if a compatible form endpoint is configured. This is a public URL, not a secret.

## Editing the test

All test content is intentionally easy to adjust in `data.js`:

- `questions`: edit question wording and axis mapping.
- `axes`: change the four fandom traits and their labels.
- `adjectiveByPair` and `nounByPair`: update the result naming logic.
- `typeMeta`: change each type's tagline and description text.
- `scale`: alter the 7-point Likert labels if needed.

## Sharing

Intended project URL: https://yuyeona332.github.io/cc/

Share links encode only the four trait percentages and type code in the URL hash, for example `#r=RCFP-72-65-58-81`. The percentages are Side A values for R/S, C/W, F/E, and P/D; Side B is calculated as `100 - Side A`. An `X` in the type code marks a tied axis. No answers or personal information are included. Opening a valid shared link displays the sender's result and lets a visitor start the test immediately.

To change the live address, update the single `SITE_URL` constant at the top of `app.js`, then update the canonical, Open Graph, and Twitter URLs in the `<head>` of `index.html` and the target link in `404.html`.

KakaoTalk uses `Kakao.Share.sendDefault` only when `KAKAO_KEY` at the top of `app.js` is set. Register `https://yuyeona332.github.io` as the site domain in the Kakao Developers console, then paste the JavaScript key into `KAKAO_KEY`. Leave it empty to use native sharing when available and clipboard/prompt fallback otherwise.

### Pre-share checklist

- The repository is public and GitHub Pages is deploying the repository root.
- `SITE_URL`, canonical URL, Open Graph URL, and 404 destination match `https://yuyeona332.github.io/cc/`.
- `og.png` is a 1200×630 PNG and `favicon.png` is a 64×64 PNG.
- A valid `#r=` link opens the friend view; invalid tokens return to the start screen.
- The start-to-result flow, share controls, survey, and thank-you screen work on mobile and desktop.
- In-app-browser image saving shows the long-press overlay.

## Deployment

Intended project URL: https://yuyeona332.github.io/cc/

### Steps

1. Make the repository public in GitHub.
2. Open Settings → Pages.
3. Under Build and deployment, choose GitHub Pages or GitHub Actions as the source.
4. Push to `main` or trigger the deployment workflow.

### Redeploying

- Push new commits to `main` to trigger the workflow automatically.
- Or open the GitHub Actions tab and run the Pages workflow manually with `workflow_dispatch`.

### Pre-share checklist

- Repository is public.
- Pages source is configured correctly.
- The `SITE_URL` constant matches the live domain.
- The canonical and Open Graph URLs match the public site.
- Internal links use relative paths, not absolute site paths.
- The repo has the expected static files and no missing stylesheet dependency.

### Publishing the email endpoint

1. Deploy this repository's Next.js app to Vercel (the API route is `app/api/anime-id-survey/route.ts`).
2. Add the four server-side variables listed above in Vercel → Project Settings → Environment Variables. Restrict `ANIME_ID_ALLOWED_ORIGINS` to the production site origin and any local preview origins needed for testing.
3. Configure the Resend sender domain and verify a successful test email.
4. Set `window.ANIME_ID_SURVEY_ENDPOINT` in `survey-config.js` to the deployed route URL.
5. Push to `main` and verify the GitHub Pages workflow and an explicit, consented end-to-end submission.

No email address is collected from visitors. The test-response payload contains the 25 answers, result code, axis percentages, and timestamp. The browser does not send anything unless the visitor selects **응답 전송**.

### Kakao share setup

The app supports Kakao sharing when `KAKAO_KEY` is set in `app.js`:

```js
const KAKAO_KEY = "";
```

To enable KakaoTalk share:

1. Open the Kakao Developers console.
2. Register the domain `https://yuyeona332.github.io` for the app.
3. Create a JavaScript app and copy the JavaScript key.
4. Paste the key in the constant above.
5. Leave it empty if you want the app to fall back to native sharing or clipboard copy.
