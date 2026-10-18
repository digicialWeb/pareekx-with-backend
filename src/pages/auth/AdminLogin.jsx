import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { getProfileForCurrentUser, getRole, isAuthenticated, setSession } from "../../utils/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && getRole() === "ADMIN") navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email.trim().toLowerCase(), form.password);
      const user = await getProfileForCurrentUser();
      if (String(user.role).toUpperCase() !== "ADMIN" || user.active === false) {
        await signOut(auth);
        throw new Error("This account is not authorized as an administrator.");
      }
      setSession(user, "ADMIN");
      navigate(location.state?.from || "/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password." : (err.message || "Unable to sign in."));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900">
                <ShieldCheck size={25} />
              </div>
              <p className="mt-8 text-sm font-medium text-slate-400">PAREEKX</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">Admin Portal</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                Manage orders, dealers, salespersons, products and operations from one place.
              </p>
            </div>
            <p className="text-xs text-slate-500">Secure Firebase Authentication</p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium text-slate-500">Welcome back</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">Admin Login</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to access your admin dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@pareekx.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

              <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>


            <Link to="/login" className="mt-5 block text-center text-sm font-medium text-slate-600 hover:text-slate-900">
              User / Dealer / Salesperson Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
