import { useEffect, useState } from "react";

/**
 * Props for the DetectPageChange component.
 * @interface DetectPageChangeProps
 * @property {boolean} [allowRecord] - Whether recording is allowed.
 */
interface DetectPageChangeProps {
  allowRecord?: boolean;
}

/**
 * Component that detects changes in the browser's URL and updates the state with the new URL and title.
 * @param {DetectPageChangeProps} props - The component props.
 * @returns {Object|null} - The current page details or null if recording is not allowed.
 */
function DetectPageChange({
  allowRecord,
}: DetectPageChangeProps): object | null {
  /**
   * The state that holds the current page details.
   * @type {[Object|null, function]}
   */
  const [pageDetails, setPageDetails] = useState({
    url: window.location.href,
    title: document.title,
  });

  useEffect(() => {
    if (!allowRecord) return;

    /**
     * The interval ID returned by setInterval.
     * @type {number}
     */
    const intervalId: number = setInterval(() => {
      if (window.location.href !== pageDetails?.url) {
        setPageDetails({
          url: window.location.href,
          title: document.title,
        });
      }
    }, 1);

    /**
     * Cleanup function to clear the interval when the component unmounts.
     */
    return () => {
      clearInterval(intervalId);
    };
  }, [allowRecord, pageDetails]);

  return pageDetails;
}

export default DetectPageChange;
