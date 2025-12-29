import React, { useActionState } from "react";
import { useAuth } from "../authContext/UserContext";
import { loginApi } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(
    async (prev, formData) => {
      try {
        const payload = Object.fromEntries(formData.entries());
        const data = await loginApi(payload);

        setUser(data.user);

        setTimeout(() => {
          navigate("/");
        }, 1000);

        return { ok: true, message: data.message || "Welcome" };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    { ok: false, error: null, message: null }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="./logo.avif" alt="logo" className="h-10 w-10" />
        </div>

        {/* Card */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            Create your account
          </h1>

          <form action={formAction} className="space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#1D9BF0] text-white font-semibold py-3 rounded-full
            hover:bg-blue-600 transition"
            >
              {isPending ? "Creating account..." : "Login"}
            </button>

            {/*   Don’t have an account?*/}
            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

            {/* Messages */}
            {!state.ok && state.error && (
              <p className="text-red-600 text-sm text-center">{state.error}</p>
            )}

            {state.ok && state.message && (
              <p className="text-green-600 text-sm text-center">
                {state.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
