import { useState } from "react";
import Toolbar from "@/components/Toolbar";
import Whiteboard from "@/components/Whiteboard";

export default function SystemDesignBoard() {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <div className="w-full h-full">
      <Toolbar setSelectedTool={setSelectedTool} />
      <Whiteboard selectedTool={selectedTool} />
    </div>
  );
}
