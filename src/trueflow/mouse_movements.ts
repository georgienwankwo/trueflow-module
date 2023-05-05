import React, { RefObject, useEffect, useState } from "react";

interface MouseMoveProps {
  ref: RefObject<HTMLDivElement>;
  allowRecord?: boolean;
}

/**

Interface representing the properties of the MousePosition object.
@interface MousePositionProps
@property {number} pageX - The x-coordinate of the mouse pointer relative to the left edge of the page.
@property {number} pageY - The y-coordinate of the mouse pointer relative to the top edge of the page.
@property {number} windowWidth - The width of the browser window.
@property {number} windowHeight - The height of the browser window.
@property {number} timestamp - The timestamp when the mouse position was recorded.
@property {boolean} isClickable - Whether the mouse is over a clickable element.
@property {string|null} clickableElement - The name of the clickable element, if the mouse is over one.
@property {"move"} type - The type of mouse event (move).
@property {string|undefined} tree - The tree of elements that the mouse is over, formatted as a string.
@property {string|null} context - The data-readable attribute of the element that the mouse is over, if it exists.
*/

interface MousePositionProps {
  pageX: number;
  pageY: number;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
  isClickable: boolean;
  clickableElement: string | null;
  type: "move";
  tree: string | undefined;
  context: string | null;
}

/**
 * React component that tracks mouse movements within a div element
 * @param {MouseMoveProps} props - Props for MouseMoves component
 * @returns {{MousePosition: MousePositionProps|null, cleanupMoves: function}} - Returns an object with the current MousePosition and a cleanup function
 */
function MouseMoves({ ref, allowRecord }: MouseMoveProps) {
  const [MousePosition, setMousePosition] =
    useState<MousePositionProps | null>();

  /**
   * Function to handle mouse movement events
   * @param {MouseEvent} e - Mouse event object
   */
  function handleMouseMove(e: MouseEvent) {
    if (!allowRecord) return;

    // Get the target element
    const target = e.target as HTMLElement;

    // Get the browser window dimensions
    let windowWidth = 0;
    let windowHeight = 0;
    if (window) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    }

    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Function to check if an element is clickable
    const isClickable = () => {
      const isClickable = target.onclick !== null;

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
    let tree = [];

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
    let treeAsString: undefined | string = tree
      .map((element) => element.tagName)
      .join(" > ")
      .toLowerCase();

    // If the treeAsString is empty, set it to undefined for consistency
    if (treeAsString === "") {
      treeAsString = undefined;
    }

    // Get the bounding rectangle of the target element relative to the top-left corner of the viewport
    const boundingRect = ref.current?.getBoundingClientRect();

    // Calculate the position of the mouse relative to the top-left corner of the bounding rectangle
    const pageX = e.pageX - (boundingRect?.left ?? 0);
    const pageY = e.pageY - (boundingRect?.top ?? 0);

    // Create a new MousePosition object with the calculated values and update the state with it
    setMousePosition({
      pageX,
      pageY,
      windowWidth,
      windowHeight,
      timestamp,
      isClickable: isClickable(),
      clickableElement,
      tree: treeAsString,
      type: "move",
      context: target.getAttribute("data-readable"),
    });
  }

  useEffect(() => {
    // Add event listener for mousemove events
    window.addEventListener("mousemove", handleMouseMove);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [MousePosition, allowRecord]);

  /**

Cleans up the MousePosition state by setting it to null.
*/
  const cleanupMoves = () => {
    setMousePosition(null);
  };
  // Return the current MousePosition state and the cleanup function
  return { MousePosition, cleanupMoves };
}

export default MouseMoves;
