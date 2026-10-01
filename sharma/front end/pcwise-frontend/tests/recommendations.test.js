import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRecommendation } from "../src/services/demo.js";
import {
  normalizeResponse,
  requestRecommendation,
} from "../src/services/api.js";
import {
  PC_DEFAULTS,
  PERIPHERAL_DEFAULTS,
  PC_PURPOSES,
  COMPONENTS,
  validatePreferences,
  toRequest,
  money,
} from "../src/lib/preferences.js";
const pc = toRequest("pc", PC_DEFAULTS);
const peripheral = toRequest("peripherals", PERIPHERAL_DEFAULTS);
const options = {
  mode: "demo",
  demoDelay: 0,
};
const ok = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});
test("all complete-build sample combinations fit the submitted budget and contain required parts", () => {
  for (const purpose of PC_PURPOSES)
    for (let budget = 50000; budget <= 200000; budget += 5000) {
      const request = {
        ...pc,
        purposes: [purpose],
        budget,
      };
      const result = normalizeResponse(
        createDemoRecommendation("pc", request),
        "pc",
        request,
      );
      assert.ok(result.total <= budget);
      assert.equal(
        result.total,
        result.products.reduce((sum, product) => sum + product.price, 0),
      );
      if (result.status === "MATCH") {
        for (const category of [
          "CPU",
          "Motherboard",
          "RAM",
          "SSD",
          "PSU",
          "Cabinet",
          "Cooler",
        ])
          assert.ok(result.products.some((p) => p.category === category));
        if (["Gaming", "Streaming", "Video Editing"].includes(purpose))
          assert.ok(result.products.some((p) => p.category === "GPU"));
      }
    }
});
test("changing budget and purpose changes sample selections", () => {
  const low = createDemoRecommendation("pc", {
    ...pc,
    budget: 90000,
  });
  const high = createDemoRecommendation("pc", {
    ...pc,
    budget: 200000,
  });
  const office = createDemoRecommendation("pc", {
    ...pc,
    purposes: ["Office"],
  });
  assert.notDeepEqual(low.products, high.products);
  assert.notDeepEqual(high.products, office.products);
});
test("individual component results contain only the selected category", async () => {
  for (const component of COMPONENTS) {
    const result = await requestRecommendation(
      "pc",
      {
        ...pc,
        buildType: "INDIVIDUAL_COMPONENT",
        component,
        budget: 70000,
      },
      options,
    );
    assert.equal(result.products.length, 1);
    assert.equal(result.products[0].category, component);
    assert.equal(result.compatibility, "UNKNOWN");
  }
});
test("all peripheral combinations share a single budget and include every selected category", () => {
  for (let mask = 1; mask < 8; mask++)
    for (let budget = 3000; budget <= 50000; budget += 1000) {
      const categories = ["Monitor", "Keyboard", "Mouse"].filter(
        (_, i) => mask & (1 << i),
      );
      const request = {
        ...peripheral,
        budget,
        categories,
      };
      const result = normalizeResponse(
        createDemoRecommendation("peripherals", request),
        "peripherals",
        request,
      );
      assert.ok(result.total <= budget);
      if (result.status === "MATCH")
        assert.deepEqual(
          result.products.map((p) => p.category),
          categories,
        );
    }
});
test("a valid but insufficient budget returns NO_MATCH", async () => {
  const result = await requestRecommendation(
    "peripherals",
    {
      ...peripheral,
      budget: 3000,
    },
    options,
  );
  assert.equal(result.status, "NO_MATCH");
  assert.equal(result.products.length, 0);
});
test("invalid selections and budgets fail before making a request", async () => {
  for (const budget of ["", NaN, -1, 0, 49999, 200001, 50000.5])
    assert.ok(
      validatePreferences("pc", {
        ...pc,
        budget,
      }).budget,
    );
  assert.ok(
    validatePreferences("pc", {
      ...pc,
      purposes: [],
    }).purposes,
  );
  assert.ok(
    validatePreferences("peripherals", {
      ...peripheral,
      categories: [],
    }).categories,
  );
  await assert.rejects(
    requestRecommendation(
      "pc",
      {
        ...pc,
        purposes: [],
      },
      {
        mode: "live",
        fetcher: () => assert.fail("must not fetch"),
      },
    ),
    /highlighted/,
  );
});
test("live request sends the exact JSON contract to the correct endpoint", async () => {
  let called = false;
  const result = await requestRecommendation("pc", pc, {
    mode: "live",
    fetcher: async (url, init) => {
      called = true;
      assert.equal(url, "/api/recommendations/pc");
      assert.equal(init.method, "POST");
      assert.equal(init.headers["Content-Type"], "application/json");
      assert.deepEqual(JSON.parse(init.body), pc);
      return ok({
        ...createDemoRecommendation("pc", pc),
        dataSource: "LIVE",
        score: 87,
        checks: [
          {
            label: "CPU socket",
            status: "PASS",
            detail: "AM5",
          },
        ],
      });
    },
  });
  assert.ok(called);
  assert.equal(result.dataSource, "LIVE");
  assert.equal(result.score, 87);
  assert.equal(result.checks.length, 1);
});
test("server validation errors, throttling, not found, and failure have actionable messages", async () => {
  for (const status of [400, 404, 429, 500])
    await assert.rejects(
      requestRecommendation("pc", pc, {
        mode: "live",
        fetcher: async () => ({
          ok: false,
          status,
          json: async () => ({
            fieldErrors: {
              budget: "Budget is unsupported.",
            },
          }),
        }),
      }),
      (error) =>
        error.name === "ApiError" &&
        error.fieldErrors.budget === "Budget is unsupported.",
    );
});
test("network failure never silently returns a sample result", async () => {
  await assert.rejects(
    requestRecommendation("pc", pc, {
      mode: "live",
      fetcher: async () => {
        throw new TypeError("network");
      },
    }),
    /Could not connect/,
  );
});
test("malformed JSON and invalid monetary data are rejected", async () => {
  await assert.rejects(
    requestRecommendation("pc", pc, {
      mode: "live",
      fetcher: async () => ({
        ok: true,
        json: async () => {
          throw new SyntaxError();
        },
      }),
    }),
    /could not be read/,
  );
  const fixture = createDemoRecommendation("pc", pc);
  for (const data of [
    null,
    {},
    {
      ...fixture,
      currency: "USD",
    },
    {
      ...fixture,
      total: 1,
    },
    {
      ...fixture,
      products: [],
    },
    {
      ...fixture,
      products: [
        {
          ...fixture.products[0],
          price: -1,
        },
      ],
    },
    {
      ...fixture,
      budget: 10,
    },
  ])
    assert.throws(() => normalizeResponse(data, "pc", pc), /could not be read/);
});
test("over-budget, duplicate-category and incomplete results are rejected", () => {
  const fixture = createDemoRecommendation("pc", pc);
  assert.throws(() =>
    normalizeResponse(
      {
        ...fixture,
        budget: 50000,
      },
      "pc",
      {
        ...pc,
        budget: 50000,
      },
    ),
  );
  assert.throws(() =>
    normalizeResponse(
      {
        ...fixture,
        products: fixture.products.concat(fixture.products[0]),
      },
      "pc",
      pc,
    ),
  );
  assert.throws(() =>
    normalizeResponse(
      {
        ...fixture,
        products: fixture.products.slice(0, 1),
      },
      "pc",
      pc,
    ),
  );
  assert.throws(() =>
    normalizeResponse(
      {
        ...fixture,
        products: [fixture.products[0]],
      },
      "pc",
      {
        ...pc,
        buildType: "INDIVIDUAL_COMPONENT",
        component: "GPU",
      },
    ),
  );
});
test("timeout and user cancellation are distinct", async () => {
  const waiting = async (_, { signal }) =>
    new Promise((resolve, reject) =>
      signal.addEventListener(
        "abort",
        () => reject(new DOMException("Cancelled", "AbortError")),
        {
          once: true,
        },
      ),
    );
  await assert.rejects(
    requestRecommendation("pc", pc, {
      mode: "live",
      fetcher: waiting,
      timeoutMs: 10,
    }),
    /took too long/,
  );
  const controller = new AbortController();
  const request = requestRecommendation("pc", pc, {
    mode: "live",
    fetcher: waiting,
    signal: controller.signal,
  });
  controller.abort();
  await assert.rejects(request, (error) => error.name === "AbortError");
  const demoController = new AbortController();
  const demoRequest = requestRecommendation("pc", pc, {
    mode: "demo",
    signal: demoController.signal,
  });
  demoController.abort();
  await assert.rejects(demoRequest, (error) => error.name === "AbortError");
});
test("optional response properties are safe and do not invent scores", () => {
  const result = normalizeResponse(
    {
      ...createDemoRecommendation("pc", pc),
      score: "91",
      warnings: [null, "Review the PSU."],
      checks: [
        null,
        {
          label: "socket",
          status: "nonsense",
        },
      ],
    },
    "pc",
    pc,
  );
  assert.equal(result.score, null);
  assert.deepEqual(result.warnings, ["Review the PSU."]);
  assert.deepEqual(result.checks, []);
});
test("fractional product prices remain visible in currency formatting", () => {
  assert.ok(money(1299.5).includes("1,299.5"));
  assert.ok(money(1299).includes("1,299"));
});
