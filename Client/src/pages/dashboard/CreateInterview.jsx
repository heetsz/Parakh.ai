import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateInterview() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [resume, setResume] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
  const payload = { title, role, experience, type, difficulty, resume, notes };
      const res = await axios.post(`${base_url}/interviews`, payload, { withCredentials: true });
      const created = res.data;
      // Navigate to live interview page
      if (created && created._id) {
        navigate(`/dashboard/interviews/live/${created._id}`);
      } else {
        // fallback: go back to list
        navigate(`/dashboard/interviews`);
      }
    } catch (err) {
      console.error("Create interview failed:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">Create Interview</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 block w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Frontend Engineer - Screening"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Role</label>
            <input
              className="mt-1 block w-full border rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Frontend Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Experience</label>
            <input
              className="mt-1 block w-full border rounded px-3 py-2"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 3-5 years"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="mt-1 block w-full border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select</option>
              <option value="screening">Screening</option>
              <option value="onsite">Onsite</option>
              <option value="takehome">Take-home</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Difficulty</label>
            <select className="mt-1 block w-full border rounded px-3 py-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Select</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Resume URL</label>
            <input className="mt-1 block w-full border rounded px-3 py-2" value={resume} onChange={(e) => setResume(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea
            className="mt-1 block w-full border rounded px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything to remind you about this interview"
            rows={4}
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create and Start"}
          </button>
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
