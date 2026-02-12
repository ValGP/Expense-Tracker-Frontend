import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../api/errorMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/home", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resetDemo() {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/demo/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Failed to reset demo data.");
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 p-4">
      <div className="mx-auto max-w-md pt-8">
        <h1 className="text-2xl font-semibold">ExpenseTracker</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in to continue</p>

        <Card className="mt-6 space-y-3">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleLogin}>
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <Button variant="secondary" onClick={() => navigate("/register")}>
            Create account
          </Button>

          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                await resetDemo();
                await login("demo@example.com", "demo12345");
                navigate("/app/home", { replace: true });
              } catch (err) {
                setError(getApiErrorMessage(err));
              } finally {
                setLoading(false);
              }
            }}
          >
            Enter demo mode
          </Button>
        </Card>
      </div>
    </div>
  );
}
