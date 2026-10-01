import { ArrowRight, Cpu, Layers, SlidersHorizontal } from "lucide-react";
import Button from "../components/Button";
import BudgetField from "../components/BudgetField";
import RecommendationResult from "../components/RecommendationResult";
import { useRecommendation } from "../hooks/useRecommendation";
import {
  budgetRange,
  COMPONENTS,
  PC_DEFAULTS,
  PC_PURPOSES,
  toggleItem,
} from "../lib/preferences";
export default function PCBuilder() {
  const { form, update, errors, state, submit, reset, cancel, isStale } =
    useRecommendation("pc", PC_DEFAULTS);
  const range = budgetRange("pc", form.buildType);
  function changeType(type) {
    update("buildType", type);
    update("budget", type === "COMPLETE_PC" ? 120000 : 20000);
  }
  return (
    <section className="page-section container">
      <div className="page-intro">
        <p className="eyebrow">
          <Cpu size={16} aria-hidden="true" /> THE PC BUILDER
        </p>
        <h1>
          A better build starts
          <br />
          with <span>your needs.</span>
        </h1>
        <p>
          A full setup or one smart upgrade. Tell us what matters, and explore a
          clear recommendation within your budget.
        </p>
      </div>
      <div className="builder-layout">
        <form
          id="pc-form"
          className="recommendation-form"
          onSubmit={submit}
          noValidate
        >
          <div className="form-heading">
            <h2>Your preferences</h2>
            <button className="reset-button" type="button" onClick={reset}>
              Reset
            </button>
          </div>
          <fieldset>
            <legend>
              <span className="step-number">01</span> What are you looking for?
            </legend>
            <div className="choice-grid two-columns">
              {[
                [
                  "COMPLETE_PC",
                  "Complete PC",
                  "A balanced, full system",
                  Layers,
                ],
                [
                  "INDIVIDUAL_COMPONENT",
                  "One component",
                  "An upgrade for your setup",
                  Cpu,
                ],
              ].map(([value, label, detail, Icon]) => (
                <button
                  type="button"
                  key={value}
                  className={`choice-card ${form.buildType === value ? "selected" : ""}`}
                  aria-pressed={form.buildType === value}
                  onClick={() => changeType(value)}
                >
                  <Icon size={21} aria-hidden="true" />
                  <span>{label}</span>
                  <small>{detail}</small>
                </button>
              ))}
            </div>
            {errors.buildType && (
              <p className="field-error">{errors.buildType}</p>
            )}
          </fieldset>
          {form.buildType === "INDIVIDUAL_COMPONENT" && (
            <>
              <label className="field-label" htmlFor="component">
                Component needed
                <select
                  id="component"
                  value={form.component}
                  onChange={(e) => update("component", e.target.value)}
                  aria-invalid={!!errors.component}
                  aria-describedby={
                    errors.component ? "component-error" : undefined
                  }
                >
                  {COMPONENTS.map((component) => (
                    <option key={component}>{component}</option>
                  ))}
                </select>
              </label>
              {errors.component && (
                <p id="component-error" className="field-error">
                  {errors.component}
                </p>
              )}
              <p className="field-help upgrade-note">
                This budget is for one part. Compatibility with your existing PC
                needs a separate check.
              </p>
            </>
          )}
          <BudgetField
            id="pc-budget"
            label={
              form.buildType === "COMPLETE_PC"
                ? "02 · Total build budget"
                : "02 · Component budget"
            }
            value={form.budget}
            onChange={(value) => update("budget", value)}
            {...range}
            error={errors.budget}
          />
          <fieldset>
            <legend>
              <span className="step-number">03</span> What will you use it for?
            </legend>
            <p className="field-help" id="purposes-help">
              Choose one or more. We’ll consider them together.
            </p>
            <div className="chip-group" role="group" aria-label="PC purposes">
              {PC_PURPOSES.map((purpose, index) => (
                <button
                  type="button"
                  key={purpose}
                  className={`chip ${form.purposes.includes(purpose) ? "selected" : ""}`}
                  aria-pressed={form.purposes.includes(purpose)}
                  aria-invalid={index === 0 && !!errors.purposes}
                  aria-describedby={`purposes-help${errors.purposes ? " purposes-error" : ""}`}
                  onClick={() =>
                    update("purposes", toggleItem(form.purposes, purpose))
                  }
                >
                  {purpose}
                </button>
              ))}
            </div>
            {errors.purposes && (
              <p id="purposes-error" className="field-error">
                {errors.purposes}
              </p>
            )}
          </fieldset>
          <Button
            type="submit"
            className="full-width"
            disabled={state.status === "loading"}
          >
            {state.status === "loading"
              ? "Finding your setup…"
              : "Recommend my PC"}
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
          <p className="form-footnote">
            <SlidersHorizontal size={14} aria-hidden="true" /> Your preferences,
            your budget. No account needed.
          </p>
        </form>
        <RecommendationResult
          kind="pc"
          state={state}
          isStale={isStale}
          onRetry={() => submit()}
          onCancel={cancel}
        />
      </div>
    </section>
  );
}
