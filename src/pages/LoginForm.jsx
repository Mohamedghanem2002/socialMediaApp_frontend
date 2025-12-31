import React, { useActionState } from "react";
import { useAuth } from "../authContext/UserContext";
import { loginApi } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LoginForm() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(
    async (prev, formData) => {
      try {
        const payload = Object.fromEntries(formData.entries());
        const data = await loginApi(payload);

        await refreshUser();

        setTimeout(() => {
          navigate("/");
        }, 1000);

        return { ok: true, message: data.message || "Welcome back!" };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    { ok: false, error: null, message: null }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 px-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="w-full max-w-md z-10">
        {/* Card */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4 transform -rotate-6 transition-transform duration-300">
              <img src="./logo.avif" alt="logo" className="h-10 w-10 brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Please enter your details</p>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-base
                focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-base
                focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder:text-gray-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl
              hover:bg-black transform active:scale-[0.98] transition-all duration-200 shadow-xl shadow-gray-900/10 disabled:opacity-70"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : "Sign In"}
            </button>

            {/* Messages */}
            {!state.ok && state.error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100">
                {state.error}
              </div>
            )}

            {state.ok && state.message && (
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold text-center border border-green-100">
                {state.message}
              </div>
            )}

            {/* Footer */}
            <p className="text-sm font-bold text-center text-gray-500 pt-2">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-purple-600 font-black hover:underline underline-offset-4"
              >
                Sign up free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
