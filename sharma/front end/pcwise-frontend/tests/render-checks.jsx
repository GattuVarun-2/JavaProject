import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import RecommendationResult from "../src/components/RecommendationResult";
import Home from "../src/pages/Home";
import PCBuilder from "../src/pages/PCBuilder";
import Peripherals from "../src/pages/Peripherals";
import { createDemoRecommendation } from "../src/services/demo";
import { normalizeResponse } from "../src/services/api";
const request = {
  buildType: "COMPLETE_PC",
  budget: 120000,
  purposes: ["Gaming"],
};
const fixture = createDemoRecommendation("pc", request);
const result = normalizeResponse(fixture, "pc", request);
const render = (state, extra = {}) =>
  renderToStaticMarkup(
    <RecommendationResult
      kind="pc"
      state={state}
      onRetry={() => {}}
      onCancel={() => {}}
      {...extra}
    />,
  );
assert.match(
  render({
    status: "idle",
  }),
  /Your next setup starts here/,
);
assert.match(
  render({
    status: "loading",
    submitted: request,
  }),
  /Cancel request/,
);
assert.match(
  render({
    status: "error",
    error: "Connection unavailable.",
  }),
  /role="alert"/,
);
assert.match(
  render({
    status: "error",
    error: "Connection unavailable.",
  }),
  /Try again/,
);
const matched = render({
  status: "success",
  result,
  submitted: request,
});
assert.match(matched, /Meet your next PC/);
assert.match(matched, /Demo result/);
assert.match(matched, /Save summary/);
assert.match(matched, /Compatibility not verified/);
assert.doesNotMatch(matched, /91 \/ 100/);
assert.match(
  render(
    {
      status: "success",
      result,
      submitted: request,
    },
    {
      isStale: true,
    },
  ),
  /last submission/,
);
const live = {
  ...result,
  dataSource: "LIVE",
  compatibility: "COMPATIBLE",
  score: 88,
  checks: [
    {
      label: "Socket",
      status: "PASS",
      detail: "AM5",
    },
  ],
};
assert.match(
  render({
    status: "success",
    result: live,
    submitted: request,
  }),
  /88/,
);
assert.match(
  render({
    status: "success",
    result: live,
    submitted: request,
  }),
  /Compatibility confirmed by the service/,
);
const noMatch = {
  ...result,
  status: "NO_MATCH",
  products: [],
  message: "Please increase your budget.",
};
assert.match(
  render({
    status: "success",
    result: noMatch,
    submitted: request,
  }),
  /Please increase your budget/,
);
const unsafeText = {
  ...result,
  products: [
    {
      ...result.products[0],
      name: "<script>alert(1)</script>",
      specifications: [["Socket", "AM5"]],
    },
  ],
};
const escaped = render({
  status: "success",
  result: unsafeText,
  submitted: request,
});
assert.ok(escaped.includes("&lt;script&gt;"));
assert.ok(!escaped.includes("<script>alert"));
assert.match(escaped, /Technical specifications/);
assert.match(renderToStaticMarkup(<PCBuilder />), /Recommend my PC/);
assert.match(renderToStaticMarkup(<Peripherals />), /Recommend peripherals/);
assert.match(
  renderToStaticMarkup(<Home onNavigate={() => {}} />),
  /The right PC/,
);
console.log(
  "UI render checks passed: pages, result states, optional fields, warnings, and escaped service text.",
);
