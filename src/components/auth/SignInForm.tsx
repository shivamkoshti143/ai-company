import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { loginCompany } from "../../services/api";
import { setAuthSession } from "../../utils/auth";

export default function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await loginCompany(email, password);
      setAuthSession(response);
      navigate("/company-profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Company Login
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to access your company panel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Email <span className="text-error-500">*</span>
          </Label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <Label>
            Password <span className="text-error-500">*</span>
          </Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm font-medium text-error-500">{error}</p> : null}
        <Button className="w-full" size="sm" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
