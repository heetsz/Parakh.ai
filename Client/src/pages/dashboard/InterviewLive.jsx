import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, User, Bot } from "lucide-react";

export default function InterviewLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_BACKEND_URL;
  
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [messages, setMessages] = useState([]); // {from: 'you'|'bot', text, ts}
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [evaluation, setEvaluation] = useState(null);
  const [userTranscript, setUserTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const currentUserAudioChunks = useRef([]);
  const currentAiAudioBlob = useRef(null);

  // Helper function to upload audio to Cloudinary
  const uploadAudio = async (speaker, audioBlob) => {
    try {
      console.log(`🎵 Uploading ${speaker} audio, size: ${audioBlob.size} bytes`);
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('speaker', speaker);

      const response = await axios.post(
        `${base_url}/interviews/${id}/upload-audio`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      console.log(`✅ ${speaker} audio uploaded:`, response.data.audioUrl);
      return response.data.audioUrl;
    } catch (error) {
      console.error(`❌ Failed to upload ${speaker} audio:`, error.response?.data || error);
      return null;
    }
  };

  // Helper function to save conversation turn
  const saveConversationTurn = async (speaker, text, audioUrl) => {
    try {
      console.log(`💾 Saving conversation turn - Speaker: ${speaker}, Audio URL: ${audioUrl}`);
      
      const response = await axios.post(
        `${base_url}/interviews/${id}/conversation`,
        { speaker, text, audioUrl },
        { withCredentials: true }
      );
      
      console.log(`✅ Conversation turn saved:`, response.data);
    } catch (error) {
      console.error(`❌ Failed to save conversation turn:`, error.response?.data || error);
    }
  };

  // Fetch interview details
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
        console.error('Failed to fetch interview:', e?.response?.data || e);
      } finally {
        setLoadingInterview(false);
      }
    };
    fetchInterview();
  }, [id, base_url]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!interview) {
      console.log("⏳ Waiting for interview data before connecting WebSocket");
      return; // Wait for interview data to be loaded first
    }

    console.log("🚀 Setting up WebSocket with interview:", interview);
    const wsUrl = import.meta.env.VITE_AI_WS;
    const ws = new WebSocket(`${wsUrl}/ws/interview`);
    
    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      
      // Send interview context to AI when connection opens
      const contextData = {
        title: interview.title,
        role: interview.role,
        difficulty: interview.difficulty,
        notes: interview.notes
      };
      
      console.log("📤 Sending interview context to AI:", contextData);
      ws.send(JSON.stringify({
        type: "interview_context",
        data: contextData
      }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "assistant_text") {
            // User's transcribed speech
            const userText = data.transcript;
            setUserTranscript(userText);
            setMessages((prev) => [
              ...prev,
              { from: "you", text: userText, ts: new Date() }
            ]);
            
            // Upload user audio and save to database
            if (currentUserAudioChunks.current.length > 0) {
              console.log(`📼 User audio chunks: ${currentUserAudioChunks.current.length} chunks`);
              const userBlob = new Blob(currentUserAudioChunks.current, { type: "audio/webm" });
              const userAudioUrl = await uploadAudio('user', userBlob);
              await saveConversationTurn('user', userText, userAudioUrl);
              currentUserAudioChunks.current = []; // Clear after saving
            } else {
              console.log('⚠️ No user audio chunks to upload');
            }
            
            // AI's response text
            const aiText = data.text;
            setAiTranscript(aiText);
            setMessages((prev) => [
              ...prev,
              { from: "bot", text: aiText, ts: new Date() }
            ]);
            
            // We'll save AI audio when we receive the binary data
            // Store AI text temporarily for when audio arrives
            currentAiAudioBlob.current = { text: aiText };
          } else if (data.type === "assistant_audio") {
            // Next message will be audio
          } else if (data.type === "evaluation") {
            setEvaluation(data.result);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      } else {
        // Binary audio from AI
        console.log('🔊 Received AI audio binary data');
        const blob = new Blob([event.data], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const audioEl = audioPlayerRef.current;
        if (audioEl) {
          audioEl.src = url;
          audioEl.play().catch((err) => console.error("Audio play error:", err));
        }
        
        // Upload AI audio and save conversation turn
        if (currentAiAudioBlob.current?.text) {
          console.log('📼 Uploading AI audio and saving turn');
          const aiAudioUrl = await uploadAudio('ai', blob);
          await saveConversationTurn('ai', currentAiAudioBlob.current.text, aiAudioUrl);
          currentAiAudioBlob.current = null; // Clear after saving
        } else {
          console.log('⚠️ No AI text stored for audio');
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [interview]); // Re-run when interview data is loaded

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize user media
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      
      return stream;
    } catch (err) {
      console.error("Media access error:", err);
      alert("Please allow camera and microphone access to continue");
      return null;
    }
  };

  // Toggle mute/unmute
  const toggleMute = async () => {
    if (isMuted) {
      // Unmute - start recording
      let stream = streamRef.current;
      if (!stream) {
        stream = await initializeMedia();
        if (!stream) return;
      }
      
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
      }
      
      const audioOnly = new MediaStream([audioTrack]);
      const mimeType = "audio/webm";
      const mr = new MediaRecorder(audioOnly, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      currentUserAudioChunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          currentUserAudioChunks.current.push(e.data); // Store for upload
        }
      };

      mr.start(1000);
      setIsMuted(false);
      setUserTranscript("Listening...");
    } else {
      // Mute - stop recording and send audio
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
      if (audioTrack) {
        audioTrack.enabled = false;
      }
      
      setIsMuted(true);
      setUserTranscript("");
    }
  };

  // End call
  const endCall = async () => {
    // Send end_call message to get evaluation
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "end_call" }));
      
      // Wait a bit for evaluation to arrive
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Mark interview as complete in database
    try {
      await axios.post(
        `${base_url}/interviews/${id}/complete`,
        {},
        { withCredentials: true }
      );
      console.log('✅ Interview marked as complete');
    } catch (error) {
      console.error('Failed to complete interview:', error);
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Navigate to progress page to see results
    navigate("/dashboard/progress");
  };

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {loadingInterview ? "AI Interview" : (interview?.title || "AI Interview")}
        </h1>
        {interview && (
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{interview.role}</Badge>
            <Badge variant="secondary">{interview.difficulty}</Badge>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        )}
      </div>

      {/* Video Circles - Google Meet Style */}
      <div className="grid grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
        {/* User Circle */}
        <Card className="relative">
          <CardContent className="p-0">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                muted 
                playsInline 
              />
              
              {/* User label */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">You</span>
              </div>
              
              {/* Mic status indicator */}
              <div className={`absolute top-4 right-4 ${isMuted ? 'bg-red-500' : 'bg-green-500'} text-white p-3 rounded-full`}>
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </div>
            </div>
            
            {/* User's live transcript */}
            {lastUserMessage && (
              <div className="p-4 bg-blue-50 border-t">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-sm">{lastUserMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Circle */}
        <Card className="relative">
          <CardContent className="p-0">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-32 w-32 text-white" />
              
              {/* AI label */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">AI Interviewer</span>
              </div>
              
              {/* Speaking indicator */}
              {aiTranscript && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
            </div>
            
            {/* AI's live transcript */}
            {lastAiMessage && (
              <div className="p-4 bg-emerald-50 border-t">
                <p className="text-sm text-gray-600 mb-1">AI said:</p>
                <p className="text-sm">{lastAiMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <Button 
          size="lg"
          variant={isMuted ? "default" : "destructive"}
          onClick={toggleMute}
          className="rounded-full h-14 w-14 p-0"
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        
        <Button 
          size="lg"
          variant="destructive"
          onClick={endCall}
          className="rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
        >
          <Phone className="h-6 w-6 rotate-135" />
        </Button>
      </div>

      {/* Transcript Panel */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Conversation Transcript</h2>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Click the microphone to start speaking
              </p>
            ) : (
              messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    m.from === 'you' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {m.from === 'you' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs font-semibold">
                        {m.from === 'you' ? 'You' : 'AI Interviewer'}
                      </span>
                      <span className="text-xs opacity-70">
                        {m.ts.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Results */}
      {evaluation && (
        <Card className="max-w-4xl mx-auto mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Interview Performance Summary</h2>
            
            {evaluation.overall_score !== null && (
              <div className="mb-4">
                <span className="text-lg font-semibold">Overall Score: </span>
                <Badge variant="default" className="text-lg">
                  {String(evaluation.overall_score)}
                </Badge>
              </div>
            )}
            
            {evaluation.brief_summary && (
              <p className="text-gray-700 mb-4">{evaluation.brief_summary}</p>
            )}
            
            {evaluation.strengths?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-700 mb-2">Strengths:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {evaluation.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-700 mb-2">Areas for Improvement:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.areas_for_improvement.map((s, i) => (
                    <li key={i} className="text-sm">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={() => navigate("/dashboard/interviews")}
              className="w-full mt-6"
            >
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hidden audio player for AI voice */}
      <audio ref={audioPlayerRef} />
    </div>
  );
}
