"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { registerUser, getTelephoneCountryCodes } from "@/lib/api/global.service";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { data: ccData } = useSWR("telephone-country-codes", getTelephoneCountryCodes, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 30,
  });
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({ name: "Bangladesh (+880)", code: "880" });
  const dropdownRef = useRef(null);
  const [ccOpen, setCcOpen] = useState(false);
  const [ccSearch, setCcSearch] = useState("");

  // small mapping for flagcdn country ISO by common name tokens
  const isoMap = {
    uk: "gb",
    usa: "us",
    algeria: "dz",
    andorra: "ad",
    bangladesh: "bd",
  };
  const getIso = (name = "") => {
    const key = name.split(" ")[0].replace(/[()+]/g, "").toLowerCase();
    return isoMap[key] || key.slice(0, 2) || "bd";
  };
  const getFlagUrl = (name) => `https://flagcdn.com/24x18/${getIso(name)}.png`;

  useEffect(() => {
    if (ccData?.country_codes && Array.isArray(ccData.country_codes)) {
      setCountryCodes(ccData.country_codes);
      // prefer Bangladesh (+880) if present, else pick first
      const bd = ccData.country_codes.find(
        (c) => c.code === "880" || /bangla/i.test(c.name)
      );
      setSelectedCountry(bd || ccData.country_codes[0] || selectedCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ccData]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCcOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const filteredCountryCodes = (countryCodes || []).filter((c) => {
    if (!ccSearch) return true;
    const s = ccSearch.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.code.toString().includes(s);
  });

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
        country_code: selectedCountry?.code || "880",
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

            <div className="input-group" style={{ position: "relative" }} ref={dropdownRef}>
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center"
                onClick={() => setCcOpen((v) => !v)}
                aria-expanded={ccOpen}
                style={{ gap: 8, border: "1px solid #dee2e6", borderRight: 0 }}
              >
                <img
                  src={getFlagUrl(selectedCountry?.name)}
                  alt="flag"
                  width={24}
                  height={18}
                  onError={(e) => (e.currentTarget.src = "https://flagcdn.com/24x18/bd.png")}
                />
                <span className="ms-2">+{selectedCountry?.code || "880"}</span>
                <i className="fa fa-caret-down ms-2" />
              </button>

              {/* Searchable dropdown panel */}
              {ccOpen && (
                <div
                  className="card cc-dropdown"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "100%",
                    zIndex: 1100,
                    width: 320,
                    marginTop: 8,
                    padding: 8,
                  }}
                >
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Search"
                    value={ccSearch}
                    onChange={(e) => setCcSearch(e.target.value)}
                    autoFocus
                  />
                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {filteredCountryCodes.length === 0 ? (
                      <div className="p-2 text-muted">No results</div>
                    ) : (
                      filteredCountryCodes.map((cc) => (
                        <button
                          type="button"
                          className="d-flex align-items-center w-100 btn btn-sm btn-transparent text-start px-2 py-2"
                          key={`${cc.code}-${cc.name}`}
                          onClick={() => {
                            setSelectedCountry(cc);
                            setCcOpen(false);
                            setCcSearch("");
                          }}
                        >
                          <img
                            src={getFlagUrl(cc.name)}
                            alt=""
                            width={20}
                            height={14}
                            onError={(e) => (e.currentTarget.src = "https://flagcdn.com/24x18/bd.png")}
                            className="me-2"
                          />
                          <div className="flex-grow-1">{cc.name}</div>
                          <div className="text-muted">+{cc.code}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

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
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control${errors.password ? " is-invalid" : ""}`}
                placeholder="Minimum 8 characters long"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary password-toggle-btn"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                style={{ borderLeft: 0 }}
              >
                <i className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
                placeholder="Minimum 8 characters long"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleConfirmPasswordBlur}
              />
              <button
                type="button"
                className="btn btn-outline-secondary password-toggle-btn"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{ borderLeft: 0 }}
              >
                <i className={`fas ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
              </button>
            </div>
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
      <style scoped>{`
        .input-group .form-control, label {
          font-size: 14px;
        }
        .text-secondary{
          font-size: 14px;
        }
        /* Change input placeholder color */
        input::placeholder {
          color: #adb5bd7e !important;
          opacity: 1;
        }
        .password-toggle-btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          border-color: #ced4da;
        }
        .cc-dropdown .btn-transparent {
          background: transparent;
          border: none;
          color: inherit;
        }
        .cc-dropdown button:hover {
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
