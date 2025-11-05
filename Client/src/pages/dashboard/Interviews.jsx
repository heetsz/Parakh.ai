import { useEffect, useRef, useState } from "react";

export default function InterviewAgent() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const chunksRef = useRef([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/interview");
    setSocket(ws);

    ws.onmessage = async (event) => {
      // Server sends first a JSON text message, then a binary audio message
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "response") {
            setMessages((prev) => [
              ...prev,
              { from: "you", text: data.transcript, ts: new Date() },
              { from: "bot", text: data.text, ts: new Date() },
            ]);
          }
        } catch {
          // Raw text fallback
          setMessages((prev) => [...prev, { from: "bot", text: event.data, ts: new Date() }]);
        }
      } else {
        // Binary audio: play it
        const blob = new Blob([event.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audioEl = audioPlayerRef.current;
        if (audioEl) {
          audioEl.src = url;
          audioEl.play().catch(() => {});
        }
      }
    };

    return () => ws.close();
  }, []);

  // Auto-scroll transcript as new messages arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          // Collect chunks locally; we'll send a single finalized Blob on stop
          chunksRef.current.push(e.data);
        }
      };

      mr.start(1000); // emit chunks every 1s
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = async () => {
        try {
          // Build a single finalized Blob to ensure a valid WebM container
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const buf = await blob.arrayBuffer();
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(buf);
            // Now signal the server that the segment is complete
            try {
              socket.send(JSON.stringify({ type: "segment_end" }));
            } catch {
              socket.send("segment_end");
            }
          }
        } catch (e) {
          console.error("Finalize/send error:", e);
        } finally {
          chunksRef.current = [];
        }
      };
      mr.stop();
      mr.stream.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  };

  // Push-to-talk helpers
  const handlePTTDown = async () => {
    if (!recording) await startRecording();
  };
  const handlePTTUp = () => {
    if (recording) stopRecording();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">AI Interviewer</h2>
      <div className="flex items-center gap-3">
        {/* Tap to toggle */}
        {!recording ? (
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={startRecording}>Start Talking</button>
        ) : (
          <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={stopRecording}>Stop</button>
        )}

        {/* Push-to-talk (hold to record) */}
        <button
          className="px-3 py-2 rounded bg-gray-200 text-gray-900"
          onMouseDown={handlePTTDown}
          onMouseUp={handlePTTUp}
          onMouseLeave={handlePTTUp}
          onTouchStart={handlePTTDown}
          onTouchEnd={handlePTTUp}
        >
          Hold to Talk
        </button>
        <audio ref={audioPlayerRef} />
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded bg-gray-100 border"
          onClick={() => setShowTranscript((s) => !s)}
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>
        <button
          className="px-3 py-1.5 rounded bg-gray-100 border"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          Clear
        </button>
        <span className={`text-sm ${recording ? "text-red-600" : "text-gray-500"}`}>
          {recording ? "Recording…" : "Idle"}
        </span>
      </div>

      {showTranscript && (
        <div className="max-h-80 overflow-y-auto rounded border bg-white p-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="text-sm">
              <span className="inline-block w-6 text-gray-400">#{i + 1}</span>
              <b className={m.from === "you" ? "text-blue-700" : "text-emerald-700"}>{m.from}:</b>{" "}
              <span>{m.text}</span>
              {m.ts && (
                <span className="text-xs text-gray-400 ml-2">
                  {m.ts.toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}
    </div>
  );
}
