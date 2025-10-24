import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/dashboard/Navbar";
import Sidebar from "../components/dashboard/Sidebar";

export default function Dashboard() {
  const email = localStorage.getItem("email"); 

  return (
    <div className="h-screen flex flex-col">
      <Navbar email={email} />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
