import { createDemoRecommendation } from "./demo.js";
import { COMPONENTS, validatePreferences } from "../lib/preferences.js";
export const API_MODE = import.meta.env?.VITE_API_MODE || "demo";
export class ApiError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}
const invalidResponse = () =>
  new ApiError(
    "The recommendation response could not be read. Please try again.",
  );
const isAmount = (value) => Number.isFinite(value) && value >= 0;
export function normalizeResponse(data, kind, request) {
  if (
    !data ||
    !["MATCH", "NO_MATCH"].includes(data.status) ||
    data.currency !== "INR" ||
    !Array.isArray(data.products)
  )
    throw invalidResponse();
  if (data.status === "NO_MATCH" && data.products.length)
    throw invalidResponse();
  if (data.status === "MATCH" && !data.products.length) throw invalidResponse();
  const products = data.products.map((p, index) => {
    if (
      !p ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      typeof p.category !== "string" ||
      !isAmount(p.price)
    )
      throw invalidResponse();
    return {
      id: typeof p.id === "string" ? p.id : `product-${index}`,
      category: p.category,
      name: p.name,
      price: p.price,
      detail: typeof p.detail === "string" ? p.detail : "",
      reason: typeof p.reason === "string" ? p.reason : "",
      specifications:
        p.specifications &&
        typeof p.specifications === "object" &&
        !Array.isArray(p.specifications)
          ? Object.entries(p.specifications).filter(
              ([, value]) =>
                typeof value === "string" || typeof value === "number",
            )
          : [],
    };
  });
  const categories = products.map((p) => p.category);
  if (new Set(categories).size !== categories.length) throw invalidResponse();
  if (data.status === "MATCH") {
    if (
      kind === "peripherals" &&
      (categories.length !== request.categories.length ||
        categories.some((c) => !request.categories.includes(c)))
    )
      throw invalidResponse();
    if (
      kind === "pc" &&
      request.buildType === "INDIVIDUAL_COMPONENT" &&
      (categories.length !== 1 || categories[0] !== request.component)
    )
      throw invalidResponse();
    if (
      kind === "pc" &&
      request.buildType === "COMPLETE_PC" &&
      (["CPU", "Motherboard", "RAM", "SSD", "PSU", "Cabinet", "Cooler"].some(
        (c) => !categories.includes(c),
      ) ||
        categories.some((c) => !COMPONENTS.includes(c)))
    )
      throw invalidResponse();
  }
  const total =
    Math.round(products.reduce((sum, p) => sum + p.price, 0) * 100) / 100;
  if (
    total > request.budget ||
    (data.total !== undefined &&
      (!isAmount(data.total) || Math.abs(data.total - total) > 0.01)) ||
    (data.budget !== undefined && data.budget !== request.budget)
  )
    throw invalidResponse();
  const compatibility = [
    "COMPATIBLE",
    "INCOMPATIBLE",
    "UNKNOWN",
    "NOT_APPLICABLE",
  ].includes(data.compatibility)
    ? data.compatibility
    : "UNKNOWN";
  return {
    status: data.status,
    currency: "INR",
    products,
    total,
    remainingBudget: request.budget - total,
    budget: request.budget,
    compatibility,
    score:
      typeof data.score === "number" && data.score >= 0 && data.score <= 100
        ? data.score
        : null,
    message: typeof data.message === "string" ? data.message : "",
    warnings: Array.isArray(data.warnings)
      ? data.warnings.filter((w) => typeof w === "string")
      : [],
    checks: Array.isArray(data.checks)
      ? data.checks
          .filter(
            (c) =>
              c &&
              typeof c.label === "string" &&
              ["PASS", "WARNING", "FAIL", "UNKNOWN"].includes(c.status),
          )
          .map((c) => ({
            label: c.label,
            status: c.status,
            detail: typeof c.detail === "string" ? c.detail : "",
          }))
      : [],
    dataSource:
      data.dataSource === "SAMPLE_CATALOG" ? "SAMPLE_CATALOG" : "LIVE",
  };
}
export async function requestRecommendation(
  kind,
  request,
  {
    signal,
    mode = API_MODE,
    fetcher = globalThis.fetch,
    timeoutMs = 15000,
    demoDelay = 650,
  } = {},
) {
  const errors = validatePreferences(kind, request);
  if (Object.keys(errors).length)
    throw new ApiError("Check the highlighted preferences.", errors);
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  if (mode === "demo") {
    await new Promise((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException("Cancelled", "AbortError"));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", abort);
        resolve();
      }, demoDelay);
      signal?.addEventListener("abort", abort, {
        once: true,
      });
    });
    return normalizeResponse(
      createDemoRecommendation(kind, request),
      kind,
      request,
    );
  }
  if (mode !== "live")
    throw new ApiError("The connection mode is not configured correctly.");
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, {
    once: true,
  });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetcher(`/api/recommendations/${kind}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const fields =
        data?.fieldErrors &&
        typeof data.fieldErrors === "object" &&
        !Array.isArray(data.fieldErrors)
          ? Object.fromEntries(
              Object.entries(data.fieldErrors).filter(
                ([, value]) => typeof value === "string",
              ),
            )
          : {};
      const message =
        response.status === 400
          ? "Some preferences were not accepted. Check your inputs and try again."
          : response.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : response.status === 404
              ? "The recommendation service is not available at this address."
              : "The recommendation service is temporarily unavailable. Please try again.";
      throw new ApiError(message, fields);
    }
    return normalizeResponse(data, kind, request);
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (timedOut)
      throw new ApiError("The request took too long. Please try again.");
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Could not connect to the recommendation service. Make sure the backend is running, then try again.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
