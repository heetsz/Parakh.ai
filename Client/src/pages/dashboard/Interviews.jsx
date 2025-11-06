import { useEffect, useRef, useState, useMemo } from "react";

export default function InterviewAgent() {
  const [messages, setMessages] = useState([]); // {from: 'you'|'bot', text, ts}
  const [socket, setSocket] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const base_url = import.meta.env.VITE_AI_WS;
    const ws = new WebSocket(`${base_url}/ws/interview`);
    setSocket(ws);

    ws.onmessage = async (event) => {
      // Server sends JSON control messages and raw binary audio messages
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "assistant_text") {
            setMessages((prev) => [
              ...prev,
              { from: "you", text: data.transcript, ts: new Date() },
              { from: "bot", text: data.text, ts: new Date() },
            ]);
          } else if (data.type === "assistant_audio") {
            // Next message expected to be binary audio; nothing to do here
          } else if (data.type === "evaluation") {
            setEvaluation(data.result);
          }
        } catch {
          // Raw text fallback
          setMessages((prev) => [...prev, { from: "bot", text: event.data, ts: new Date() }]);
        }
      } else {
        // Binary audio: play it (server sends wav by default now)
        const blob = new Blob([event.data], { type: "audio/wav" });
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
      // Capture video (for local preview) and audio
      const avStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Show local video, but don't store or send it
      const video = videoRef.current;
      if (video && !video.srcObject) {
        video.srcObject = avStream;
        await video.play().catch(() => {});
      }

      // Build an audio-only stream for recording
      const audioOnly = new MediaStream(avStream.getAudioTracks());
      const mimeType = "audio/webm";
      const mr = new MediaRecorder(audioOnly, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          // Collect chunks locally; we'll send a single finalized Blob on stop
          chunksRef.current.push(e.data);
        }
      };

      mr.start(1000); // collect chunks; finalized on stop
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

  const lastBot = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "bot") return messages[i].text;
    }
    return "";
  }, [messages]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">AI Interviewer</h2>

      {/* Meet-style circles */}
      <div className="flex items-start gap-6">
        {/* Candidate circle with live video */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-300">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {/* Mic status ring */}
          <div className={`absolute inset-0 rounded-full ${recording ? "ring-4 ring-red-500 animate-pulse" : "ring-2 ring-transparent"}`}></div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
            {recording ? "Mic On" : "Mic Off"}
          </div>
        </div>

        {/* Interviewer circle with live transcript below */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-40 h-40 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
            AI
          </div>
          <div className="w-72 text-sm rounded border bg-white p-3 min-h-[3rem]">
            {lastBot ? <span>{lastBot}</span> : <span className="text-gray-400">Interviewer will respond here…</span>}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
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

        <button
          className="px-3 py-2 rounded bg-gray-100 border"
          onClick={() => setShowTranscript((s) => !s)}
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>

        <button
          className="px-3 py-2 rounded bg-gray-100 border"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          Clear Transcript
        </button>

        <button
          className="ml-auto px-3 py-2 rounded bg-black text-white"
          onClick={() => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ type: "end_call" }))}
        >
          End Call
        </button>

        <audio ref={audioPlayerRef} />
      </div>

      {/* Transcript panel */}
      {showTranscript && (
        <div className="max-h-80 overflow-y-auto rounded border bg-white p-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="text-sm">
              <span className="inline-block w-6 text-gray-400">#{i + 1}</span>
              <b className={m.from === "you" ? "text-blue-700" : "text-emerald-700"}>{m.from}:</b>{" "}
              <span>{m.text}</span>
              {m.ts && (
                <span className="text-xs text-gray-400 ml-2">{m.ts.toLocaleTimeString()}</span>
              )}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {/* Evaluation */}
      {evaluation && (
        <div className="rounded border bg-white p-4 space-y-2">
          <h3 className="font-semibold">Performance Summary</h3>
          {evaluation.overall_score !== null && (
            <div className="text-sm">Overall Score: <b>{String(evaluation.overall_score)}</b></div>
          )}
          {evaluation.brief_summary && (
            <div className="text-sm">{evaluation.brief_summary}</div>
          )}
          {evaluation.strengths?.length ? (
            <div className="text-sm">
              <b>Strengths:</b>
              <ul className="list-disc ml-5">
                {evaluation.strengths.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          ) : null}
          {evaluation.areas_for_improvement?.length ? (
            <div className="text-sm">
              <b>Areas for Improvement:</b>
              <ul className="list-disc ml-5">
                {evaluation.areas_for_improvement.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
