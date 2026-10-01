import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Button from "./Button";
import ProductCard from "./ProductCard";
import { money } from "../lib/preferences";
const compatibilityLabels = {
  COMPATIBLE: "Compatibility confirmed by the service",
  INCOMPATIBLE: "Compatibility needs attention",
  UNKNOWN: "Compatibility not verified",
  NOT_APPLICABLE: "Accessory recommendation",
};
export default function RecommendationResult({
  kind,
  state,
  isStale,
  onRetry,
  onCancel,
}) {
  const resultRef = useRef(null);
  const [downloadError, setDownloadError] = useState("");
  useEffect(() => {
    if (
      (state.status === "success" || state.status === "error") &&
      resultRef.current &&
      !resultRef.current.closest("[hidden]")
    ) {
      resultRef.current.focus({
        preventScroll: true,
      });
      if (window.matchMedia("(max-width: 760px)").matches)
        resultRef.current.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        });
    }
  }, [state.status]);
  const { result, submitted, status } = state;
  const purpose = submitted?.purposes?.join(" + ") || submitted?.purpose;
  function download() {
    try {
      const text = [
        "PCWise recommendation",
        result.dataSource === "SAMPLE_CATALOG"
          ? "DEMO — illustrative products and prices"
          : "Recommendation service result",
        `Purpose: ${purpose}`,
        `Budget: ${money(result.budget)}`,
        "",
        ...result.products.map(
          (p) =>
            `${p.category}: ${p.name} — ${money(p.price)}${p.reason ? `\n  ${p.reason}` : ""}`,
        ),
        "",
        `Total: ${money(result.total)}`,
        `Remaining: ${money(result.remainingBudget)}`,
        compatibilityLabels[result.compatibility],
        ...result.warnings,
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([text], {
          type: "text/plain;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `pcwise-${kind}-recommendation.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError("");
    } catch {
      setDownloadError(
        "The summary could not be downloaded. Please try again.",
      );
    }
  }
  return (
    <aside
      className={`recommendation-output ${status}`}
      aria-label="Recommendation results"
      aria-busy={status === "loading"}
    >
      <div aria-live="polite" className="sr-only">
        {status === "loading"
          ? "Finding your recommendations."
          : status === "success"
            ? result.status === "MATCH"
              ? "Your recommendation is ready."
              : "No matching recommendation found."
            : ""}
      </div>
      {status === "idle" && (
        <div className="empty-result">
          <div className="empty-icon">
            <Sparkles size={30} aria-hidden="true" />
          </div>
          <p className="eyebrow">MADE FOR YOUR NEEDS</p>
          <h2>Your next setup starts here.</h2>
          <p>
            Set your preferences and we’ll bring your options together in one
            clear breakdown.
          </p>
          <div className="empty-steps">
            <span>01 · Set a budget</span>
            <span>02 · Choose your needs</span>
            <span>03 · Explore your result</span>
          </div>
        </div>
      )}
      {status === "loading" && (
        <div className="result-card loading-card">
          <LoaderCircle className="spinner" size={30} aria-hidden="true" />
          <h2>Finding your fit…</h2>
          <p>Putting together options for {purpose}.</p>
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton short" />
          <Button variant="secondary" onClick={onCancel}>
            Cancel request
          </Button>
        </div>
      )}
      {status === "error" && (
        <div ref={resultRef} tabIndex={-1} className="result-card error-card">
          <AlertCircle size={30} aria-hidden="true" />
          <h2>We couldn’t get your result.</h2>
          <p role="alert">{state.error}</p>
          <Button onClick={onRetry}>
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}
      {status === "success" && result.status === "NO_MATCH" && (
        <div ref={resultRef} tabIndex={-1} className="result-card empty-result">
          <CircleHelp size={32} aria-hidden="true" />
          <p className="eyebrow">LET’S ADJUST YOUR PREFERENCES</p>
          <h2>No match within {money(result.budget)}.</h2>
          <p>
            {result.message ||
              "Try a higher budget or a different selection. We will not suggest a setup above your limit."}
          </p>
          <p className="submitted-summary">For {purpose}</p>
          {result.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
          {isStale && (
            <p className="stale-note">
              Preferences changed. Submit the form to find new options.
            </p>
          )}
          <Button onClick={onRetry}>Try current preferences</Button>
          {result.dataSource === "SAMPLE_CATALOG" && (
            <p className="demo-note">Local demo · limited sample catalog</p>
          )}
        </div>
      )}
      {status === "success" && result.status === "MATCH" && (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="result-card completed-result"
        >
          <div className="result-header">
            <div>
              <p className="eyebrow">YOUR SETUP, EXPLAINED</p>
              <h2>
                {kind === "peripherals"
                  ? "The finishing touches."
                  : submitted.buildType === "INDIVIDUAL_COMPONENT"
                    ? `Your ${submitted.component} shortlist.`
                    : "Meet your next PC."}
              </h2>
            </div>
            <span
              className={`status-badge ${result.compatibility === "INCOMPATIBLE" ? "attention-badge" : result.dataSource === "SAMPLE_CATALOG" ? "sample-badge" : ""}`}
            >
              {result.compatibility === "INCOMPATIBLE"
                ? "Review required"
                : result.dataSource === "SAMPLE_CATALOG"
                  ? "Demo result"
                  : "Recommended"}
            </span>
          </div>
          <p className="submitted-summary">
            For {purpose} · {result.products.length}{" "}
            {result.products.length === 1 ? "item" : "items"}
          </p>
          {isStale && (
            <p className="stale-note">
              You changed your preferences. This result reflects your last
              submission; recommend again to update it.
            </p>
          )}
          <div className="budget-summary">
            <div>
              <span>Estimated total</span>
              <strong>{money(result.total)}</strong>
            </div>
            <Wallet size={27} aria-hidden="true" />
            <div
              className="budget-track"
              role="meter"
              aria-label="Budget used"
              aria-valuenow={result.total}
              aria-valuemin={0}
              aria-valuemax={result.budget}
              aria-valuetext={`${money(result.total)} of ${money(result.budget)}`}
            >
              <span
                style={{
                  width: `${Math.min(100, (result.total / result.budget) * 100)}%`,
                }}
              />
            </div>
            <p>
              {money(result.remainingBudget)} remaining{" "}
              <span>of {money(result.budget)}</span>
            </p>
          </div>
          {result.score !== null && (
            <div className="score-line">
              <span>Suitability score from the service</span>
              <strong>{result.score} / 100</strong>
            </div>
          )}
          <div
            className={`compatibility ${result.compatibility === "COMPATIBLE" ? "" : result.compatibility === "INCOMPATIBLE" ? "compatibility-failed" : "compatibility-neutral"}`}
          >
            {result.compatibility === "COMPATIBLE" ? (
              <CheckCircle2 size={21} aria-hidden="true" />
            ) : (
              <CircleHelp size={21} aria-hidden="true" />
            )}
            <div>
              <strong>{compatibilityLabels[result.compatibility]}</strong>
              {result.message && <span>{result.message}</span>}
            </div>
          </div>
          {!!result.checks.length && (
            <details className="compatibility-details">
              <summary>
                View compatibility checks ({result.checks.length})
              </summary>
              {result.checks.map((check, index) => (
                <div className="check-row" key={index}>
                  {check.status === "PASS" ? (
                    <CheckCircle2 size={16} />
                  ) : check.status === "FAIL" ? (
                    <X size={16} />
                  ) : (
                    <CircleHelp size={16} />
                  )}
                  <div>
                    <strong>
                      {check.label} · {check.status.toLowerCase()}
                    </strong>
                    <p>{check.detail}</p>
                  </div>
                </div>
              ))}
            </details>
          )}
          <div className="product-list">
            {result.products.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
          </div>
          {!!result.warnings.length && (
            <div className="result-warnings">
              <strong>
                <AlertCircle size={16} aria-hidden="true" /> Before you decide
              </strong>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="result-actions">
            <Button variant="secondary" onClick={download}>
              <ArrowDownToLine size={17} aria-hidden="true" />
              Save summary
            </Button>
            <span>
              {result.dataSource === "SAMPLE_CATALOG"
                ? "Illustrative prices only."
                : "Confirm current prices before purchase."}
            </span>
          </div>
          {downloadError && (
            <p role="alert" className="field-error">
              {downloadError}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
