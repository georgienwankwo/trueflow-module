import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Clicks from "./clicks";
import FormSubmissions from "./forms";
import MouseMoves from "./mouse_movements";
import DetectPageChange from "./page_change";
import Scrolls from "./scroll";

/**
 * Props for the FlowProvider component
 */
interface FlowProviderProps {
  /**
   * Child components to render inside FlowProvider
   */
  children: ReactNode;
  /**
   * Access key to authenticate the user
   */
  access_key: string;
  /**
   * User ID to identify the user
   */
  uid: string;
}

/**
 * A provider component that wraps child components and enables tracking of user interactions.
 * @param {FlowProviderProps} props - The props for the component
 * @returns {JSX.Element} - The FlowProvider component
 */
function FlowProvider({
  children,
  access_key,
  uid,
}: FlowProviderProps): JSX.Element {
  const [connectStatus, setConnectStatus] = useState(false);
  const [userId, setUserId] = useState(uid);
  const [recordingTypes, setRecordingTypes] = useState<string[]>([]);
  const [recordingsId, setRecordingsId] = useState<number>();
  const socketRef = useRef<Socket<any>>();
  const childRef = useRef(null);

  /**

  Get the functions to clean up the recording for clicks and the current click position.
  @param ref - Reference to the child element.
  @param allowRecord - Whether to allow recording clicks or not.
  @returns An object containing clickCleanup function and ClickPosition object.
  */
  const { clickCleanup, ClickPosition } = Clicks({
    ref: childRef,
    allowRecord: recordingTypes.includes("clicks"),
  });
  /**
  
  Get the current mouse position and the function to clean up the recording for mouse movements.
  @param ref - Reference to the child element.
  @param allowRecord - Whether to allow recording mouse movements or not.
  @returns An object containing MousePosition object and cleanupMoves function.
  */
  const { MousePosition, cleanupMoves } = MouseMoves({
    ref: childRef,
    allowRecord: recordingTypes.includes("movements"),
  });
  /**
  
  Get the form data and the function to clean up the recording for form submissions.
  @param allowRecord - Whether to allow recording form submissions or not.
  @returns An object containing the form data and formCleanup function.
  */
  const { form, formCleanup } = FormSubmissions({
    allowRecord: recordingTypes.includes("forms"),
  });
  /**
  
  Get the current scroll position and the function to clean up the recording for scrolls.
  @param allowRecord - Whether to allow recording scrolls or not.
  @returns An object containing ScrollPosition object and scrollCleanup function.
  */
  const { ScrollPosition, scrollCleanup } = Scrolls({
    allowRecord: recordingTypes.includes("scrolls"),
  });
  /**
  
  Get the page details and allow recording of page changes.
  @param allowRecord - Whether to allow recording page changes or not.
  @returns An object containing page details.
  */
  const pageDetails = DetectPageChange({ allowRecord: true });

  /**
   * Update the user ID when it changes.
   */
  useEffect(() => {
    setUserId(uid);
  }, [uid]);

  /**
   * Connect to the server and set up event listeners for connection and disconnection.
   */
  useEffect(() => {
    const socketOptions = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${access_key}`,
          },
        },
      },
    };
    const socket = io("http://localhost:3000/", socketOptions);

    socketRef.current = socket;
    socket.on("connect", () => {
      setConnectStatus(true);
    });

    socket.on("disconnect", () => {
      setConnectStatus(false);
    });

    return () => {
      socket.off("disconnect");
    };
  }, [access_key]);

  /**
   * Get the recording instructions when the user connects to the server.
   */
  const GetRecordingInstructions = useCallback(
    (data: { enabled: string[]; id: number }) => {
      setRecordingsId(data.id ?? undefined);
      setRecordingTypes(data.enabled);
    },
    []
  );

  /**
   * Send the page details to the server when the component mounts or updates.
   */
  useEffect(() => {
    if (!connectStatus) return;
    if (!socketRef.current) return;
    socketRef.current.emit("events", {
      events: pageDetails,
      recordingsId,
    });
  }, [pageDetails]);

  /**
   * Get the recording instructions when the user connects to the server.
   */
  useEffect(() => {
    if (!connectStatus) return;
    if (!socketRef.current) return;
    socketRef.current.emit("events", {
      events: pageDetails,
      recordingsId,
    });
  }, [pageDetails]);

  useEffect(() => {
    if (!connectStatus) return;
    if (!socketRef.current) return;
    socketRef.current.emit("getData", userId, GetRecordingInstructions);
  }, [connectStatus, userId]);

  useEffect(() => {
    /**
     * Send the event data to the server and clean up the event.
     * @param event The event data to be sent.
     * @param cleanup The function to clean up the event.
     */
    const sendEvent = (event: any, cleanup: () => void) => {
      if (!socketRef.current) return;
      if (connectStatus) {
        socketRef.current.emit("events", {
          event,
          recordingsId,
          ...pageDetails,
        });
        cleanup();
      }
    };

    /**

    Send click event to server.
    @param {Object} ClickPosition - The click event object.
    @param {Function} clickCleanup - The function to clean up click event.
    */
    if (ClickPosition) {
      sendEvent(ClickPosition, clickCleanup);
    }
    /**
    
    Send mouse move event to server.
    @param {Object} MousePosition - The mouse move event object.
    @param {Function} cleanupMoves - The function to clean up mouse move event.
    */
    if (MousePosition) {
      sendEvent(MousePosition, cleanupMoves);
    }
    /**
    
    Send form submission event to server.
    @param {Object} form - The form submission event object.
    @param {Function} formCleanup - The function to clean up form submission event.
    */
    if (form) {
      sendEvent(form, formCleanup);
    }
    /**
    
    Send scroll event to server.
    @param {Object} ScrollPosition - The scroll event object.
    @param {Function} scrollCleanup - The function to clean up scroll event.
    */
    if (ScrollPosition) {
      sendEvent(ScrollPosition, scrollCleanup);
    }
  }, [ClickPosition, MousePosition, pageDetails, form, ScrollPosition]);

  return <div ref={childRef}>{children}</div>;
}

export default FlowProvider;
