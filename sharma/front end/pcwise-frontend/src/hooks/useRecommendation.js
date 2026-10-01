import { useEffect, useRef, useState } from "react";
import { requestRecommendation } from "../services/api";
import { toRequest, validatePreferences } from "../lib/preferences";
export function useRecommendation(kind, defaults) {
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`pcwise-${kind}`));
      return saved && Object.keys(validatePreferences(kind, saved)).length === 0
        ? {
            ...defaults,
            ...saved,
          }
        : defaults;
    } catch {
      return defaults;
    }
  });
  const [state, setState] = useState({
    status: "idle",
    result: null,
    submitted: null,
    error: "",
  });
  const [errors, setErrors] = useState({});
  const controller = useRef(null);
  const generation = useRef(0);
  useEffect(() => {
    try {
      sessionStorage.setItem(`pcwise-${kind}`, JSON.stringify(form));
    } catch {
      /* Storage may be disabled. */
    }
  }, [kind, form]);
  useEffect(() => () => controller.current?.abort(), []);
  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }
  async function submit(event) {
    event?.preventDefault();
    controller.current?.abort();
    const id = ++generation.current;
    const fieldErrors = validatePreferences(kind, form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      setState((current) => ({
        ...current,
        status: current.result ? "success" : "idle",
        error: "",
      }));
      requestAnimationFrame(() =>
        document.querySelector(`#${kind}-form [aria-invalid="true"]`)?.focus(),
      );
      return;
    }
    const submitted = toRequest(kind, form);
    const nextController = new AbortController();
    controller.current = nextController;
    setState({
      status: "loading",
      result: null,
      submitted,
      error: "",
    });
    try {
      const result = await requestRecommendation(kind, submitted, {
        signal: nextController.signal,
      });
      if (generation.current === id)
        setState({
          status: "success",
          result,
          submitted,
          error: "",
        });
    } catch (error) {
      if (generation.current !== id || error.name === "AbortError") return;
      setErrors(error.fieldErrors || {});
      setState({
        status: "error",
        result: null,
        submitted,
        error: error.message,
      });
    }
  }
  function reset() {
    controller.current?.abort();
    generation.current++;
    setForm(defaults);
    setErrors({});
    setState({
      status: "idle",
      result: null,
      submitted: null,
      error: "",
    });
  }
  function cancel() {
    controller.current?.abort();
    generation.current++;
    setState({
      status: "idle",
      result: null,
      submitted: null,
      error: "",
    });
  }
  const isStale =
    state.submitted &&
    JSON.stringify(toRequest(kind, form)) !== JSON.stringify(state.submitted);
  return {
    form,
    update,
    errors,
    state,
    submit,
    reset,
    cancel,
    isStale,
  };
}
