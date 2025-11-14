import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
      const base_url = import.meta.env.VITE_BACKEND_URL;

      const [username, setUsername] = useState("");
      const [password, setPassword] = useState("");
      const [loading, setLoading] = useState(false);
      const [showPassword, setShowPassword] = useState(false);

      const handleLogin = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                  await axios.post(`${base_url}/login`, { username, password }, { withCredentials: true });

                  toast.success("Login Successful!", {
                        position: "top-right",
                        theme: "dark",
                  });

                  setTimeout(() => window.location.reload(), 600);
            } catch (err) {
                  toast.error(err.response?.data?.message || "Login failed", {
                        position: "top-right",
                        theme: "dark",
                  });
            } finally {
                  setLoading(false);
            }
      };

      return (
            <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex justify-center items-center h-screen bg-black"
            >
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
                              <CardTitle className="text-3xl font-semibold text-white">
                                    Login
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                    Enter your username and password
                              </CardDescription>
                        </CardHeader>

                        <CardContent>
                              <form className="space-y-5" onSubmit={handleLogin}>
                                    {/* Username */}
                                    <div className="space-y-2">
                                          <Label htmlFor="username" className="text-gray-200">
                                                Username
                                          </Label>

                                          <Input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
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

                                    {/* Password */}
                                    <div className="space-y-2">
                                          <Label htmlFor="password" className="text-gray-200">
                                                Password
                                          </Label>

                                          <div className="relative">
                                                <Input
                                                      id="password"
                                                      type={showPassword ? "text" : "password"}
                                                      value={password}
                                                      onChange={(e) => setPassword(e.target.value)}
                                                      required
                                                      className="
                    bg-transparent 
                    text-white
                    border border-white/20
                    focus-visible:ring-white/20
                    focus-visible:ring-1
                    placeholder:text-gray-400
                    pr-10
                  "
                                                />

                                                <button
                                                      type="button"
                                                      onClick={() => setShowPassword(!showPassword)}
                                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                >
                                                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                          </div>
                                    </div>

                                    {/* Professional Button (NO GLOW, ONLY NEON ACCENT) */}
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
                                          {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                      <Spinner className="size-4" />
                                                      Logging in...
                                                </span>
                                          ) : (
                                                "Login"
                                          )}
                                    </Button>

                                    {/* Register link */}
                                    <div className="text-center text-sm pt-2 text-gray-300">
                                          Don't have an account?{" "}
                                          <Link
                                                to="/register"
                                                className="text-[#DFFF00] hover:underline"
                                          >
                                                Register
                                          </Link>
                                    </div>
                              </form>
                        </CardContent>
                  </Card>

                  <ToastContainer />
            </motion.div>
      );
}
