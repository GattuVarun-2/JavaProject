export const PC_PURPOSES = [
  "Gaming",
  "Programming",
  "Video Editing",
  "Photo Editing",
  "Office",
  "Streaming",
];
export const PERIPHERAL_PURPOSES = [
  "Gaming",
  "Programming",
  "Content Creation",
  "Office",
  "Study",
];
export const COMPONENTS = [
  "CPU",
  "GPU",
  "Motherboard",
  "RAM",
  "SSD",
  "PSU",
  "Cabinet",
  "Cooler",
];
export const PERIPHERALS = ["Monitor", "Keyboard", "Mouse"];
export const PC_DEFAULTS = {
  buildType: "COMPLETE_PC",
  budget: 120000,
  purposes: ["Gaming"],
  component: "CPU",
};
export const PERIPHERAL_DEFAULTS = {
  budget: 20000,
  purpose: "Gaming",
  categories: ["Monitor"],
};
export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export function budgetRange(kind, buildType) {
  return kind === "peripherals"
    ? {
        min: 3000,
        max: 50000,
        step: 1000,
      }
    : buildType === "INDIVIDUAL_COMPONENT"
      ? {
          min: 1000,
          max: 150000,
          step: 500,
        }
      : {
          min: 50000,
          max: 200000,
          step: 5000,
        };
}
export function validatePreferences(kind, form) {
  const errors = {};
  const { min, max } = budgetRange(kind, form.buildType);
  if (!Number.isInteger(form.budget) || form.budget < min || form.budget > max)
    errors.budget = `Enter a whole-rupee budget between ${money(min)} and ${money(max)}.`;
  if (kind === "pc") {
    if (!["COMPLETE_PC", "INDIVIDUAL_COMPONENT"].includes(form.buildType))
      errors.buildType = "Choose a build type.";
    if (
      !Array.isArray(form.purposes) ||
      !form.purposes.length ||
      form.purposes.some((p) => !PC_PURPOSES.includes(p))
    )
      errors.purposes = "Select at least one purpose.";
    if (
      form.buildType === "INDIVIDUAL_COMPONENT" &&
      !COMPONENTS.includes(form.component)
    )
      errors.component = "Choose a component.";
  } else {
    if (!PERIPHERAL_PURPOSES.includes(form.purpose))
      errors.purpose = "Choose a purpose.";
    if (
      !Array.isArray(form.categories) ||
      !form.categories.length ||
      form.categories.some((p) => !PERIPHERALS.includes(p))
    )
      errors.categories = "Select at least one accessory.";
  }
  return errors;
}
export function toRequest(kind, form) {
  return kind === "pc"
    ? {
        buildType: form.buildType,
        budget: form.budget,
        purposes: [...form.purposes],
        ...(form.buildType === "INDIVIDUAL_COMPONENT"
          ? {
              component: form.component,
            }
          : {}),
      }
    : {
        budget: form.budget,
        purpose: form.purpose,
        categories: [...form.categories],
      };
}
export const toggleItem = (items, item) =>
  items.includes(item)
    ? items.filter((value) => value !== item)
    : [...items, item];
