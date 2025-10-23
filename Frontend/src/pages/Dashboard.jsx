import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const base_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, {
          withCredentials: true, 
        });
        setEmail(res.data.email);
      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {email ? (
        <p className="mb-6">User Email: {email}</p>
      ) : (
        <p className="mb-6">Loading user info...</p>
      )}

      {/* Logout Button */}
      <LogoutButton />
    </div>
  );
}
