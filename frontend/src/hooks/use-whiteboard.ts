import { useCallback, useEffect, useRef, useState } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";
import { getWhiteboard, saveWhiteboard } from "@/lib/api";

export interface WhiteboardSnapshot {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
}

interface UseWhiteboardOptions {
  roomCode: string;
  onLocalChange: (elements: readonly ExcalidrawElement[], appState: Partial<AppState>) => void;
}

export function useWhiteboard({ roomCode, onLocalChange }: UseWhiteboardOptions) {
  const [initialData, setInitialData] = useState<WhiteboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSceneRef = useRef<((snapshot: WhiteboardSnapshot) => void) | null>(null);
  const isRemoteUpdate = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref to the latest elements/appState so we can flush on unload
  const pendingRef = useRef<{ elements: readonly ExcalidrawElement[]; appState: Partial<AppState> } | null>(null);

  // Load saved state from DB when the room opens
  useEffect(() => {
    if (!roomCode) return;
    getWhiteboard(roomCode)
      .then((data) =>
        setInitialData({ elements: data.elements as ExcalidrawElement[], appState: data.app_state }),
      )
      .catch(() => setInitialData({ elements: [], appState: {} }))
      .finally(() => setLoading(false));
  }, [roomCode]);

  // Flush any pending save synchronously when the tab closes / user navigates away
  useEffect(() => {
    if (!roomCode) return;

    const flush = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      // navigator.sendBeacon sends the request even as the page unloads
      const body = JSON.stringify({
        elements: pending.elements,
        app_state: pending.appState,
      });
      navigator.sendBeacon(
        `http://localhost:8000/api/rooms/${roomCode}/whiteboard`,
        new Blob([body], { type: "application/json" }),
      );
    };

    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [roomCode]);

  /**
   * Called by WhiteboardPanel's onChange.
   * Broadcasts via WS and debounces DB save (1 s).
   */
  const handleLocalChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: Partial<AppState>) => {
      if (isRemoteUpdate.current) return;

      // track latest state for the unload flush
      pendingRef.current = { elements, appState };

      onLocalChange(elements, appState);

      // debounced DB save (1 s)
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveWhiteboard(roomCode, elements as ExcalidrawElement[], appState)
          .then(() => { pendingRef.current = null; }) // flushed — nothing pending anymore
          .catch(() => {});
      }, 1000);
    },
    [roomCode, onLocalChange],
  );

  const applyRemoteUpdate = useCallback((snapshot: WhiteboardSnapshot) => {
    isRemoteUpdate.current = true;
    updateSceneRef.current?.(snapshot);
    setTimeout(() => { isRemoteUpdate.current = false; }, 0);
  }, []);

  const registerUpdateScene = useCallback((fn: (s: WhiteboardSnapshot) => void) => {
    updateSceneRef.current = fn;
  }, []);

  return { initialData, loading, handleLocalChange, applyRemoteUpdate, registerUpdateScene };
}
