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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const base_url = import.meta.env.VITE_BACKEND_URL;

  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${base_url}/verify`,
        { email, code },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Email verified successfully!", {
          position: "top-right",
          theme: "dark",
        });

        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed", {
        position: "top-right",
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
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
            Enter the 6-digit code sent to your email
          </CardTitle>
          <CardDescription className="text-gray-400">
            {/* Enter the 6-digit code sent to your email.<br /> */}
            <span className="text-xs text-gray-500">Didn’t see it? Check your spam / junk folder. You can also try resending after a minute.</span>
            <br />
            <span className="text-xs text-gray-500 block mt-1">
              Checking <span className="font-medium text-gray-300">{email}</span>?{' '}
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
              >
                Open Gmail
              </a>
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleVerify}>
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
    flex items-center justify-center gap-2
  "
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
