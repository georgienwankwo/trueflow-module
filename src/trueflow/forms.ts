import { useEffect, useState } from "react";

/**
 * Props for the FormSubmissions component.
 *
 * @interface FormSubmissionsProps
 * @property {boolean=} allowRecord - Whether to allow form submissions to be recorded.
 */

interface FormSubmissionsProps {
  allowRecord?: boolean;
}

/**
 * A component that allows you to capture and display form submissions.
 *
 * @param {FormSubmissionsProps} props - The component props.
 * @returns {{form: any, formCleanup: function}} - An object with the current form data and a cleanup function.
 */
function FormSubmissions({ allowRecord }: FormSubmissionsProps): {
  form: any;
  formCleanup: () => void;
} {
  const [form, setForm] = useState<any>();

  /**
   * A function that handles form submissions.
   *
   * @param {SubmitEvent} e - The form submission event.
   */
  function handleFormSubmissions(e: SubmitEvent) {
    if (!allowRecord) return;
    e.preventDefault();
    let shouldPreventDefault = true;

    const data = new FormData(e.target as HTMLFormElement);

    if (shouldPreventDefault) {
      const passwordInputs = document.querySelectorAll<HTMLFormElement>(
        'input[type="password"]'
      );

      passwordInputs.forEach((input) => data.delete(input.name));

      const newData: any = {};

      for (const [key, value] of data.entries()) {
        newData[key] = value;
      }

      setForm(newData);
      shouldPreventDefault = false;
    }

    if (!shouldPreventDefault) {
      e.preventDefault();
    }
  }

  useEffect(() => {
    window.addEventListener("submit", handleFormSubmissions);

    return () => window.removeEventListener("submit", handleFormSubmissions);
  }, [allowRecord]);

  /**
   * A function that resets the form data.
   */
  const formCleanup = () => {
    setForm(null);
  };

  // Return an object with the current form data and the cleanup function
  return { form, formCleanup };
}

export default FormSubmissions;
