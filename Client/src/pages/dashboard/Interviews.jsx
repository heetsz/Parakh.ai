import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Button
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trash2, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Interviews = () => {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [imageMap, setImageMap] = useState({}); // interviewId -> image filename

  const [form, setForm] = useState({
    role: "",
    difficulty: "",
    notes: "",
  });
  const ASSET_BASE = import.meta.env.BASE_URL || "/";

  const AVAILABLE_IMAGES = [
    "aptitude.png",
    "communication.png",
    "frontend.png",
    "logo.png",
    "mongodb.png",
    "mysql.png",
    "nodejs.png",
    "python.png",
    "reactjs.png",
  ];


  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/interviews`, { withCredentials: true });
      const list = res.data || [];
      setInterviews(list);
      setError(null);
      // Precompute images for cards
      // computeImages(list);
    } catch (err) {
      console.error("Failed to fetch interviews:", err?.response?.data || err);
      setError("Failed to load interviews. Please login.");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Create interview - backend will call FastAPI to generate questions
      const response = await axios.post(`${base_url}/interviews`, form, { withCredentials: true });
      const newInterview = response.data;
      
      setOpen(false);
      setForm({
        role: "",
        difficulty: "",
        notes: "",
      });
      
      // Route to the newly created interview's live page
      navigate(`/dashboard/interviews/live/${newInterview._id}`);
    } catch (err) {
      console.error("Error creating interview:", err);
    } finally {
      setCreating(false);
    }
  };

  const getImageByType = (role) => {
    if (!role) return "logo.png";

    // take the first word, lowercase it
    const firstWord = role.trim().split(" ")[0].toLowerCase();

    // example: "Frontend Developer" → "frontend.png"
    // console.log(`${ firstWord }.png`)
    return `/${firstWord}.png`;
  };

  // Build a map from interview id to chosen image filename
  const computeImages = async (list) => {
    try {
      const entries = await Promise.all(
        (list || []).map(async (iv) => {
          const filename = await getImageByType(iv.role);
          return [iv._id, filename];
        })
      );
      const map = Object.fromEntries(entries);
      setImageMap(map);
    } catch (e) {
      console.warn("Failed to compute images, using defaults", e);
      const fallback = Object.fromEntries((list || []).map((iv) => [iv._id, "logo.png"]));
      setImageMap(fallback);
    }
  };

  const handleJoinInterview = (interviewId) => {
    navigate(`/dashboard/interviews/live/${interviewId}`);
  };

  const handleViewRecording = (interview) => {
    console.log('Selected interview:', interview);
    console.log('Conversation data:', interview.conversation);
    setSelectedInterview(interview);
    setReplayOpen(true);
  };

  const handleDeleteInterview = async (interviewId, interviewTitle) => {
    // if (!confirm(`Are you sure you want to delete "${interviewTitle}"?`)) {
    //   return;
    // }

    try {
      await axios.delete(`${base_url}/interviews/${interviewId}`, { withCredentials: true });
      // Refresh the interviews list
      fetchInterviews();
    } catch (err) {
      console.error("Error deleting interview:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-3xl font-semibold">My Interviews</h1> */}
        {interviews.length > 0 && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5 mr-2" /> 
            Create Interview
          </Button>
        )}
      </div>

      {loading && <p className="text-center text-muted-foreground">Loading interviews...</p>}
      {error && <p className="text-center text-destructive">{error}</p>}

      {!loading && !error && interviews.length === 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Parakh.ai" className="h-16 w-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Kickstart your prep with Parakh.ai</h2>
            <p className="mt-2 text-sm text-gray-600">
              Parakh.ai is your all‑in‑one AI interview copilot. Practice live mock interviews with voice, get instant feedback,
              track your progress, and fine‑tune your skills for the real thing.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-800">Live AI Interviews</p>
                <p className="mt-1 text-xs text-gray-500">Real‑time voice, transcripts, and smart follow‑ups.</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-800">Personalized Interviewers</p>
                <p className="mt-1 text-xs text-gray-500">Choose your AI model’s name and avatar.</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-800">Insights & Progress</p>
                <p className="mt-1 text-xs text-gray-500">Keep improving with focused evaluations.</p>
              </div>
            </div>

            <div className="mt-7">
              <Button
                onClick={() => setOpen(true)}
                className="bg-[#DFFF00] text-black font-semibold hover:bg-[#c7e600] transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first interview
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {interviews.map((interview) => (
          <Card
            key={interview._id}
            className="bg-gray-50 text-black rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            {/* CLEAN IMAGE — NO BG, NO GRAY BOX */}
            <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded-t-xl">
              <img
                src={getImageByType(interview.role)}
                alt={interview.role}
                className="object-contain h-32 w-auto"
                onError={(e) => (e.currentTarget.src = "/logo.png")}
              />
            </div>

            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {interview.title || interview.role || "Untitled Interview"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-800">Role:</span>{" "}
                  {interview.role}
                </p>

                <p className="text-sm">
                  <span className="font-medium text-gray-800">Difficulty:</span>{" "}
                  {interview.difficulty}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(interview.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" • "}
                  {new Date(interview.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <Badge
                variant={interview.status === "completed" ? "default" : "secondary"}
                className="mt-2"
              >
                {interview.status.replace("_", " ")}
              </Badge>

              <div className="flex gap-2 mt-4">
                {interview.status === "completed" &&
                  interview.conversation?.length > 0 ? (
                  <Button 
                    onClick={() => handleViewRecording(interview)}
                    className="flex-1 cursor-pointer"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    View Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleJoinInterview(interview._id)}
                    className="flex-1 cursor-pointer"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                )}

                <Button
                  onClick={() => handleDeleteInterview(interview._id)}
                  variant="outline"
                  size="icon"
                  className="border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Form (Modal) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
      sm:max-w-[500px]
      bg-black/70 
      backdrop-blur-xl 
      border border-white/10 
      text-white 
      shadow-2xl 
      rounded-xl
    "
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">
              Create New Interview
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to start a new interview session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInterview} className="space-y-5 mt-4">

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">Role</Label>
              <Input
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                // placeholder="e.g., Frontend Developer"
                className="bg-black/70 text-white border border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40 placeholder:text-gray-500 transition-colors"
                required
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) => setForm({ ...form, difficulty: value })}
                required
              >
                <SelectTrigger className="bg-black/70 text-white border border-white/20 focus:ring-0 focus:ring-offset-0 focus:border-white/40 transition-colors">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 text-white border border-white/20">
                  <SelectItem value="Easy" className="focus:bg-white/10 focus:text-white cursor-pointer">Easy</SelectItem>
                  <SelectItem value="Medium" className="focus:bg-white/10 focus:text-white cursor-pointer">Medium</SelectItem>
                  <SelectItem value="Hard" className="focus:bg-white/10 focus:text-white cursor-pointer">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes (optional)</Label>
              <Input
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                // placeholder="Any specific notes for AI?"
                className="bg-black/70 text-white border border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40 placeholder:text-gray-500 transition-colors"
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={creating}
                className="w-full bg-[#DFFF00] text-black font-semibold hover:bg-[#c7e600] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(223,255,0,0.5)] active:scale-95"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Interview"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Replay Dialog */}
      {/* Replay Dialog */}
      <Dialog open={replayOpen} onOpenChange={setReplayOpen}>
        <DialogContent
          className="
      sm:max-w-[700px] max-h-[85vh]
      bg-black/70 backdrop-blur-xl
      border border-white/10 
      text-white 
      shadow-2xl rounded-xl
      overflow-hidden
    "
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">
              {selectedInterview?.title || "Interview Recording"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review your interview conversation and audio responses.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <ScrollArea className="h-[55vh] w-full rounded-lg p-4 border border-white/10 bg-black/30">
            {selectedInterview?.conversation && selectedInterview.conversation.length > 0 ? (
              <div className="space-y-5">

                {selectedInterview.conversation.map((turn, idx) => {
                  const isUser = turn.speaker === "user";

                  return (
                    <div
                      key={idx}
                      className={`
                  p-4 rounded-xl 
                  border border-white/10 
                  backdrop-blur-sm 
                  ${isUser ? "bg-white/10" : "bg-white/5"}
                `}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2">
                        <Badge
                          className={`
                      ${isUser ? "bg-[#DFFF00] text-black" : "bg-white/20 text-white"}
                    `}
                        >
                          {isUser ? "You" : "AI Interviewer"}
                        </Badge>

                        <span className="text-xs text-gray-400">
                          {new Date(turn.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Text */}
                      <p className="text-sm leading-relaxed text-white">
                        {turn.text}
                      </p>

                      {/* Audio Player */}
                      {/* Audio Player */}
                      {turn.audioUrl ? (
                        <div className="mt-3">
                          <audio
                            controls
                            className="
        w-full 
        h-10 
        rounded 
        bg-black/30 
        border border-white/10
      "
                            onPlay={() => setPlayingAudio(idx)}
                            onPause={() => setPlayingAudio(null)}
                            preload="metadata"
                          >
                            <source src={turn.audioUrl} type="audio/webm" />
                            <source src={turn.audioUrl} type="audio/mp3" />
                            <source src={turn.audioUrl} type="audio/mpeg" />
                            <source src={turn.audioUrl} type="audio/wav" />
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic mt-2">No audio recorded</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No conversation recorded for this interview.
              </div>
            )}
          </ScrollArea>

          {/* Evaluation */}
          {/* {selectedInterview?.result?.evaluation && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl text-white">
              <h4 className="font-semibold text-lg mb-2">Evaluation Summary</h4>
              <p className="text-sm leading-relaxed text-gray-300">
                {selectedInterview.result.evaluation}
              </p>
            </div>
          )} */}

          <DialogFooter className="mt-4">
            <Button
              onClick={() => setReplayOpen(false)}
              className="bg-[#DFFF00] text-black font-semibold hover:bg-[#c7e600] transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interviews;
