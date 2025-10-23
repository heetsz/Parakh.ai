import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const base_url = import.meta.env.VITE_BACKEND_URL;

      const handleLogout = async () => {
            setLoading(true);
            try {
                  const token = localStorage.getItem('token');
                  const config = token
                        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
                        : { withCredentials: true };

                  await axios.post(`${base_url}/logout`, {}, config);

                  // Clear storage
                  localStorage.clear();
                  sessionStorage.clear();

                  // Redirect
                  window.location.reload();
            } catch (err) {
                  console.error("Logout request failed:", err.response || err.message);

                  // Still clear storage and redirect
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
            } finally {
                  setLoading(false);
            }
      };

      return (
            <Button
                  onClick={handleLogout}
                  disabled={loading}
            >
                  {loading ? "Logging out..." : "Logout"}
            </Button>
      );
}