import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { setSession } from "../../utils/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", role: "DEALER", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const email = form.email.trim().toLowerCase();
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, form.password);
      await updateProfile(credential.user, { displayName: form.name.trim() });
      const user = { uid: credential.user.uid, name: form.name.trim(), email, role: "DEALER", active: true, createdAt: serverTimestamp() };
      await setDoc(doc(db, "users", credential.user.uid), user);
      setSession(user, "DEALER");
      navigate("/dealer/dashboard", { replace: true });
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "An account with this email already exists." : (err.message || "Unable to create account."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white"><UserRound size={25} /></div>
            <p className="mt-5 text-sm font-medium text-slate-500">PAREEKX</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Create Account</h1>
            <p className="mt-2 text-sm text-slate-500">Create a new dealer account. Salesperson accounts are created by the administrator.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Account Type</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"><option value="DEALER">Dealer</option></select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
            </div>

            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Create Account</button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
