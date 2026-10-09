"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { authenticate } from "@/lib/auth-api";
import { useData } from "@/contexts/dataContext";
import { useUser } from "@/contexts/userContext";
import { useRecord } from "@/contexts/recordContext";

export default function AuthComponent({ signUp = false }) {
  const router = useRouter();
  const [showPassword,setShowPassword] = useState(false);
  const { authApiOptions } = useData();
  const { handleAuthResponse } = useUser();
  const { resetRecords } = useRecord();
  const [isSignUp, setIsSignUp] = useState(signUp);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inputFields, setInputFields] = useState({ password: "", email: "", first_name: "", last_name: "", gender: "" });

  const change = (field, value) => setInputFields((current) => ({ ...current, [field]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const required = isSignUp ? Object.values(inputFields) : [inputFields.email, inputFields.password];
    if (required.some((value) => !String(value).trim())) { setMessage(isSignUp ? "Complete every field to create your account." : "Enter your email and password."); return; }
    setLoading(true);
    const { data, message: responseMessage } = await authenticate(inputFields, authApiOptions[isSignUp ? 1 : 0]);
    if (responseMessage) setMessage(responseMessage); else if (data) { resetRecords(); await handleAuthResponse(data); const next = new URLSearchParams(window.location.search).get("next"); router.push(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/workspace/analytics"); }
    setLoading(false);
  };

  return (
    <section className="bio-card w-full max-w-lg p-6 sm:p-9" aria-labelledby="auth-title">
      <div className="mb-8 flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><LockKeyhole size={20} /></span><div><h1 id="auth-title" className="text-3xl font-medium tracking-tight">{isSignUp ? "Create Your Account" : "Welcome Back"}</h1><p className="mt-2 text-sm leading-6 text-[var(--biolabs-slate)]">{isSignUp ? "Set up a secure Biolabs profile." : "Sign in to access your clinical workspace."}</p></div></div>
      {message && <div role="alert" className="mb-5 rounded-md bg-[var(--biolabs-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--biolabs-danger)]">{message}</div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignUp && <div className="grid gap-4 sm:grid-cols-2"><label><span className="bio-label">First name</span><input className="bio-input" autoComplete="given-name" value={inputFields.first_name} onChange={(e) => change("first_name", e.target.value)} /></label><label><span className="bio-label">Last name</span><input className="bio-input" autoComplete="family-name" value={inputFields.last_name} onChange={(e) => change("last_name", e.target.value)} /></label></div>}
        <label className="block"><span className="bio-label">Email address</span><input className="bio-input" required type="email" autoComplete="email" value={inputFields.email} onChange={(e) => change("email", e.target.value)} /></label>
        <label className="block"><span className="bio-label">Password</span><input className="bio-input" required type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} value={inputFields.password} onChange={(e) => change("password", e.target.value)} /></label>
        <button type="button" className="text-sm text-[var(--biolabs-teal)] min-h-11" aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}>{showPassword ? "Hide password" : "Show password"}</button>
        {isSignUp && <label className="block"><span className="bio-label">Gender</span><select className="bio-input" value={inputFields.gender} onChange={(e) => change("gender", e.target.value)}><option value="">Select an option</option><option value="male">Male</option><option value="female">Female</option></select></label>}
        <button className="bio-button-primary w-full" type="submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" size={18} /> Processing</> : <>{isSignUp ? <CheckCircle2 size={18} /> : null}{isSignUp ? "Create account" : "Sign in"}</>}</button>
      </form>
      <p className="mt-7 text-center text-sm text-[var(--biolabs-slate)]">{isSignUp ? "Already have an account?" : "New to Biolabs?"} <button type="button" className="ml-1 font-semibold text-[var(--biolabs-teal)] underline underline-offset-4" onClick={() => { setIsSignUp((value) => !value); setMessage(""); }}>{isSignUp ? "Sign in" : "Create an account"}</button></p>
    </section>
  );
}
