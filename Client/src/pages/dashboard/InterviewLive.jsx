import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, User, Bot, Video, CameraOff } from "lucide-react";

/**
 * InterviewLive (UI-upgraded)
 * - Keeps all original logic (websocket, upload, save) intact.
 * - Adds UI-only features:
 *   - two equal circles (you / AI) with audio-wave animation when speaking
 *   - mic/camera controls under your circle
 *   - AI mic toggles when AI speaks (frontend-only)
 *   - non-persistent live transcription under each circle (cleared after new sentence)
 *   - timer top-right
 *   - no cloud URLs displayed in the UI
 *
 * NOTE: you can change AI image path (AI_IMAGE) and user-image fetch endpoint if needed.
 */

export default function InterviewLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_BACKEND_URL;

  // --- existing states kept intact ---
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [messages, setMessages] = useState([]); // persistent transcript list (kept)
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [evaluation, setEvaluation] = useState(null);
  const [userTranscript, setUserTranscript] = useState(""); // live, non-persistent
  const [aiTranscript, setAiTranscript] = useState(""); // live, non-persistent
  const currentUserAudioChunks = useRef([]);
  const currentAiAudioBlob = useRef(null);

  // --- UI-only states ---
  const [aiSpeaking, setAiSpeaking] = useState(false); // frontend-only indicator while AI audio plays or aiTranscript not empty
  const [cameraOn, setCameraOn] = useState(false); // camera toggle - default OFF
  const [userImageUrl, setUserImageUrl] = useState(null); // fetch from /me for avatar
    const [userName, setUserName] = useState("You"); // fetch from /me for display name
  const [aiName, setAiName] = useState("AI Interviewer"); // from /me -> aiModelName
  const [aiImageUrl, setAiImageUrl] = useState(null); // from /me -> aiModelImage
  const AI_IMAGE = "/web.png"; // place your AI avatar in public folder as ai.png
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // --- your existing functions unchanged (uploadAudio, saveConversationTurn) ---
  const uploadAudio = async (speaker, audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("speaker", speaker);

      const response = await axios.post(
        `${base_url}/interviews/${id}/upload-audio`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      return response.data.audioUrl;
    } catch (error) {
      console.error("Upload audio error:", error.response?.data || error);
      return null;
    }
  };

  const saveConversationTurn = async (speaker, text, audioUrl) => {
    try {
      await axios.post(
        `${base_url}/interviews/${id}/conversation`,
        { speaker, text, audioUrl },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Save conversation turn error:", error.response?.data || error);
    }
  };

  // --- fetch interview (unchanged) ---
  useEffect(() => {
    if (!id) {
      setLoadingInterview(false);
      return;
    }
    const fetchInterview = async () => {
      setLoadingInterview(true);
      try {
        const res = await axios.get(`${base_url}/interviews/${id}`, { withCredentials: true });
        setInterview(res.data);
      } catch (e) {
        console.error("Failed to fetch interview:", e?.response?.data || e);
      } finally {
        setLoadingInterview(false);
      }
    };
    fetchInterview();
  }, [id, base_url]);

  // --- Fetch user avatar from /me for UI (UI-only) ---
  useEffect(() => {
    let cancelled = false;
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, { withCredentials: true });
        if (!cancelled) {
          // try to use avatar or fallback to a generic endpoint
          // Expect server to return { avatarUrl } or { name } etc. If missing, skip.
            setUserImageUrl(res.data?.image || "/web.png");
            const n = res.data?.name || res.data?.fullName ||
                      (res.data?.firstName || res.data?.firstname ? `${res.data?.firstName || res.data?.firstname} ${res.data?.lastName || res.data?.lastname || ""}`.trim() : null) ||
                      res.data?.username || res.data?.email?.split("@")[0];
            if (n) setUserName(n);

            // AI interviewer model (name + image) from settings
            const modelName = res.data?.aiModelName;
            if (typeof modelName === "string" && modelName.trim()) {
              setAiName(modelName);
            } else {
              setAiName("AI Interviewer");
            }

            const modelImg = res.data?.aiModelImage;
            if (typeof modelImg === "string" && modelImg.trim()) {
              setAiImageUrl(modelImg);
            } else {
              setAiImageUrl(null); // fallback to default AI_IMAGE in render
            }
        }
      } catch (e) {
        // ignore errors; fallback to placeholder
          setUserImageUrl("/avatar-placeholder.png");
          setUserName("You");
          setAiName("AI Interviewer");
          setAiImageUrl(null);
      }
    };
    fetchMe();
    return () => { cancelled = true; };
  }, [base_url]);

  // --- Setup websocket (keeps your logic; we only add aiSpeaking toggles) ---
  useEffect(() => {
    if (!interview) return;
    const wsUrl = import.meta.env.VITE_AI_WS;
    const ws = new WebSocket(`${wsUrl}/ws/interview`);

    ws.onopen = () => {
      setSocket(ws);
      setIsConnected(true);
      const contextData = {
        title: interview.title,
        role: interview.role,
        difficulty: interview.difficulty,
        notes: interview.notes,
        aiVoice: (typeof aiName === 'string' && aiName.trim()) ? aiName : undefined,
      };
      ws.send(JSON.stringify({ type: "interview_context", data: contextData }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "assistant_text") {
            const userText = data.transcript || "";
            setUserTranscript(userText); // live, non-persistent under your circle
            setMessages((prev) => [...prev, { from: "you", text: userText, ts: new Date() }]);

            if (currentUserAudioChunks.current.length > 0) {
              const userBlob = new Blob(currentUserAudioChunks.current, { type: "audio/webm" });
              const userAudioUrl = await uploadAudio("user", userBlob);
              await saveConversationTurn("user", userText, userAudioUrl);
              currentUserAudioChunks.current = [];
            }

            const aiText = data.text || "";
            setAiTranscript(aiText); // live under AI circle

            // store ai text until binary arrives
            currentAiAudioBlob.current = { text: aiText };
            setAiSpeaking(true); // AI will speak soon (frontend-only: show waves)
          } else if (data.type === "evaluation") {
            setEvaluation(data.result);
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      } else {
        // Binary audio from AI (Blob)
        const blob = new Blob([event.data], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const audioEl = audioPlayerRef.current;
        if (audioEl) {
          audioEl.src = url;
          try {
            await audioEl.play();
          } catch (err) {
            console.error("Audio play error:", err);
          }
        }

        // upload AI audio and save conversation
        if (currentAiAudioBlob.current?.text) {
          const aiAudioUrl = await uploadAudio("ai", blob);
          await saveConversationTurn("ai", currentAiAudioBlob.current.text, aiAudioUrl);
          currentAiAudioBlob.current = null;
        }

        // When AI audio finishes playing, we clear transient transcript and waves in audio 'ended' event below.
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview]);

  // --- audio player events to toggle aiSpeaking and clear transient transcript on end ---
  useEffect(() => {
    const audioEl = audioPlayerRef.current;
    if (!audioEl) return;

    const handlePlay = () => {
      setAiSpeaking(true);
    };
    const handleEnded = () => {
      setAiSpeaking(false);
      setAiTranscript(""); // clear non-persistent transcript after finish
    };
    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("ended", handleEnded);
    audioEl.addEventListener("pause", () => {
      // If paused manually (not ended), stop waves but keep transcript
      setAiSpeaking(false);
    });

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, []);

  // --- Auto scroll persistent transcript (kept) ---
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- media initialization (unchanged logic) ---
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // Disable video by default
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => { });
      }
      
      return stream;
    } catch (err) {
      console.error("Media access error:", err);
      alert("Please allow camera and microphone access to continue");
      return null;
    }
  };

  // --- toggle mute (your logic) but also local waves and transcriptions behavior ---
  const toggleMute = async () => {
    if (isMuted) {
      // Unmute / start recording
      let stream = streamRef.current;
      if (!stream) {
        stream = await initializeMedia();
        if (!stream) return;
      }
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = true;

      const audioOnly = new MediaStream([audioTrack]);
      const mimeType = "audio/webm";
      const mr = new MediaRecorder(audioOnly, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      currentUserAudioChunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          currentUserAudioChunks.current.push(e.data);
        }
      };

      mr.start(1000);
      setIsMuted(false);
      setUserTranscript("Listening...");
    } else {
      // Mute / stop recording and send audio
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.onstop = async () => {
          try {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const buf = await blob.arrayBuffer();
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(buf);
              socket.send(JSON.stringify({ type: "segment_end" }));
            }
          } catch (e) {
            console.error("Send audio error:", e);
          } finally {
            chunksRef.current = [];
          }
        };
        mr.stop();
      }
      const audioTrack = streamRef.current?.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = false;
      setIsMuted(true);
      setUserTranscript("");
    }
  };

  // --- camera toggle (UI + media track enable/disable) ---
  const toggleCamera = async () => {
    // If no stream yet, initialize
    let stream = streamRef.current;
    if (!stream) {
      stream = await initializeMedia();
      if (!stream) return;
    }
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      // no track available (permissions?), try re-initialize
      const s = await initializeMedia();
      if (!s) return;
      const vt = s.getVideoTracks()[0];
      if (vt) {
        vt.enabled = !cameraOn;
        setCameraOn(vt.enabled);
        // Ensure video element has the stream
        if (videoRef.current && !videoRef.current.srcObject) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      }
      return;
    }
    
    // toggle the track
    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(videoTrack.enabled);
    
    // Ensure video element has the stream and is playing
    if (videoTrack.enabled && videoRef.current) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = stream;
      }
      await videoRef.current.play().catch(() => {});
    }
  };

  // --- end call (keeps existing logic) ---
  const endCall = async () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "end_call" }));
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    try {
      await axios.post(`${base_url}/interviews/${id}/complete`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Failed to complete interview:", error);
    }

    // stop media
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    navigate("/dashboard/progress");
  };

  // --- timer start/stop (UI-only) ---
  useEffect(() => {
    // start timer when interview loaded
    if (!interview) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [interview]);

  // --- Keyboard shortcut for Ctrl+K to toggle mute ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+K (or Cmd+K on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); // Prevent default browser behavior
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]); // Include toggleMute in dependencies

  // --- Ensure video element binds stream when camera turns on ---
  useEffect(() => {
    const ensureVideo = async () => {
      if (cameraOn) {
        // Make sure we have a stream
        if (!streamRef.current) {
          const s = await initializeMedia();
          if (!s) return;
        }
        const stream = streamRef.current;
        // enable video track
        const vt = stream.getVideoTracks?.()[0];
        if (vt) vt.enabled = true;
        // attach to video element
        if (videoRef.current) {
          if (videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
          }
          try { await videoRef.current.play(); } catch {}
        }
      } else {
        // camera off -> disable video track and pause element
        const vt = streamRef.current?.getVideoTracks?.()[0];
        if (vt) vt.enabled = false;
        if (videoRef.current) {
          try { await videoRef.current.pause(); } catch {}
        }
      }
    };
    ensureVideo();
  }, [cameraOn]);

  const formatTimer = (secs) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // --- helper to clear non-persistent transcripts after a short delay ---
  useEffect(() => {
    if (userTranscript) {
      const t = setTimeout(() => setUserTranscript(""), 7000); // clear after 7s
      return () => clearTimeout(t);
    }
  }, [userTranscript]);

  useEffect(() => {
    if (aiTranscript) {
      const t = setTimeout(() => {
        // we don't clear aiTranscript here if audio still playing; audio 'ended' handler clears it.
        if (!aiSpeaking) setAiTranscript("");
      }, 9000);
      return () => clearTimeout(t);
    }
  }, [aiTranscript, aiSpeaking]);

  // --- memoized last messages (unchanged) ---
  const lastAiMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "bot") return messages[i].text;
    }
    return "";
  }, [messages]);

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "you") return messages[i].text;
    }
    return "";
  }, [messages]);

  // --- UI rendering (new professional layout) ---
  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-start p-6 gap-6">
      {/* Top-right timer + status */}
      <div className="w-full flex justify-end items-center">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-md shadow-sm border border-gray-200">
            {interview?.role ?? "Interview"}
          </div>
          <div className="text-sm text-gray-700 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 font-mono">
            {formatTimer(timerSeconds)}
          </div>
          <div className={`text-sm px-4 py-2 rounded-lg backdrop-blur-md shadow-sm border ${socket && socket.readyState === WebSocket.OPEN ? 'bg-green-50/80 text-green-700 border-green-200' : 'bg-red-50/80 text-red-700 border-red-200'}`}>
            {socket && socket.readyState === WebSocket.OPEN ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Two Circle Area */}
      <div className="w-full max-w-5xl flex items-start justify-center gap-16 relative">
        {/* YOUR CIRCLE */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {/* circle container */}
            <div className="w-72 h-72 rounded-full bg-linear-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center overflow-hidden border-4 border-gray-200 shadow-2xl">
              {/* video or user image */}
              {cameraOn ? (
                <video ref={videoRef} className="w-full h-full object-cover object-center" muted playsInline autoPlay />
              ) : (
                <img
                  src={userImageUrl || "/avatar-placeholder.png"}
                  alt={userName || "You"}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>

            {/* speaking waves for user */}
            <div
              aria-hidden
              className={`absolute inset-0 flex items-center justify-center pointer-events-none`}
            >
              <div className={`relative w-full h-full flex items-center justify-center`}>
                {/* waves appear only when recording/you speaking */}
                <div className={`absolute rounded-full ${!isMuted ? 'opacity-100 animate-waves' : 'opacity-0'} w-[110%] h-[110%] border-2 border-[#DFFF00]`} />
                <div className={`absolute rounded-full ${!isMuted ? 'opacity-80 animate-waves delay-200' : 'opacity-0'} w-[125%] h-[125%] border-2 border-[#DFFF00]/60`} />
                <div className={`absolute rounded-full ${!isMuted ? 'opacity-60 animate-waves delay-500' : 'opacity-0'} w-[140%] h-[140%] border border-[#DFFF00]/40`} />
              </div>
            </div>

              {/* bottom label - user name from /me */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-linear-to-r from-gray-900 to-gray-800 px-4 py-2 rounded-full flex items-center gap-2 border border-gray-700 shadow-lg max-w-64">
              <User className="h-4 w-4 text-white shrink-0" />
              <span className="text-sm font-semibold text-white truncate" title={userName}>{userName}</span>
            </div>
          </div>

          {/* controls under your circle */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={toggleMute}
              className="rounded-full w-16 h-16 flex items-center justify-center bg-white shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-[#DFFF00] transition-all duration-300"
              title={isMuted ? "Unmute / Start speaking (Ctrl+K)" : "Mute / Stop speaking (Ctrl+K)"}
            >
              {isMuted ? <MicOff className="h-7 w-7 text-gray-600" /> : <Mic className="h-7 w-7 text-[#DFFF00]" />}
            </button>

            <button
              onClick={toggleCamera}
              className="rounded-full w-16 h-16 flex items-center justify-center bg-white shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-[#DFFF00] transition-all duration-300"
              title={cameraOn ? "Turn camera off" : "Turn camera on"}
            >
              {cameraOn ? <Video className="h-7 w-7 text-gray-600" /> : <CameraOff className="h-7 w-7 text-gray-600" />}
            </button>

            <button
              onClick={endCall}
              className="rounded-full w-16 h-16 flex items-center justify-center bg-linear-to-br from-red-500 to-red-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              title="End call"
            >
              <Phone className="h-7 w-7 text-white rotate-135" />
            </button>
          </div>

          {/* transient user transcript - floating with linear blur - positioned below buttons */}
          {userTranscript && userTranscript !== "Listening..." && (
            <div className="w-80 backdrop-blur-xl bg-linear-to-br from-[#DFFF00]/20 via-[#DFFF00]/10 to-transparent rounded-2xl p-4 border border-[#DFFF00]/30 shadow-2xl animate-float mt-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-700 mt-1 shrink-0" />
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{userTranscript}</p>
              </div>
            </div>
          )}
        </div>

        {/* AI CIRCLE */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-72 h-72 rounded-full bg-linear-to-br from-gray-200 via-gray-100 to-white flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-2xl">
              {/* AI avatar image (from selected model or fallback) - fill full circle */}
              <img src={aiImageUrl || AI_IMAGE} alt={aiName || "AI Interviewer"} className="w-full h-full object-cover object-center" />

              {/* AI waves when aiSpeaking is true */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`absolute rounded-full ${aiSpeaking ? 'opacity-100 animate-waves-ai' : 'opacity-0'} w-[110%] h-[110%] border-2 border-blue-500`} />
                <div className={`absolute rounded-full ${aiSpeaking ? 'opacity-90 animate-waves-ai delay-200' : 'opacity-0'} w-[125%] h-[125%] border-2 border-blue-400/60`} />
                <div className={`absolute rounded-full ${aiSpeaking ? 'opacity-70 animate-waves-ai delay-500' : 'opacity-0'} w-[140%] h-[140%] border border-blue-300/40`} />
              </div>

            </div>

            {/* AI label with speaking indicator or model name */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              {aiSpeaking ? (
                <>
                  <Bot className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">Speaking...</span>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white" title={aiName}>{aiName}</span>
                </>
              )}
            </div>
          </div>

          {/* transient ai transcript - floating with linear blur - positioned below the circle */}
          {aiTranscript && (
            <div className="w-80 backdrop-blur-xl bg-linear-to-br from-blue-500/20 via-blue-400/10 to-transparent rounded-2xl p-4 border border-blue-400/30 shadow-2xl animate-float mt-4">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-gray-700 mt-1 shrink-0" />
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{aiTranscript}</p>
              </div>
            </div>
          )}

          {/* removed AI mic indicator */}
        </div>
      </div>

      {/* compact persistent transcript below (kept small so page fits) */}
      <div className="w-full max-w-5xl">
        {/* REMOVED - persistent transcript not needed */}
      </div>

      {/* evaluation block (if available) */}
      {/* {evaluation && (
        <div className="w-full max-w-5xl">
          <Card className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Overall Score</div>
                  <div className="text-3xl font-bold text-gray-900">{String(evaluation.overall_score ?? "—")}</div>
                </div>
                <div className="text-sm text-gray-700 max-w-2xl">{evaluation.brief_summary}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )} */}

      {/* hidden audio player for AI (kept) */}
      <audio ref={audioPlayerRef} style={{ display: "none" }} />
    </div>
  );
}

/* Tailwind helper animations required (add to your global CSS or tailwind config):
You need these utility classes (I include raw CSS to drop into your globals):

.animate-waves {
  animation: pulse-waves 1.6s ease-out infinite;
}
@keyframes pulse-waves {
  0% { transform: scale(0.9); opacity: 0.45; }
  50% { transform: scale(1.05); opacity: 0.08; }
  100% { transform: scale(0.9); opacity: 0.0; }
}

.animate-waves-ai {
  animation: pulse-waves-ai 1.4s ease-out infinite;
}
@keyframes pulse-waves-ai {
  0% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.12; }
  100% { transform: scale(0.9); opacity: 0; }
}

.animate-float {
  animation: float-up 0.6s ease-out forwards, float-gentle 3s ease-in-out infinite 0.6s;
}
@keyframes float-up {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
@keyframes float-gentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

You can paste the above CSS into your global stylesheet (e.g., src/index.css).
*/
