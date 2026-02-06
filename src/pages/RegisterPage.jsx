import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../api/errorMessage";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/app/home", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 p-4">
      <div className="mx-auto max-w-md pt-8">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">Sign up in under a minute</p>

        <Card className="mt-6 space-y-3">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleRegister}>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Valentin"
            />

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
              placeholder="At least 8 characters"
            />

            <Button disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          <Button variant="secondary" onClick={() => navigate("/login")}>
            Back to sign in
          </Button>
        </Card>
      </div>
    </div>
  );
}
