import { fabric } from "fabric-pure-browser";
import { useEffect, useRef } from "react";

export default function Whiteboard({ selectedTool }) {
  const canvasRef = useRef(null);
  const canvasObj = useRef(null);

  const history = useRef([]);
  const redoStack = useRef([]);

  // -------------------------------
  // INIT CANVAS (Run only once)
  // -------------------------------
  useEffect(() => {
    if (canvasObj.current) return; // prevent duplicate init

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 650,
      backgroundColor: "white",
      selection: true,
      preserveObjectStacking: true,
    });

    canvasObj.current = canvas;

    saveState();
  }, []);

  // -------------------------------
  // SAVE CANVAS STATE
  // -------------------------------
  const saveState = () => {
    const json = canvasObj.current.toJSON();
    history.current.push(json);
  };

  const undo = () => {
    if (history.current.length <= 1) return;

    redoStack.current.push(history.current.pop());
    const prev = history.current[history.current.length - 1];
    canvasObj.current.loadFromJSON(prev, () => canvasObj.current.renderAll());
  };

  const redo = () => {
    if (!redoStack.current.length) return;

    const state = redoStack.current.pop();
    history.current.push(state);
    canvasObj.current.loadFromJSON(state, () => canvasObj.current.renderAll());
  };

  // -------------------------------
  // TOOLS HANDLER
  // -------------------------------
  useEffect(() => {
    if (!selectedTool || !canvasObj.current) return;

    const canvas = canvasObj.current;
    const tool = selectedTool.type;

    // STOP ALL EXISTING EVENTS (fix stuck canvas)
    canvas.off("mouse:down");
    canvas.isDrawingMode = false;

    // ----------------------------
    // PEN TOOL
    // ----------------------------
    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 3;
      return;
    }

    // ----------------------------
    // RECTANGLE TOOL
    // ----------------------------
    if (tool === "rect") {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 160,
        height: 90,
        fill: "transparent",
        stroke: "black",
        strokeWidth: 2,
        selectable: true,
      });

      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.renderAll();
      saveState();
      return;
    }

    // ----------------------------
    // CIRCLE TOOL
    // ----------------------------
    if (tool === "circle") {
      const circle = new fabric.Circle({
        left: 120,
        top: 120,
        radius: 50,
        fill: "transparent",
        stroke: "black",
        strokeWidth: 2,
        selectable: true,
      });

      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.renderAll();
      saveState();
      return;
    }

    // ----------------------------
    // ARROW TOOL
    // ----------------------------
    if (tool === "arrow") {
      const line = new fabric.Line([50, 100, 200, 100], {
        stroke: "black",
        strokeWidth: 2,
      });

      const arrowHead = new fabric.Triangle({
        left: 200,
        top: 95,
        width: 15,
        height: 15,
        angle: 90,
        fill: "black",
      });

      const arrow = new fabric.Group([line, arrowHead], {
        selectable: true,
      });

      canvas.add(arrow);
      canvas.setActiveObject(arrow);
      canvas.renderAll();
      saveState();
      return;
    }

    // ----------------------------
    // TEXT TOOL
    // ----------------------------
    if (tool === "text") {
      const text = new fabric.IText("Type here...", {
        left: 150,
        top: 150,
        fontSize: 22,
        fill: "#000",
        editable: true,
        selectable: true,
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      saveState();
      return;
    }

    // ----------------------------
    // ERASER TOOL
    // ----------------------------
    if (tool === "eraser") {
      canvas.on("mouse:down", (e) => {
        if (e.target) {
          canvas.remove(e.target);
          canvas.renderAll();
          saveState();
        }
      });
      return;
    }
  }, [selectedTool]);

  // ----------------------------
  // CLEAR CANVAS
  // ----------------------------
  const clearCanvas = () => {
    const canvas = canvasObj.current;
    canvas.clear();
    canvas.backgroundColor = "white";
    canvas.renderAll();
    saveState();
  };

  // ----------------------------
  // SAVE IMAGE
  // ----------------------------
  const saveImage = () => {
    const dataURL = canvasObj.current.toDataURL("png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "system-design.png";
    link.click();
  };

  return (
    <div className="p-4 flex justify-center">
      <canvas ref={canvasRef} className="border rounded-md shadow" />

      {/* Hidden Controls */}
      <button id="undo-btn" onClick={undo}></button>
      <button id="redo-btn" onClick={redo}></button>
      <button id="clear-btn" onClick={clearCanvas}></button>
      <button id="save-btn" onClick={saveImage}></button>
    </div>
  );
}
