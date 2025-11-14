import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
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
import { Eye, EyeOff } from "lucide-react"; // 👁️ Icons for password toggle
import { useNotification } from "@/components/ui/notification";

export default function RegisterPage() {
      const navigate = useNavigate();
      const base_url = import.meta.env.VITE_BACKEND_URL;

      const [name, setName] = useState("");
      const [username, setUsername] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");

      const [showPassword, setShowPassword] = useState(false);

      const [loading, setLoading] = useState(false);
      const { error } = useNotification();

      const handleRegister = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                  const res = await axios.post(
                        `${base_url}/register`,
                        {
                              name,
                              username,
                              email,
                              password,
                        },
                        { withCredentials: true }
                  );

                  if (res.status === 200) {
                        navigate("/verify-email", { state: { email } });
                  }
            } catch (err) {
                  error(err.response?.data?.message || "Something went wrong", "Registration failed");
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
                              bg-transparent
                              border border-white/10
                              shadow-none
                        "
                                                      >
                        <CardHeader className="space-y-1 text-center">
                              <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                                    Register
                              </CardTitle>
                              <CardDescription className="text-gray-300">
                                    Enter your details to create an account
                              </CardDescription>
                        </CardHeader>

                        <CardContent>
                              <form className="space-y-5" onSubmit={handleRegister}>

                                    {/* Name */}
                                    <div className="space-y-2">
                                          <Label htmlFor="name" className="text-white">Name</Label>
                                          <Input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="
                  bg-transparent
                  text-white
                  border border-white/30
                  focus-visible:ring-white/30
                  focus-visible:ring-2
                "
                                          />
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                          <Label htmlFor="username" className="text-white">Username</Label>
                                          <Input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                className="
                  bg-transparent
                  text-white
                  border border-white/30
                  focus-visible:ring-white/30
                  focus-visible:ring-2
                "
                                          />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                          <Label htmlFor="email" className="text-white">Email</Label>
                                          <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="
                  bg-transparent
                  text-white
                  border border-white/30
                  focus-visible:ring-white/30
                  focus-visible:ring-2
                "
                                          />
                                    </div>

                                    {/* Password with eye toggle */}
                                    <div className="space-y-2">
                                          <Label htmlFor="password" className="text-white">Password</Label>

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
                    border border-white/30
                    focus-visible:ring-white/30
                    focus-visible:ring-2
                    pr-10
                  "
                                                />

                                                {/* Eye Button */}
                                                <button
                                                      type="button"
                                                      onClick={() => setShowPassword(!showPassword)}
                                                      className="absolute right-3 top-2.5 text-white/70 hover:text-white"
                                                >
                                                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                          </div>
                                    </div>

                                    {/* Neon Submit Button */}
                                    <Button
                                          type="submit"
                                          className="
                w-full 
                font-bold 
                bg-[#DFFF00] 
                text-black 
                hover:bg-[#c5f200]
                transition-all
              "
                                          disabled={loading}
                                    >
                                          {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                      <Spinner className="size-4" />
                                                      Registering...
                                                </span>
                                          ) : (
                                                "Register"
                                          )}
                                    </Button>

                                    {/* Link */}
                                    <p className="text-center text-sm pt-2 text-gray-300">
                                          Already have an account?
                                          <button
                                                type="button"
                                                onClick={() => navigate("/login")}
                                                className="ml-2 text-[#DFFF00] hover:underline cursor-pointer"
                                          >
                                                Login
                                          </button>
                                    </p>
                              </form>
                        </CardContent>
                  </Card>
            </motion.div>
      );
}
