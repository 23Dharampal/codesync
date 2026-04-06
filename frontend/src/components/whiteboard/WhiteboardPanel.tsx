import { useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { WhiteboardSnapshot } from "@/hooks/use-whiteboard";

interface Props {
  initialData: WhiteboardSnapshot | null;
  onChange: (elements: readonly ExcalidrawElement[], appState: WhiteboardSnapshot["appState"]) => void;
  registerUpdateScene: (fn: (snapshot: WhiteboardSnapshot) => void) => void;
}

export default function WhiteboardPanel({ initialData, onChange, registerUpdateScene }: Props) {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    registerUpdateScene((snapshot: WhiteboardSnapshot) => {
      excalidrawApiRef.current?.updateScene({
        elements: snapshot.elements as ExcalidrawElement[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appState: snapshot.appState as any,
      });
    });
  }, [registerUpdateScene]);

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={(api) => { excalidrawApiRef.current = api; }}
        initialData={
          initialData
            ? {
                elements: initialData.elements as ExcalidrawElement[],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                appState: { ...initialData.appState, collaborators: new Map() } as any,
              }
            : undefined
        }
        onChange={(elements, appState) => {
          onChange(elements, {
            viewBackgroundColor: appState.viewBackgroundColor,
            theme: appState.theme,
          });
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      />
    </div>
  );
}
