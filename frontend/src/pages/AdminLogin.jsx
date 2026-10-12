import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@julesforher.co.za");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await api.post("/auth/login", { email, password });
      localStorage.setItem("jfh_token", r.data.token);
      toast.success(`Welcome back, ${r.data.user.name}`);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const input = "w-full bg-transparent border-b border-[#EFD9D9] py-3 text-[15px] focus:outline-none focus:border-[#592C32] placeholder:text-[#b28b90]";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1613966561243-c6959a886009?w=1400&q=80&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#2E1C1E]/30"></div>
        <div className="absolute bottom-10 left-10 text-white">
          <div className="font-script text-4xl">Jules For Her</div>
          <div className="text-xs tracking-[0.35em] uppercase mt-1">Boutique admin</div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6" data-testid="admin-login-form">
          <Link to="/" className="text-[11px] tracking-[0.35em] uppercase text-[#8a5c62]">← Back to store</Link>
          <div>
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Sign in</div>
            <h1 className="font-serif text-4xl text-[#2E1C1E] mt-2">Boutique Admin</h1>
          </div>
          <input required type="email" data-testid="admin-email" className={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" data-testid="admin-password" className={input} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={loading} data-testid="admin-login-submit" className="w-full bg-[#592C32] text-white py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23] disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
