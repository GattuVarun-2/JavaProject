import { money } from "../lib/preferences";
export default function BudgetField({
  id,
  value,
  onChange,
  min,
  max,
  step,
  error,
  label = "Your budget",
}) {
  return (
    <fieldset className="budget-field">
      <legend>{label}</legend>
      <div className="budget-control">
        <span aria-hidden="true">₹</span>
        <input
          id={`${id}-amount`}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          aria-label={`${label} in rupees`}
          aria-invalid={!!error}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        />
        <span className="currency-label">INR</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={
          Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
        }
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        aria-valuetext={money(Number(value) || min)}
      />
      <div className="range-labels">
        <span>{money(min)}</span>
        <span>{money(max)}</span>
      </div>
      <p className="field-help" id={`${id}-help`}>
        Slide to explore, or type an exact amount.
      </p>
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
