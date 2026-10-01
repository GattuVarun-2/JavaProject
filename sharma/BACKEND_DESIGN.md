# PCWise backend design

## Visitor flow

1. Open PCWise without signing up or logging in.
2. Choose a complete PC, an individual component, or peripherals.
3. Set a maximum budget in INR and select the intended use and required categories.
4. Press the recommendation button.
5. The frontend sends these preferences to the backend.
6. The backend validates the request, selects suitable products within budget, and returns the result.
7. The visitor adjusts their preferences and submits again if needed.

Moving a slider updates local form state; it does not send a request for every slider movement.

## Data and scope

No user registration, login, user table, password, or user ID is required. Recommendation requests are independent and do not need saved visitor profiles or recommendation history.

Product information still needs a catalog: product IDs, categories, names, numeric INR prices, availability, purpose suitability, and technical specifications. Start with a local sample catalog for development; use a maintained database or product source for real recommendations. Clearly identify sample prices in the interface.

## API contract

Use Spring Boot with JSON request and response bodies. Suggested local port: 8086.

### POST /api/recommendations/pc

```json
{
  "buildType": "COMPLETE_PC",
  "budget": 120000,
  "purposes": ["Gaming", "Streaming"]
}
```

For an individual component:

```json
{
  "buildType": "INDIVIDUAL_COMPONENT",
  "budget": 20000,
  "purposes": ["Programming"],
  "component": "CPU"
}
```

The component budget represents the maximum price of that part. Give this mode a separate slider range from complete builds. Return only the requested category. Without specifications for the visitor's existing system, compatibility with that system is unknown.

### POST /api/recommendations/peripherals

```json
{
  "budget": 20000,
  "purpose": "Gaming",
  "categories": ["Monitor", "Keyboard", "Mouse"]
}
```

The budget is shared across all selected peripherals, not applied separately to each one.

### Successful response shape

```json
{
  "status": "MATCH",
  "currency": "INR",
  "budget": 20000,
  "total": 18000,
  "remainingBudget": 2000,
  "products": [
    {
      "id": "sample-cpu-1",
      "category": "CPU",
      "name": "Sample processor",
      "detail": "Example catalog entry",
      "price": 18000,
      "reason": "Selected for the requested purpose within budget."
    }
  ],
  "compatibility": "UNKNOWN",
  "warnings": ["Existing system specifications were not provided."],
  "dataSource": "SAMPLE_CATALOG"
}
```

This example represents an individual component response. Complete builds and peripherals use the same monetary fields and product list. Calculate totals from selected products; the frontend formats numbers as rupees.

For valid requests without a suitable combination, return `status: "NO_MATCH"`, an empty product list, and an explanation. Do not exceed the budget silently or present a partial system as a complete PC. Invalid input returns HTTP 400 with a readable message and field errors.

## Recommendation rules

- Validate a positive budget within the supported limits, known categories and purposes, and at least one selected purpose/category as applicable.
- Complete builds include CPU, motherboard, RAM, storage, PSU, case, and adequate cooling. Include a discrete GPU when required; otherwise verify that usable integrated graphics are available.
- Check CPU socket and motherboard support, memory generation, case and motherboard form factor, PSU capacity/connectors, and relevant physical clearances. Missing specification data must produce an unknown or incomplete check, not an unconditional compatibility badge.
- Filter incompatible combinations, then rank affordable candidates for the selected purposes. For multiple purposes, use equal weighting initially and document that choice.
- Enforce the total budget across the entire selected combination.
- Return the reasons for recommendations. Do not show a fabricated suitability percentage; add a numeric score only when its calculation is defined.

## Implementation structure

- Controller: receive and validate requests; return JSON and appropriate HTTP status codes.
- Request/response DTOs: define the API contract without coupling it to storage models.
- Catalog repository: supply product records and specifications.
- Recommendation service: select and rank affordable combinations.
- Compatibility service: evaluate technical compatibility separately from purpose suitability.
- Exception handler: return consistent validation and server errors.

The frontend needs loading, error, no-match, and success states. Show results for the submitted preferences, and replace them only with a subsequent successful response. Prevent older requests from overwriting newer results.

## Verification

Test that changing budget and purpose can change selections, totals equal the sum of product prices, complete builds include all required parts, incompatible combinations are rejected, individual-component results contain only that category, and peripheral totals stay within the shared budget. Cover invalid requests and budgets with no feasible match.

The backend remains a proposed design and is not implemented. The frontend now includes its request layer, presentation fixtures, and response views. The implemented contract in `front end/pcwise-frontend/API_CONTRACT.md` is the source of truth for endpoint names, input limits, and response fields.
