"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { submitContactUsForm } from "@/lib/api/global.service";
import SectionTitle from "@/components/html/SectionTitle";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_number: "",
    subject: "",
    message: "",
    recaptcha: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef();
  const recaptchaWidgetId = useRef(null);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  // Validate fields
  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.mobile_number) newErrors.mobile_number = "Mobile Number is required";
    if (!form.subject) newErrors.subject = "Subject is required";
    if (!form.message) newErrors.message = "Message is required";
    if (!form.recaptcha) newErrors.recaptcha = "Please verify you are not a robot";
    return newErrors;
  };

  // Handle reCAPTCHA
  const handleRecaptcha = (token) => {
    setForm((prev) => ({ ...prev, recaptcha: token }));
    setErrors((prev) => ({ ...prev, recaptcha: undefined }));
  };

  // Load and render reCAPTCHA v2
  useEffect(() => {
    const RECAPTCHA_SITE_KEY = "6Ld2vVksAAAAAGAJkkCRglydbT2VEtBpAayJ9c0_"; // <-- Replace with your site key

    // Only load once
    if (typeof window === "undefined" || window.recaptchaLoaded) return;

    window.recaptchaLoaded = true;

    const renderRecaptcha = () => {
      if (
        window.grecaptcha &&
        recaptchaRef.current &&
        recaptchaWidgetId.current === null
      ) {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleRecaptcha,
        });
      }
    };

    // If grecaptcha is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      renderRecaptcha();
    } else {
      // Load script and render after loaded
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit";
      script.async = true;
      script.defer = true;
      window.onRecaptchaLoadCallback = renderRecaptcha;
      document.body.appendChild(script);
    }

    // Cleanup
    return () => {
      window.onRecaptchaLoadCallback = undefined;
    };
    // eslint-disable-next-line
  }, []);

  // Reset reCAPTCHA after successful submit
  const resetRecaptcha = () => {
    if (
      typeof window !== "undefined" &&
      window.grecaptcha &&
      recaptchaWidgetId.current !== null
    ) {
      window.grecaptcha.reset(recaptchaWidgetId.current);
      setForm((prev) => ({ ...prev, recaptcha: "" }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await submitContactUsForm({
        name: form.name,
        email: form.email,
        mobile_number: form.mobile_number,
        subject: form.subject,
        message: form.message,
        recaptcha: form.recaptcha,
      });
      setSuccess("Your message has been sent successfully!");
      setForm({
        name: "",
        email: "",
        mobile_number: "",
        subject: "",
        message: "",
        recaptcha: "",
      });
      resetRecaptcha();
    } catch (err) {
      // API returns { errors: [{ code, message }, ...] }
      if (err?.errors) {
        const apiErrors = {};
        err.errors.forEach((e) => {
          apiErrors[e.code] = e.message;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row align-items-center g-5">
        {/* Left: Form */}
        <div className="col-12 col-md-6">
          <div className="bg-white p-4 p-md-5 rounded shadow-sm">
            <SectionTitle
              first="Contact"
              highlight=" Us"
            />
            {success && <div className="alert alert-success">{success}</div>}
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <label className="form-label fw-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-control${errors.name ? " is-invalid" : ""}`}
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control${errors.email ? " is-invalid" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Mobile Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  className={`form-control${errors.mobile_number ? " is-invalid" : ""}`}
                  value={form.mobile_number}
                  onChange={handleChange}
                />
                {errors.mobile_number && <div className="invalid-feedback">{errors.mobile_number}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className={`form-control${errors.subject ? " is-invalid" : ""}`}
                  value={form.subject}
                  onChange={handleChange}
                />
                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  className={`form-control${errors.message ? " is-invalid" : ""}`}
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
              <div className="mb-3">
                {/* Add a fixed height and relative position to prevent layout shift */}
                <div
                  ref={recaptchaRef}
                  className="g-recaptcha"
                  style={{ minHeight: 78, position: "relative" }}
                />
                {errors.recaptcha && (
                  <div className="text-danger small mt-1">{errors.recaptcha}</div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
        {/* Right: Image */}
        <div className="col-12 col-md-6 text-center">
          <Image
            src="/images/contact-us.png"
            alt="Contact Us"
            width={400}
            height={400}
            className="img-fluid"
            priority
          />
        </div>
      </div>
    </div>
  );
}
