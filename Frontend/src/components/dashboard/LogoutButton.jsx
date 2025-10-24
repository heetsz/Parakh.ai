import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
      const [loading, setLoading] = useState(false);
      const base_url = import.meta.env.VITE_BACKEND_URL;

      const handleLogout = async () => {
            setLoading(true);
            try {
                  await axios.post(`${base_url}/logout`, {}, { withCredentials: true });
            } catch (err) {
                  console.error("Logout failed:", err.response || err.message);
            } finally {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload(); 
                  setLoading(false);
            }
      };

      return (
            <Button onClick={handleLogout} disabled={loading}>
                  {loading ? "Logging out..." : "Logout"}
            </Button>
      );
}
