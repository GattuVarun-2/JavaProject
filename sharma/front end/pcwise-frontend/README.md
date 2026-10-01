# PCWise frontend

A local React + Vite presentation app for PC and peripheral recommendations. No login, user account, or backend is required to run demo mode.

## Run locally

From this directory:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite (normally `http://localhost:5173`). If dependencies are already installed, just run `npm run dev`.

- `npm run lint` — ESLint checks.
- `npm test` — request validation, response contracts, and sample recommendation tests.
- `npm run test:render` — render each page and recommendation state without a browser.
- `npm run build` — production build.
- `npm run preview` — local preview of the build on port 4173.

No CDN, remote font, image service, or account is needed for the UI. Installing packages initially requires npm access.

## Demo mode (default)

The app uses local sample products and illustrative prices. Complete builds, individual parts, and peripherals have separate request flows. Sample selections vary with preferences, obey the total budget, and can return no match. Compatibility is not asserted for sample hardware and no artificial score is shown.

For a quick presentation:

1. Open PC Builder and recommend a Gaming build at ₹1,20,000.
2. Change the budget and submit again; the result shows a new itemized total.
3. Choose One component, select CPU, and use ₹20,000.
4. Open Peripherals, choose all three accessories, and recommend at ₹20,000.
5. Lower the peripheral budget to ₹3,000 to show the no-match state.
6. Deselect all purposes or accessories to show inline validation.
7. Use Save summary to download a plain-text recommendation.

Form preferences are retained across navigation and reloads in the current browser tab via session storage. Results remain while navigating between screens; reloading clears results. Reset restores default preferences. Hash-based navigation supports browser back/forward and direct `#builder` / `#peripherals` links.

## Connect the backend later

1. Copy `.env.example` to `.env.local` in this directory.
2. Change the connection mode and the backend port:

```dotenv
VITE_API_MODE=live
API_TARGET=http://localhost:8086
```

3. Start the backend, then restart `npm run dev`. For `npm run preview`, rebuild after changing `VITE_API_MODE`, then restart the preview server.

The browser posts to `/api/recommendations/pc` or `/api/recommendations/peripherals`. Vite forwards `/api` to `API_TARGET`, avoiding cross-origin setup for this local workflow. Include the protocol and port in the target; do not append `/api`.

**Changing the port is sufficient only if the backend implements the contract in [API_CONTRACT.md](API_CONTRACT.md).** If it uses different paths or field names, update `src/services/api.js` to adapt them. The frontend never substitutes sample results when a live request fails.

Requests time out after 15 seconds. Users can cancel pending requests or retry failed ones. Results describe submitted preferences, and an update notice appears if the form has changed since submission.

## Code map

- `src/pages/` — Home, PC Builder, Peripherals.
- `src/components/RecommendationResult.jsx` — idle, loading, error, no-match, and successful result views.
- `src/components/ProductCard.jsx` — product price, reason, and expandable specifications.
- `src/hooks/useRecommendation.js` — form storage, validation, cancellation, and stale-request protection.
- `src/lib/preferences.js` — supported values, limits, and request construction.
- `src/services/api.js` — live requests and response validation.
- `src/services/demo.js` — presentation fixtures only; not a production recommendation engine.
- `src/index.css` — responsive styling, keyboard focus, and reduced-motion handling.

The backend, a production product catalog, real-time prices, and recommendation algorithms are outside this frontend implementation.
