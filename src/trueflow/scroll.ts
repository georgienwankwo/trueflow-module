import { useEffect, useState } from "react";

/**
 * Props for the Scrolls component
 * @interface ScrollsProps
 * @property {boolean=} allowRecord - Optional boolean prop indicating whether to record scroll position
 */
interface ScrollsProps {
  allowRecord?: boolean;
}

/**
 * Scroll position data
 * @interface ScrollPositionProps
 * @property {number} scrollX - The horizontal scroll position
 * @property {number} scrollY - The vertical scroll position
 * @property {number} windowWidth - The width of the browser window
 * @property {number} windowHeight - The height of the browser window
 * @property {number} timestamp - The timestamp (in milliseconds) when the scroll position was recorded
 */
export interface ScrollPositionProps {
  scrollX: number;
  scrollY: number;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
}

/**
 * Scroll position recorder
 * @param {ScrollsProps} props - The component props
 * @returns {Object} An object containing the scroll position data and a cleanup function
 */
function Scrolls({ allowRecord }: ScrollsProps) {
  const [ScrollPosition, setScrollPosition] =
    useState<ScrollPositionProps | null>();

  function handleMouseScroll(e: Event) {
    // If allowRecord is false, do not record scroll position
    if (!allowRecord) return;

    // Get the width and height of the browser window
    let windowWidth = 0;
    let windowHeight = 0;

    if (window) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    }

    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Record the scroll position data
    setScrollPosition({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      windowWidth,
      windowHeight,
      timestamp,
    });
  }

  // Add an event listener for scroll events when the component mounts
  useEffect(() => {
    window.addEventListener("scroll", handleMouseScroll);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleMouseScroll);
    };
  }, [ScrollPosition, allowRecord]);

  // Function to reset the scroll position data
  const scrollCleanup = () => {
    setScrollPosition(null);
  };

  // Return an object containing the scroll position data and the cleanup function
  return { ScrollPosition, scrollCleanup };
}

export default Scrolls;
