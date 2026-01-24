"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email_or_phone: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Detect type: email or phone
  const getType = (val) => {
    if (/^\d+$/.test(val)) return "phone";
    if (/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val)) return "email";
    return "";
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.email_or_phone) newErrors.email_or_phone = "Email or phone is required.";
    if (!form.password) newErrors.password = "Password is required.";
    return newErrors;
  };

  // On change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const type = getType(form.email_or_phone);
      if (!type) {
        setErrors({ email_or_phone: "Please enter a valid email or phone number." });
        setLoading(false);
        return;
      }
      const payload = {
        email_or_phone: form.email_or_phone,
        password: form.password,
        type,
      };
      const res = await loginUser(payload);
      // Save session (for demo, use localStorage)
      localStorage.setItem("snapcart_user", JSON.stringify(res.user || { email_or_phone: form.email_or_phone }));
      // Notify header to update
      window.dispatchEvent(new Event("snapcart-auth-change"));
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      if (err?.errors) {
        const apiErrors = {};
        err.errors.forEach((e) => {
          apiErrors[e.code] = e.message;
        });
        setErrors(apiErrors);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const isFormValid = form.email_or_phone && form.password;

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="row shadow rounded-4 overflow-hidden bg-white">
            {/* Left: Login Form */}
            <div className="col-12 col-md-7 p-4 p-md-5">
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                  <i className="fas fa-user fa-2x text-white"></i>
                </div>
                <h3 className="fw-bold mt-3 mb-0">Sign In</h3>
              </div>
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email / Phone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="email_or_phone"
                    className={`form-control${errors.email_or_phone ? " is-invalid" : ""}`}
                    placeholder="admin@snaptec.ltd"
                    value={form.email_or_phone}
                    onChange={handleChange}
                  />
                  {errors.email_or_phone && <div className="invalid-feedback">{errors.email_or_phone}</div>}
                </div>
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control${errors.password ? " is-invalid" : ""}`}
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ borderLeft: 0 }}
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="remember"
                      id="remember"
                      checked={form.remember}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link href="#" className="text-primary small">
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
            {/* Right: Divider and Sign Up */}
            <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center bg-light position-relative py-4">
              <div className="vr position-absolute top-0 bottom-0 start-0 d-none d-md-block" style={{ width: 2, background: "#eee" }}></div>
              <div className="text-center w-100">
                <div className="text-secondary mb-2" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", letterSpacing: 2, fontSize: 13, height: 120, margin: "0 auto" }}>
                  Or Sign in with
                </div>
                <div className="my-3"></div>
                <div className="text-secondary mb-2">Enjoy New experience <Link href="/auth/register" className="text-primary">Sign up</Link></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
