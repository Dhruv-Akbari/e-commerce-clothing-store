
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    Email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handelchange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "https://e-commerce-clothing-store-wzw0.onrender.com/api/auth/login",
        loginData,
        { withCredentials: true }
      );

      const { token, Data } = response.data;

      // Save token and complete user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(Data));

      // Notify components using useUserId
      window.dispatchEvent(new Event("userUpdated"));

      if (Data.role === "user") {
        navigate("/Home");
      } else if (Data.role === "admin") {
        navigate("/admin");
      } else {
        alert("Invalid user role");
      }

    } catch (error) {
      console.log("ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("MESSAGE:", error.message);

      alert("Login failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md"
      >
        <h3 className="mb-1 text-2xl font-semibold text-slate-800">
          Welcome Back
        </h3>

        <p className="mb-7 text-sm text-slate-500">
          Login to your account
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="Email"
            value={loginData.Email}
            onChange={handelchange}
            placeholder="Enter your email"
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginData.password}
              onChange={handelchange}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white transition duration-200 hover:scale-[1.02] hover:bg-slate-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/Register")}
            className="font-medium text-slate-800 hover:underline"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
