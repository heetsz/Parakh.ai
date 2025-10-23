import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
      const navigate = useNavigate();
      const base_url = import.meta.env.VITE_BACKEND_URL; 

      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState("");

      const handleLogin = async (e) => {
            e.preventDefault();
            setLoading(true);
            setMessage("");

            try {

                  // Include credentials so HttpOnly cookie set by server is stored by the browser
                  const res = await axios.post(
                        `${base_url}/login`,
                        { email, password },
                        { withCredentials: true }
                  );

                  // Server returns token in body as well; keep it for Authorization header fallback
                  if (res.data.token) localStorage.setItem("token", res.data.token);

                  setMessage(res.data.message);
                  // navigate("/dashboard"); // redirect to dashboard
                  // reload the page to reflect authenticated state
                  window.location.reload();
            } catch (err) {
                  setMessage(err.response?.data?.message || "Something went wrong");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                  <Card className="w-full max-w-sm">
                        <CardHeader className="space-y-1">
                              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                              <CardDescription className="text-center">
                                    Enter your email and password to login
                              </CardDescription>
                        </CardHeader>
                        <CardContent>
                              <form className="space-y-4" onSubmit={handleLogin}>
                                    <div className="space-y-2">
                                          <Label htmlFor="email">Email</Label>
                                          <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="password">Password</Label>
                                          <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                          />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                          {loading ? "Logging in..." : "Login"}
                                    </Button>

                                    {message && <p className="text-center text-sm mt-2 text-red-500">{message}</p>}
                              </form>
                        </CardContent>
                  </Card>
            </div>
      );
}
