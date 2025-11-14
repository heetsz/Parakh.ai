import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const base_url = import.meta.env.VITE_BACKEND_URL;

  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${base_url}/verify`,
        { email, code },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setMessage("Email verified successfully!");
        window.location.reload();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      {/* Subtle Glass Card */}
      <Card
        className="
          w-full max-w-sm 
          backdrop-blur-md
          bg-white/5
          border border-white/15
          shadow-none
        "
      >
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-white">
            Verify Email
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleVerify}>
            {/* Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-200">
                Verification Code
              </Label>

              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="
                  bg-transparent
                  text-white
                  border border-white/20
                  focus-visible:ring-white/20
                  focus-visible:ring-1
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Button (Professional, no glow) */}
            <Button
              type="submit"
              disabled={loading}
              className="
                w-full
                font-medium
                bg-[#DFFF00]
                text-black
                hover:bg-[#c7e600]
                transition-colors
              "
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>

            {/* Error / Success Message */}
            {message && (
              <p
                className={`text-center text-sm mt-2 ${message.includes("success")
                    ? "text-green-400"
                    : "text-red-400"
                  }`}
              >
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
