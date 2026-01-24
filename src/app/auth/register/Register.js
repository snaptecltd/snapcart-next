"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation logic
  const validate = () => {
    const newErrors = {};
    if (!form.f_name) newErrors.f_name = "First name is required.";
    if (!form.l_name) newErrors.l_name = "Last name is required.";
    if (!form.email) newErrors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) newErrors.email = "Please enter valid email address!";
    if (!form.phone) newErrors.phone = "Phone number is required.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8) newErrors.password = "Minimum 8 characters long";
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!form.terms) newErrors.terms = "You must agree to the terms and conditions.";
    return newErrors;
  };

  // On change handler
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

  // On blur for confirm password
  const handleConfirmPasswordBlur = () => {
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match.",
      }));
    }
  };

  // Submit handler
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
      await registerUser({
        f_name: form.f_name,
        l_name: form.l_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Registration successful! Please sign in.");
      router.push("/auth/login");
    } catch (err) {
      // API returns { errors: [{ code, message }, ...] }
      if (err?.errors) {
        const apiErrors = {};
        err.errors.forEach((e) => {
          apiErrors[e.code === "password_confirmation" ? "confirmPassword" : e.code] = e.message;
        });
        setErrors(apiErrors);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
    setLoading(false);
  };

  // Button enabled only if all validations pass
  const isFormValid = () => {
    const newErrors = validate();
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h2 className="text-center fw-bold mb-4 mt-3">Sign Up</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              First Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="f_name"
              className={`form-control${errors.f_name ? " is-invalid" : ""}`}
              placeholder="Ex: Jhone"
              value={form.f_name}
              onChange={handleChange}
            />
            {errors.f_name && <div className="invalid-feedback">{errors.f_name}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Last Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="l_name"
              className={`form-control${errors.l_name ? " is-invalid" : ""}`}
              placeholder="Ex: Doe"
              value={form.l_name}
              onChange={handleChange}
            />
            {errors.l_name && <div className="invalid-feedback">{errors.l_name}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Phone Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span role="img" aria-label="Bangladesh Flag">
                  <img src="https://flagcdn.com/24x18/bd.png" alt="BD" width={24} height={18} />
                </span>
                +880
              </span>
              <input
                type="text"
                name="phone"
                className={`form-control${errors.phone ? " is-invalid" : ""}`}
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              name="password"
              className={`form-control${errors.password ? " is-invalid" : ""}`}
              placeholder="Minimum 8 characters long"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
              placeholder="Minimum 8 characters long"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleConfirmPasswordBlur}
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <div className="text-danger small">Passwords do not match.</div>
            )}
            {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
          </div>
        </div>
        <div className="form-check mt-4">
          <input
            className="form-check-input"
            type="checkbox"
            name="terms"
            id="terms"
            checked={form.terms}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="terms">
            I agree to Your{" "}
            <Link href="/page/terms-and-conditions" className="text-primary">
              Terms and condition
            </Link>{" "}
            and{" "}
            <Link href="/page/privacy-policy" className="text-primary" target="_blank">
              Privacy Policy
            </Link>
          </label>
          {errors.terms && <div className="text-danger small">{errors.terms}</div>}
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!isFormValid() || loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </div>
        <div className="text-center mt-3">
          <small>
            Already have account ?{" "}
            <Link href="/auth/login" className="text-primary">
              Sign in
            </Link>
          </small>
        </div>
      </form>
    </div>
  );
}
