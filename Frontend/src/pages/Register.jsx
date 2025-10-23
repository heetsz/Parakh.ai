import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
      const navigate = useNavigate();
      const base_url = import.meta.env.VITE_BACKEND_URL; 

      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState("");

      const handleRegister = async (e) => {
            e.preventDefault();
            setLoading(true);
            setMessage("");

            try {
                  const res = await axios.post(`${base_url}/register`, {
                        name,
                        email,
                        password,
                  });

                  if (res.status === 201) {
                        setMessage(`Welcome, ${res.data.newUser.name}! Registration successful.`);
                        navigate("/login")
                  }
            } catch (err) {
                  console.log(err.response); 
                  setMessage(err.response?.data?.message || "Something went wrong");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                  <Card className="w-full max-w-sm">
                        <CardHeader className="space-y-1">
                              <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
                              <CardDescription className="text-center">
                                    Enter your details to create an account
                              </CardDescription>
                        </CardHeader>
                        <CardContent>
                              <form className="space-y-4" onSubmit={handleRegister}>
                                    <div className="space-y-2">
                                          <Label htmlFor="name">Name</Label>
                                          <Input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                          />
                                    </div>

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

                                    <Button
                                          type="submit"
                                          className="w-full"
                                          disabled={loading}
                                    >
                                          {loading ? "Registering..." : "Register"}
                                    </Button>

                                    {message && <p className="text-center text-sm mt-2 text-red-500">{message}</p>}
                              </form>
                        </CardContent>
                  </Card>
            </div>
      );
}
