import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Interviews() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Your Interviews</h2>
        <button
          className="px-3 py-2 rounded bg-black text-white"
          onClick={() => navigate("create")}
        >
          Create Interview
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {interviews.length === 0 && <div>No interviews found. Create one to get started.</div>}
          {interviews.map((iv) => (
            <div key={iv._id} className="p-4 border rounded shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{iv.title || "Untitled Interview"}</h3>
                  <p className="text-sm text-gray-600">{new Date(iv.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                    onClick={() => navigate(`live/${iv._id}`)}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
