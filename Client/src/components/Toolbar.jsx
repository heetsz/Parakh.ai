import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PenTool,
  Square,
  Circle,
  Minus,
  Type,
  Eraser,
  Undo,
  Redo,
  Trash,
  Save,
} from "lucide-react";

export default function Toolbar({ setSelectedTool }) {
  // Important: include timestamp so clicking same tool twice triggers update!
  const chooseTool = (type) => {
    setSelectedTool({ type, time: Date.now() });
  };

  return (
    <div className="w-full flex items-center gap-2 p-3 border-b bg-muted/30">

      <Button variant="outline" onClick={() => chooseTool("pen")}>
        <PenTool size={18} />
      </Button>

      <Button variant="outline" onClick={() => chooseTool("rect")}>
        <Square size={18} />
      </Button>

      <Button variant="outline" onClick={() => chooseTool("circle")}>
        <Circle size={18} />
      </Button>

      <Button variant="outline" onClick={() => chooseTool("arrow")}>
        <Minus size={18} />
      </Button>

      <Button variant="outline" onClick={() => chooseTool("text")}>
        <Type size={18} />
      </Button>

      <Button variant="outline" onClick={() => chooseTool("eraser")}>
        <Eraser size={18} />
      </Button>

      <Separator orientation="vertical" className="mx-2" />

      <Button variant="outline" onClick={() =>
        document.getElementById("undo-btn").click()
      }>
        <Undo size={18} />
      </Button>

      <Button variant="outline" onClick={() =>
        document.getElementById("redo-btn").click()
      }>
        <Redo size={18} />
      </Button>

      <Separator orientation="vertical" className="mx-2" />

      <Button variant="destructive" onClick={() =>
        document.getElementById("clear-btn").click()
      }>
        <Trash size={18} />
      </Button>

      <Button variant="default" onClick={() =>
        document.getElementById("save-btn").click()
      }>
        <Save size={18} />
      </Button>

    </div>
  );
}
