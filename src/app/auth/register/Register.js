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
    country_code: "",
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

  // Prefer a mapping from telephone country code -> ISO2 (used by flagcdn)
  const telephoneToIso = {
    "1": "us", "7": "ru", "20": "eg", "27": "za", "30": "gr", "31": "nl",
    "32": "be", "33": "fr", "34": "es", "36": "hu", "39": "it", "40": "ro",
    "44": "gb", "49": "de", "52": "mx", "54": "ar", "55": "br", "61": "au",
    "62": "id", "63": "ph", "64": "nz", "65": "sg", "66": "th", "81": "jp",
    "82": "kr", "84": "vn", "86": "cn", "91": "in", "92": "pk", "93": "af",
    "94": "lk", "95": "mm", "98": "ir", "213": "dz", "376": "ad", "880": "bd",
    "971": "ae"
  };
  // small name token fallback for very common tokens
  const nameTokenIso = { uk: "gb", usa: "us", bangladesh: "bd" };
  // transparent placeholder to avoid repeated fallback to a specific country flag
  const placeholderFlag = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  
  function getFlagUrlByCode(code) {
    
    if (code) return `https://flagsapi.com/${code}/flat/24.png`;
    // Last resort: transparent placeholder
    return placeholderFlag;
  }

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

  // Deduplicate by code+name, sort by name, then filter by search
  const filteredCountryCodes = (() => {
    const list = Array.isArray(countryCodes) ? countryCodes : [];
    const map = new Map();
    list.forEach((c) => {
      const key = `${c.code}-${c.name}`;
      if (!map.has(key)) map.set(key, c);
    });
    const uniq = Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const s = (ccSearch || "").trim().toLowerCase();
    if (!s) return uniq;
    return uniq.filter(
      (c) => c.name.toLowerCase().includes(s) || c.code.toString().includes(s)
    );
  })();

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
      country_code: '+' + (selectedCountry?.code || "880"),
      password: form.password,
    });
    toast.success("Registration successful! Please sign in.");
    router.push("/auth/login");
  } catch (err) {
    // Check for different possible error structures
    let apiErrors = {};
    
    // Case 1: Direct errors array in err (your current check)
    if (err?.errors && Array.isArray(err.errors)) {
      err.errors.forEach((e) => {
        apiErrors[e.code === "password_confirmation" ? "confirmPassword" : e.code] = e.message;
      });
    } 
    // Case 2: Response data with errors property (from your console)
    else if (err?.response?.data?.errors) {
      err.response.data.errors.forEach((e) => {
        apiErrors[e.code === "password_confirmation" ? "confirmPassword" : e.code] = e.message;
      });
    }
    // Case 3: Plain errors property
    else if (err?.data?.errors) {
      err.data.errors.forEach((e) => {
        apiErrors[e.code === "password_confirmation" ? "confirmPassword" : e.code] = e.message;
      });
    }
    
    // If we found API errors
    if (Object.keys(apiErrors).length > 0) {
      setErrors(apiErrors);
      // Show the first error message as toast
      const firstErrorKey = Object.keys(apiErrors)[0];
      toast.error(apiErrors[firstErrorKey]);
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
                  src={getFlagUrlByCode(selectedCountry?.country_code)}
                  alt="flag"
                  width={24}
                  height={18}
                  onError={(e) => (e.currentTarget.src = placeholderFlag)}
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
                    width: "min(420px, calc(100vw - 32px))",
                    marginTop: 8,
                    padding: 8,
                  }}
                >
                  <div className="d-flex align-items-center mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search country or code"
                      value={ccSearch}
                      onChange={(e) => setCcSearch(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-light ms-2"
                      onClick={() => setCcSearch("")}
                      title="Clear"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="small text-muted mb-2">Showing {filteredCountryCodes.length} items</div>
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
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
                            src={getFlagUrlByCode(cc.country_code)}
                            alt=""
                            width={20}
                            height={14}
                            onError={(e) => (e.currentTarget.src = placeholderFlag)}
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
            {form.password && form.password.length < 8 && (
              <div className="text-danger small">Password must be at least 8 characters long.</div>
            )}
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
        .cc-dropdown .form-control-sm {
          width: calc(100% - 70px);
        }
      `}</style>
    </div>
  );
}
