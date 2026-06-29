import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("pulse_auth", "1");
      router.push("/");
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg-dark relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pink/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-teal">hirenum</span>
            <span className="text-pink">.</span>
          </h1>
          <p className="text-muted text-sm mt-3">Sign in to the control room<span className="text-teal">.</span></p>
        </div>

        <div className="bg-bg-card border border-border rounded-card px-8 py-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-muted block mb-2 uppercase tracking-wider font-semibold">Username</label>
              <input
                className="w-full rounded-pill px-5 py-3 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-2 uppercase tracking-wider font-semibold">Password</label>
              <input
                type="password"
                className="w-full rounded-pill px-5 py-3 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-pink">{error}</p>}

            <button
              type="submit"
              className="bg-teal hover:bg-teal-hover text-black rounded-pill px-6 py-3 text-sm font-bold uppercase tracking-wide transition mt-2"
            >
              Sign in →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
