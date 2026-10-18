import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getProfileForCurrentUser, getRole, isAuthenticated, setSession } from "../../utils/auth";
import { auth } from "../../firebase";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const role = getRole();
    if (role === "DEALER") navigate("/dealer/dashboard", { replace: true });
    if (role === "SALESPERSON") navigate("/salesperson/dashboard", { replace: true });
  }, [navigate]);

  const redirectByRole = (role) => {
    if (role === "DEALER") return "/dealer/dashboard";
    if (role === "SALESPERSON") return "/salesperson/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/login";
  };

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
      if (!["DEALER", "SALESPERSON"].includes(String(user.role).toUpperCase()) || user.active === false) {
        await auth.signOut();
        throw new Error("This account is not enabled for the dealer/salesperson portal.");
      }
      setSession(user, user.role);
      navigate(location.state?.from || redirectByRole(String(user.role).toUpperCase()), { replace: true });
    } catch (err) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password." : (err.message || "Unable to sign in."));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <LogIn size={25} />
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">PAREEKX</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Sign In</h1>
            <p className="mt-2 text-sm text-slate-500">Dealer and salesperson portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

            <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>


          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <Link to="/signup" className="font-semibold text-slate-900 hover:underline">Create an account</Link>
            <Link to="/admin/login" className="text-slate-500 hover:text-slate-900">Admin Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
