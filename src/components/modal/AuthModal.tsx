"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const displayName = isSignUp ? name : email.split("@")[0];
    const loggedUser = {
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: email,
    };

    onLoginSuccess(loggedUser);
    onClose();
    resetForm();
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: "Guest",
      email: "guest@gmail.com",
    };
    onLoginSuccess(guestUser);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setIsSignUp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-scale-up z-10 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
        >
          <CloseIcon className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-xs text-zinc-400">
            {isSignUp ? "Join ThaiFlix to rate and review" : "Welcome back to ThaiFlix"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-lg animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium block">Full Name</label>
              <div className="relative">
                <PersonIcon className="absolute left-3 top-2.5 text-zinc-500 text-lg" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Somchai Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors placeholder-zinc-600 font-light"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium block">Email Address</label>
            <div className="relative">
              <EmailIcon className="absolute left-3 top-2.5 text-zinc-500 text-lg" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors placeholder-zinc-600 font-light"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium block">Password</label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-2.5 text-zinc-500 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors placeholder-zinc-600 font-light"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
              >
                {showPassword ? (
                  <VisibilityOffIcon className="text-lg" />
                ) : (
                  <VisibilityIcon className="text-lg" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-brand text-white font-bold text-sm hover:bg-brand-hover active:scale-[0.98] transition-all shadow-md shadow-brand/10 cursor-pointer mt-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-800/80"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-grow border-t border-zinc-800/80"></div>
        </div>

        <button
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-700 font-medium text-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          Quick Guest Sign In
        </button>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-xs text-zinc-400 hover:text-brand transition-colors cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "New to ThaiFlix? Sign Up Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
