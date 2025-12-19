import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "", // added phone
    role: "receiver", // default role
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginData); // login now returns user

      // Redirect based on role
      if (user.role === "admin") navigate("/dashboard/admin");
      else if (user.role === "donor") navigate("/dashboard/donor");
      else if (user.role === "rider") navigate("/dashboard/rider");
      else navigate("/dashboard/receiver");
    } catch (err) {
      // Show backend error neatly under the form
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!signupData.name || !signupData.email || !signupData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signup(signupData);

      // Switch to login after successful signup
      setMode("login");
      setSignupData({ name: "", email: "", password: "", role: "receiver" });
      setError("");
    } catch (err) {
      setError(err.message || "Server error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Info Section */}
          <div className="hidden lg:flex flex-col justify-center items-start gap-6 pl-6">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-lg text-white w-full">
              <h2 className="text-4xl font-extrabold">Welcome to JiraniEat</h2>
              <p className="mt-4 text-lg max-w-xl">
                Share surplus food, request help, and connect with neighbors. Sign up to make
                a difference in your community.
              </p>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">
                  {mode === "login" ? "Sign in to your account" : "Create your account"}
                </h3>
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                  }}
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  {mode === "login" ? "Need an account?" : "Already have an account?"}
                </button>
              </div>

              <Card>
                <CardContent className="p-6">
                  {mode === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                          }
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                          }
                          placeholder="••••••••"
                        />
                      </div>

                      {error && <p className="text-sm text-red-500">{error}</p>}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>

                      <div className="text-sm text-center mt-2">
                        <RouterLink to="/" className="text-primary underline">
                          Back to Home
                        </RouterLink>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div>
                        <Label>Full name</Label>
                        <Input
                          type="text"
                          value={signupData.name}
                          onChange={(e) =>
                            setSignupData({ ...signupData, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({ ...signupData, email: e.target.value })
                          }
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          type="tel"
                          value={signupData.phone}
                          onChange={(e) =>
                            setSignupData({ ...signupData, phone: e.target.value })
                          }
                          placeholder="+254 700 000 000"
                        />
                      </div>

                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({ ...signupData, password: e.target.value })
                          }
                          placeholder="Create a strong password"
                        />
                      </div>

                      <div>
                        <Label>Role</Label>
                        <select
                          value={signupData.role}
                          onChange={(e) =>
                            setSignupData({ ...signupData, role: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <option value="receiver">Receiver</option>
                          <option value="donor">Donor</option>
                          <option value="rider">Rider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* Admin Secret Check */}
                      {signupData.role === "admin" && (
                        <div>
                          <Label>Admin Secret Key</Label>
                          <Input
                            type="password"
                            value={signupData.adminSecret || ""}
                            onChange={(e) =>
                              setSignupData({ ...signupData, adminSecret: e.target.value })
                            }
                            placeholder="Enter system secret"
                          />
                        </div>
                      )}

                      {error && <p className="text-sm text-red-500">{error}</p>}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>

                      <div className="text-sm text-center mt-2">
                        By creating an account you agree to our{" "}
                        <RouterLink to="/legal" className="underline text-primary">
                          Terms & Privacy
                        </RouterLink>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Need help?{" "}
                <RouterLink to="/contacts" className="underline text-foreground">
                  Contact support
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
