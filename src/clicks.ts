import React, { RefObject, useEffect, useState } from "react";

interface ClickProps {
  ref: RefObject<HTMLDivElement>;
  allowRecord?: boolean;
}

interface ClickPositionProps {
  pageX: number;
  pageY: number;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
  isClickable: boolean;
  clickType: string;
  clickableElement: string | null;
  tree: string | undefined;
  type: "click";
  context: string | null;
}

/**
 * The Clicks component listens for mouse clicks and records their position,
 * type, and context.
 * @param {ClickProps} props - The props for the component.
 * @returns {ClickPositionProps | null} - The position of the mouse click or null.
 */
function Clicks({ ref, allowRecord }: ClickProps) {
  /**
   * State variable to hold the data for the most recent click event
   */
  const [ClickPosition, setClickPosition] =
    useState<ClickPositionProps | null>();

  /**
   * Event handler function that gets called whenever a mousedown event occurs on the container element
   * @param e - The MouseEvent object for the mousedown event
   */
  function handleMouseClick(e: MouseEvent) {
    // If recording is not allowed, do nothing
    if (!allowRecord) return;

    // Get the element that was clicked
    const target = e.target as HTMLElement;

    // Initialize some variables to store data about the click event
    let windowWidth = 0;
    let windowHeight = 0;

    // If running in a browser, get the width and height of the window
    if (window) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    }

    // Get the timestamp for the click event
    const timestamp = new Date().getTime();

    // Function to check if an element is clickable
    const isClickable = () => {
      // Check if the element has an onclick handler
      const isClickable = target.onclick !== null;

      // Check if the element is one of several clickable HTML tags
      const clickableTags = [
        "a",
        "button",
        "input",
        'input[type="submit"]',
        "[onclick]",
      ];
      const isClickableTag = clickableTags.includes(
        target.tagName.toLowerCase()
      );

      // Check if the element has a data-clickable attribute
      if (
        isClickable ||
        isClickableTag ||
        target.getAttribute("data-clickable")
      ) {
        return true;
      }

      return false;
    };

    // Get the type of mouse click event
    let clickType = "";
    if (e.button === 0) {
      clickType = "left";
    } else if (e.button === 2) {
      clickType = "right";
    }

    // Get the clickable element, if any
    let clickableElement: string | null = null;
    let element: HTMLElement | null = null;

    if (isClickable()) {
      element = e.target as HTMLElement;
      clickableElement = element.nodeName.toLowerCase();
    }

    // Get the HTML tree path of the clickable element, if any
    let tree: HTMLElement[] = [];

    if (clickableElement !== null) {
      let currentElement: HTMLElement | null = element;

      while (currentElement) {
        // Traverse the DOM from the current element up to the topmost element (html tag)
        // and add each element to the tree array in reverse order
        tree.unshift(currentElement);
        currentElement = currentElement.parentElement;
      }
    }

    // Convert the tree array to a string in the form of "tag1 > tag2 > tag3" for readability
    let treeAsString: string | undefined = tree
      .map((element) => element.tagName)
      .join(" > ")
      .toLowerCase();

    // If the treeAsString is empty, set it to undefined for consistency
    if (treeAsString === "") {
      treeAsString = undefined;
    }

    // Get the bounding rectangle of the target element relative to the top-left corner of the viewport
    const boundingRect: DOMRect | undefined =
      ref.current?.getBoundingClientRect();

    // Calculate the position of the mouse click relative to the top-left corner of the bounding rectangle
    const pageX: number = e.pageX - (boundingRect?.left ?? 0);
    const pageY: number = e.pageY - (boundingRect?.top ?? 0);

    // Create a new ClickPosition object with the calculated values and update the state with it
    setClickPosition({
      pageX,
      pageY,
      windowWidth,
      windowHeight,
      timestamp,
      isClickable: isClickable(),
      clickType,
      clickableElement,
      tree: treeAsString,
      type: "click",
      context: target.getAttribute("data-readable"),
    });
  }

  useEffect(() => {
    // Add event listener for mousedown events
    window.addEventListener("mousedown", handleMouseClick);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("mousedown", handleMouseClick);
    };
  }, [ClickPosition, allowRecord]);

  /**

Cleans up the ClickPosition state by setting it to null.
*/
  const clickCleanup = () => {
    setClickPosition(null);
  };
  // Return the current ClickPosition state and the cleanup function
  return { ClickPosition, clickCleanup };
}

export default Clicks;
