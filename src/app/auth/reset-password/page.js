"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetForgotPassword } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [form, setForm] = useState({
    email,
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(f => ({ ...f, email }));
  }, [email]);

  const validate = () => {
    const errs = {};
    if (!form.otp) errs.otp = "OTP is required.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!form.password_confirmation) errs.password_confirmation = "Confirm your password.";
    else if (form.password !== form.password_confirmation) errs.password_confirmation = "Passwords do not match.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await resetForgotPassword({
        email: form.email,
        otp: form.otp,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success("Password reset successfully.");
      router.push("/auth/login");
    } catch (err) {
      setErrors({ otp: "Invalid OTP or email." });
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card shadow rounded-4 p-4">
            <h3 className="fw-bold mb-3 text-center">Reset Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">OTP</label>
                <input
                  type="text"
                  name="otp"
                  className={`form-control${errors.otp ? " is-invalid" : ""}`}
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  required
                />
                {errors.otp && <div className="invalid-feedback d-block">{errors.otp}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control${errors.password ? " is-invalid" : ""}`}
                  placeholder="New password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  className={`form-control${errors.password_confirmation ? " is-invalid" : ""}`}
                  placeholder="Confirm password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
                {errors.password_confirmation && <div className="invalid-feedback d-block">{errors.password_confirmation}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
