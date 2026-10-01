import {
  ArrowRight,
  Keyboard,
  Monitor,
  Mouse,
  PackageSearch,
} from "lucide-react";
import Button from "../components/Button";
import BudgetField from "../components/BudgetField";
import RecommendationResult from "../components/RecommendationResult";
import { useRecommendation } from "../hooks/useRecommendation";
import {
  budgetRange,
  PERIPHERAL_DEFAULTS,
  PERIPHERAL_PURPOSES,
  toggleItem,
} from "../lib/preferences";
const productTypes = [
  {
    name: "Monitor",
    icon: Monitor,
  },
  {
    name: "Keyboard",
    icon: Keyboard,
  },
  {
    name: "Mouse",
    icon: Mouse,
  },
];
export default function Peripherals() {
  const { form, update, errors, state, submit, reset, cancel, isStale } =
    useRecommendation("peripherals", PERIPHERAL_DEFAULTS);
  return (
    <section className="page-section container">
      <div className="page-intro">
        <p className="eyebrow">
          <PackageSearch size={16} aria-hidden="true" /> THE FINISHING TOUCHES
        </p>
        <h1>
          Make the setup
          <br />
          <span>feel like yours.</span>
        </h1>
        <p>
          The screen you look at. The keys you use. Find everyday essentials
          that fit your work, play, and budget.
        </p>
      </div>
      <div className="builder-layout">
        <form
          id="peripherals-form"
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
              <span className="step-number">01</span> Complete your desk
            </legend>
            <p className="field-help">Choose one or more accessories.</p>
            <div className="choice-grid three-columns">
              {productTypes.map(({ name, icon: Icon }, index) => (
                <button
                  type="button"
                  key={name}
                  className={`choice-card icon-choice ${form.categories.includes(name) ? "selected" : ""}`}
                  aria-pressed={form.categories.includes(name)}
                  aria-invalid={index === 0 && !!errors.categories}
                  aria-describedby={
                    errors.categories ? "categories-error" : undefined
                  }
                  onClick={() =>
                    update("categories", toggleItem(form.categories, name))
                  }
                >
                  <Icon size={24} aria-hidden="true" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p id="categories-error" className="field-error">
                {errors.categories}
              </p>
            )}
          </fieldset>
          <BudgetField
            id="peripheral-budget"
            label="02 · Shared accessory budget"
            value={form.budget}
            onChange={(value) => update("budget", value)}
            {...budgetRange("peripherals")}
            error={errors.budget}
          />
          <p className="field-help upgrade-note">
            One total budget for all selected accessories.
          </p>
          <label className="field-label" htmlFor="peripheral-purpose">
            <span className="step-number">03</span> Primary purpose
            <select
              id="peripheral-purpose"
              value={form.purpose}
              onChange={(e) => update("purpose", e.target.value)}
              aria-invalid={!!errors.purpose}
              aria-describedby={errors.purpose ? "purpose-error" : undefined}
            >
              {PERIPHERAL_PURPOSES.map((purpose) => (
                <option key={purpose}>{purpose}</option>
              ))}
            </select>
          </label>
          {errors.purpose && (
            <p id="purpose-error" className="field-error">
              {errors.purpose}
            </p>
          )}
          <Button
            type="submit"
            className="full-width"
            disabled={state.status === "loading"}
          >
            {state.status === "loading"
              ? "Finding your essentials…"
              : "Recommend peripherals"}
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
          <p className="form-footnote">
            A setup that works together, within one budget.
          </p>
        </form>
        <RecommendationResult
          kind="peripherals"
          state={state}
          isStale={isStale}
          onRetry={() => submit()}
          onCancel={cancel}
        />
      </div>
    </section>
  );
}
