# PCWise frontend API contract

The frontend is implemented against this contract. There is no backend implementation in this repository. These examples are illustrative, not current product offers.

## Transport

- `POST /api/recommendations/pc`
- `POST /api/recommendations/peripherals`
- Request/response: JSON; `Content-Type: application/json`.
- No authentication, visitor ID, account, or cookies are required by the frontend.
- Prices and budgets are JSON numbers in INR, never strings containing `₹` or commas.
- The form sends a request on submission, not on each slider movement.
- A local Vite proxy forwards these paths to `API_TARGET` in `.env.local`.

## PC requests

Complete PC:

```json
{
  "buildType": "COMPLETE_PC",
  "budget": 120000,
  "purposes": ["Gaming", "Streaming"]
}
```

Individual component:

```json
{
  "buildType": "INDIVIDUAL_COMPONENT",
  "budget": 20000,
  "purposes": ["Programming"],
  "component": "CPU"
}
```

- Complete budget: integer ₹50,000–₹2,00,000, inclusive.
- Individual-component budget: integer ₹1,000–₹1,50,000, inclusive; applies only to that part.
- Purposes: one or more of `Gaming`, `Programming`, `Video Editing`, `Photo Editing`, `Office`, `Streaming`.
- Components: `CPU`, `GPU`, `Motherboard`, `RAM`, `SSD`, `PSU`, `Cabinet`, `Cooler`.
- `component` is sent only for `INDIVIDUAL_COMPONENT`.

## Peripheral requests

```json
{
  "budget": 20000,
  "purpose": "Gaming",
  "categories": ["Monitor", "Keyboard", "Mouse"]
}
```

- Budget: integer ₹3,000–₹50,000, inclusive, shared by the whole selection.
- Purpose: `Gaming`, `Programming`, `Content Creation`, `Office`, `Study`.
- Categories: one or more of `Monitor`, `Keyboard`, `Mouse`.

## HTTP 200: match

This example is for a single CPU request with a ₹20,000 budget:

```json
{
  "status": "MATCH",
  "currency": "INR",
  "budget": 20000,
  "total": 19000,
  "remainingBudget": 1000,
  "products": [
    {
      "id": "cpu-7600",
      "category": "CPU",
      "name": "AMD Ryzen 5 7600",
      "price": 19000,
      "detail": "6 cores / 12 threads · AM5",
      "reason": "A processor suited to the requested development workloads.",
      "specifications": { "Socket": "AM5", "Cores": 6, "Threads": 12 }
    }
  ],
  "compatibility": "UNKNOWN",
  "warnings": ["Existing system specifications were not provided."],
  "checks": [
    {
      "label": "Existing motherboard",
      "status": "UNKNOWN",
      "detail": "Verify socket and BIOS support before upgrading."
    }
  ],
  "message": "Review compatibility with your current system before purchasing.",
  "dataSource": "LIVE"
}
```

Required fields: `status`, `currency`, and `products`. Every product needs a nonempty `name`, supported `category`, and finite nonnegative numeric `price`.

Optional product fields: `id`, `detail`, `reason`, `specifications`. Specifications are an object with string or numeric values. Text is rendered as plain text, not HTML.

Optional result fields:

- `budget`: if present, must equal the submitted budget.
- `total`: if present, must equal the sum of prices within ₹0.01. The frontend calculates its own total and remaining budget.
- `remainingBudget`: accepted but not trusted for display; calculated locally.
- `compatibility`: `COMPATIBLE`, `INCOMPATIBLE`, `UNKNOWN`, or `NOT_APPLICABLE`. Missing/unknown values display as unverified.
- `score`: numeric 0–100; shown only when provided and valid. Define its meaning on the backend before using it.
- `warnings`: string array displayed prominently.
- `checks`: objects with `label`, `status` (`PASS`, `WARNING`, `FAIL`, `UNKNOWN`), and optional `detail`.
- `message`: descriptive text.
- `dataSource`: `SAMPLE_CATALOG` marks demo data; otherwise the result is labeled as coming from the service.

Match constraints:

- Do not exceed the submitted budget.
- Return one product per category. Use a combined kit product for multiple RAM sticks.
- Complete builds must include CPU, Motherboard, RAM, SSD, PSU, Cabinet, and Cooler. Represent an included stock cooler as a zero-price Cooler line. GPU is optional only when the CPU provides suitable integrated graphics; backend compatibility checks must verify usable graphics and all other hardware constraints.
- Individual requests return exactly one product of the requested category.
- Peripherals return exactly one product for every selected category, with no extras.
- Missing parts, duplicate categories, mismatched totals, malformed JSON, and over-budget matches produce a readable frontend error rather than a misleading recommendation.

## HTTP 200: no match

```json
{
  "status": "NO_MATCH",
  "currency": "INR",
  "products": [],
  "message": "No complete combination fits this budget. Try increasing it or selecting fewer accessories.",
  "warnings": [],
  "dataSource": "LIVE"
}
```

A valid request without suitable products is a normal empty result, not a server failure.

## Error responses

Use HTTP 400 for invalid inputs, 429 for request limits, and 5xx for unexpected service failures.

```json
{
  "message": "Invalid preferences",
  "fieldErrors": {
    "budget": "Choose a budget within the supported range.",
    "purposes": "Select at least one purpose."
  }
}
```

Supported inline keys: `budget`, `buildType`, `component`, `purposes` for PC; `budget`, `purpose`, `categories` for peripherals. Field messages must be strings. The frontend shows a stable status-specific message and available field errors, instead of exposing raw error bodies or server stack traces.

Frontend transport behavior covers unreachable services, non-JSON bodies, malformed results, HTTP failures, 15-second timeouts, and manual cancellation. It does not automatically retry or fall back to demo mode.
