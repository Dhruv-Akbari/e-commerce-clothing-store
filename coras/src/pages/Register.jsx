import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let NewErrors = {};

    if (!formData.Name.trim()) {
      NewErrors.Name = "Name is required";
    }

    if (!formData.Email.trim()) {
      NewErrors.Email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.Email)
    ) {
      NewErrors.Email = "Invalid email address";
    }

    if (!formData.password) {
      NewErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      NewErrors.password = "Password must be at least 6 characters";
    }

    setErrors(NewErrors);

    return Object.keys(NewErrors).length === 0;
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handelRegister = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const response = await axios.post(
        "https://e-commerce-clothing-store-wzw0.onrender.com/api/auth/Register",
        formData,
      );

      alert(response.data.message || "Registration Successful");

      navigate("/");
    } catch (err) {
     

      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handelRegister}
        className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md"
      >
        <h3 className="mb-1 text-2xl font-semibold text-slate-800">Register</h3>

        <p className="mb-7 text-sm text-slate-500">Create your account</p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>

          <input
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {errors.Name && <p>{errors.Name}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {errors.Email && <p>{errors.Email}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {errors.password && <p>{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white transition duration-200 hover:scale-[1.02] hover:bg-slate-700 active:scale-[0.98]"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
