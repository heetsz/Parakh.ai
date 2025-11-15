import { fabric } from "fabric-pure-browser";
import { useEffect, useRef, useCallback } from "react";

export default function Whiteboard({ selectedTool }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasObj = useRef(null);

  const history = useRef([]);
  const redoStack = useRef([]);
  const dprRef = useRef(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  const brushBaseWidth = 3; // desired CSS pixel width for pen
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const pinch = useRef({ active: false, distance: 0, center: null, baseZoom: 1 });

  // -------------------------------
  // INIT CANVAS (Run only once)
  // -------------------------------
  // Helper to size the canvas to the container and DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasObj.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ratio = dprRef.current || 1;
    const containerWidth = Math.max(320, container.clientWidth);
    // Height: fill available viewport from container's top downwards
    const top = container.getBoundingClientRect().top;
    const available = Math.max(300, Math.floor(window.innerHeight - top - 24));
    const width = containerWidth;
    const height = available;

    // Backing store size for crisp drawing on HiDPI
    canvas.setWidth(width * ratio);
    canvas.setHeight(height * ratio);
    canvas.getElement().style.width = `${width}px`;
    canvas.getElement().style.height = `${height}px`;
    canvas.setZoom(ratio);
    canvas.renderAll();
  }, []);

  useEffect(() => {
    if (canvasObj.current) return; // prevent duplicate init

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "white",
      selection: true,
      preserveObjectStacking: true,
    });

    canvasObj.current = canvas;

    // Initial size
    resizeCanvas();

    // Resize on window changes and orientation change
    const onResize = () => requestAnimationFrame(resizeCanvas);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    saveState();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      canvas.dispose();
      canvasObj.current = null;
    };
  }, [resizeCanvas]);

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
      const ratio = dprRef.current || 1;
      canvas.freeDrawingBrush.width = brushBaseWidth / ratio;
      return;
    }

    // PAN TOOL (one-finger drag)
    if (tool === "pan") {
      const down = (opt) => {
        isDragging.current = true;
        canvas.selection = false;
        lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
      };
      const move = (opt) => {
        if (!isDragging.current) return;
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPos.current.x;
        vpt[5] += e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        canvas.requestRenderAll();
      };
      const up = () => {
        isDragging.current = false;
        canvas.selection = true;
      };
      canvas.on("mouse:down", down);
      canvas.on("mouse:move", move);
      canvas.on("mouse:up", up);
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
  // ZOOM HELPERS + FIT
  // ----------------------------
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const minZoom = dprRef.current * 0.5;
  const maxZoom = dprRef.current * 3;
  const zoomTo = (nextZoom, point) => {
    const canvas = canvasObj.current;
    const p = point || new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(p, clamp(nextZoom, minZoom, maxZoom));
    canvas.requestRenderAll();
  };
  const zoomIn = () => zoomTo(canvasObj.current.getZoom() * 1.15);
  const zoomOut = () => zoomTo(canvasObj.current.getZoom() / 1.15);
  const fitToScreen = () => {
    const base = dprRef.current;
    const canvas = canvasObj.current;
    canvas.setViewportTransform([base, 0, 0, base, 0, 0]);
    canvas.requestRenderAll();
  };

  // Expose controls via hidden buttons like other actions
  useEffect(() => {
    const zin = document.getElementById('zoom-in-btn');
    const zout = document.getElementById('zoom-out-btn');
    const fit = document.getElementById('fit-btn');
    if (zin) zin.onclick = zoomIn;
    if (zout) zout.onclick = zoomOut;
    if (fit) fit.onclick = fitToScreen;
  }, []);

  // ----------------------------
  // TOUCH: PINCH TO ZOOM (two fingers)
  // ----------------------------
  useEffect(() => {
    const canvas = canvasObj.current;
    if (!canvas) return;
    const el = canvas.getElement();

    const getCenter = (t1, t2) => ({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 });
    const dist = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinch.current.active = true;
        pinch.current.distance = dist(e.touches[0], e.touches[1]);
        pinch.current.center = getCenter(e.touches[0], e.touches[1]);
        pinch.current.baseZoom = canvas.getZoom();
      }
    };
    const onTouchMove = (e) => {
      if (!pinch.current.active || e.touches.length !== 2) return;
      e.preventDefault();
      const d = dist(e.touches[0], e.touches[1]);
      const scale = d / (pinch.current.distance || d);
      const nextZoom = clamp(pinch.current.baseZoom * scale, minZoom, maxZoom);
      const pt = new fabric.Point((pinch.current.center.x) * dprRef.current, (pinch.current.center.y) * dprRef.current);
      zoomTo(nextZoom, pt);
    };
    const onTouchEnd = () => {
      pinch.current.active = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

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
    <div ref={containerRef} className="p-2 sm:p-4 flex justify-center w-full">
      <canvas
        ref={canvasRef}
        className="border rounded-md shadow max-w-full touch-none"
        style={{ touchAction: "none" }}
      />

      {/* Hidden Controls */}
      <button id="undo-btn" onClick={undo}></button>
      <button id="redo-btn" onClick={redo}></button>
      <button id="clear-btn" onClick={clearCanvas}></button>
      <button id="zoom-in-btn"></button>
      <button id="zoom-out-btn"></button>
      <button id="fit-btn"></button>
      <button id="save-btn" onClick={saveImage}></button>
    </div>
  );
}
