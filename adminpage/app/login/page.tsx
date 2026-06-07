"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("odmm_admin_token", data.token);
      localStorage.setItem("odmm_admin", JSON.stringify(data.admin));

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={handleLogin}>
        <div className="iconBox">
          <span>⌑</span>
        </div>

        <h1>ODMM Admin</h1>
        <p>Enter your password to continue</p>

        {error && <div className="errorBox">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <span className="footerText">ODMM Admin Panel</span>
      </form>

      <style jsx>{`
        .loginPage {
          min-height: 100vh;
          background: #070d18;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #ffffff;
        }

        .loginCard {
          width: 100%;
          max-width: 480px;
          background: #101827;
          border: 1px solid #223047;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          text-align: center;
        }

        .iconBox {
          width: 70px;
          height: 70px;
          margin: 0 auto 24px;
          border-radius: 16px;
          background: #07364b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d5ff;
          font-size: 36px;
        }

        h1 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        p {
          color: #8fb3e8;
          margin-bottom: 32px;
          font-size: 16px;
        }

        input {
          width: 100%;
          height: 54px;
          margin-bottom: 20px;
          border-radius: 10px;
          border: 1px solid #223047;
          background: #080f1d;
          color: #ffffff;
          font-size: 16px;
          padding: 0 18px;
          outline: none;
        }

        input::placeholder {
          color: #9db4da;
        }

        input:focus {
          border-color: #00d5ff;
          box-shadow: 0 0 0 2px rgba(0, 213, 255, 0.25);
        }

        button {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 10px;
          background: #14798b;
          color: #020617;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 2px;
        }

        button:hover {
          background: #18a0b8;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .errorBox {
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(248, 113, 113, 0.35);
          color: #fecaca;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .footerText {
          display: block;
          margin-top: 28px;
          color: #8fb3e8;
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}