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

  const [form, setForm] = useState({
    role: "",
    difficulty: "",
    notes: "",
  });

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/interviews`, { withCredentials: true });
      setInterviews(res.data || []);
      setError(null);
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
    // Example: images stored in /public/interview_types/
    const lower = role.toLowerCase();
    return `/interview_types/${lower || "default"}.png`;
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
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-5 w-5 mr-2" /> 
          Create Interview
        </Button>
      </div>

      {loading && <p className="text-center text-muted-foreground">Loading interviews...</p>}
      {error && <p className="text-center text-destructive">{error}</p>}

      {!loading && !error && interviews.length === 0 && (
        <p className="text-center text-muted-foreground">No interviews found.</p>
      )}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {interviews.map((interview) => (
          <Card key={interview._id}>
            <img
              src={getImageByType(interview.role)}
              alt={interview.role}
              className="w-full h-40 object-cover rounded-t-xl"
            />
            <CardHeader>
              <CardTitle>{interview.title || "Untitled Interview"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-semibold">Role:</span> {interview.role}</p>
              <p><span className="font-semibold">Difficulty:</span> {interview.difficulty}</p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Created:</span>{" "}
                {new Date(interview.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}{" "}
                at {new Date(interview.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <Badge variant={interview.status === "completed" ? "default" : "secondary"}>
                {interview.status.replace("_", " ")}
              </Badge>
              
              <div className="flex gap-2 mt-4">
                {interview.status === "completed" && interview.conversation?.length > 0 ? (
                  <Button 
                    onClick={() => handleViewRecording(interview)}
                    className="flex-1"
                    variant="default"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    View Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleJoinInterview(interview._id)}
                    className="flex-1"
                    variant="default"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                )}
                
                <Button 
                  onClick={() => handleDeleteInterview(interview._id, interview.title)}
                  variant="outline"
                  size="icon"
                  className="border-red-300 hover:bg-red-50"
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Interview</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new mock interview session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInterview} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role"
                name="role" 
                value={form.role} 
                onChange={handleChange}
                placeholder="e.g., Frontend Developer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Input 
                id="difficulty"
                name="difficulty" 
                value={form.difficulty} 
                onChange={handleChange}
                placeholder="e.g., Easy, Medium, Hard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                name="notes"
                value={form.notes}
                placeholder="Any specific notes for AI?"
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creating Interview..." : "Create Interview"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Replay Dialog */}
      <Dialog open={replayOpen} onOpenChange={setReplayOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedInterview?.title || "Interview Recording"}</DialogTitle>
            <DialogDescription>
              Review the conversation from your interview session
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {selectedInterview?.conversation && selectedInterview.conversation.length > 0 ? (
              <div className="space-y-4">
                {selectedInterview.conversation.map((turn, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col p-3 rounded-lg ${
                      turn.speaker === 'user' 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'bg-green-50 border-l-4 border-green-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={turn.speaker === 'user' ? 'default' : 'secondary'}>
                        {turn.speaker === 'user' ? 'You' : 'AI Interviewer'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(turn.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{turn.text}</p>
                    
                    {turn.audioUrl ? (
                      <div className="space-y-1">
                        <audio 
                          controls 
                          className="w-full h-10"
                          onPlay={() => setPlayingAudio(idx)}
                          onPause={() => setPlayingAudio(null)}
                          preload="metadata"
                        >
                          <source src={turn.audioUrl} type="audio/webm" />
                          <source src={turn.audioUrl} type="audio/wav" />
                          <source src={turn.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <p className="text-xs text-gray-400 truncate">Audio: {turn.audioUrl}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No audio recording available</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No conversation recorded for this interview
              </div>
            )}
          </ScrollArea>

          {selectedInterview?.result?.evaluation && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Evaluation</h4>
              <p className="text-sm text-gray-700">{selectedInterview.result.evaluation}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setReplayOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interviews;
