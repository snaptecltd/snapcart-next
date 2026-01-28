"use client";
import { useEffect, useState, useRef } from "react";
import Sidebar from "./partials/Sidebar";
import { getCustomerInfo, updateCustomerProfile } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function CustomerProfilePage() {
  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    image: null,
  });
  const [imgPreview, setImgPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  useEffect(() => {
    getCustomerInfo()
      .then((data) => {
        setForm({
          f_name: data.f_name || "",
          l_name: data.l_name || "",
          phone: data.phone || "",
          email: data.email || "",
          password: "",
          confirm_password: "",
          image: null,
        });
        setImgPreview(data.image_full_url?.path || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm((f) => ({ ...f, image: files[0] }));
      setImgPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    // Validation
    const newErrors = {};
    if (!form.f_name) newErrors.f_name = "First name is required";
    if (!form.l_name) newErrors.l_name = "Last name is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.email) newErrors.email = "Email is required";
    if (form.password && form.password.length < 8)
      newErrors.password = "Minimum 8 characters long";
    if (form.password !== form.confirm_password)
      newErrors.confirm_password = "Passwords do not match";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setUpdating(true);
    try {
      const payload = {
        f_name: form.f_name,
        l_name: form.l_name,
        phone: form.phone,
        email: form.email,
        password: form.password || undefined,
        image: form.image,
      };
      const res = await updateCustomerProfile(payload);
      toast.success(res?.message || "Profile updated!");
      setForm((f) => ({ ...f, password: "", confirm_password: "" }));
    } catch (err) {
      if (err?.errors) {
        const apiErrors = {};
        err.errors.forEach((e) => {
          apiErrors[e.code] = e.message;
        });
        setErrors(apiErrors);
      } else {
        toast.error("Failed to update profile");
      }
    }
    setUpdating(false);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={0} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <div className="d-flex flex-column align-items-center mb-4">
              <div className="position-relative mb-2">
                <img
                  src={imgPreview || "/user-placeholder.png"}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: 110, height: 110, objectFit: "cover", background: "#f3f3f3" }}
                />
                <button
                  type="button"
                  className="btn btn-primary position-absolute"
                  style={{ bottom: 0, right: 0, borderRadius: "50%", padding: 8 }}
                  onClick={() => fileInputRef.current?.click()}
                  tabIndex={-1}
                >
                  <i className="fas fa-camera"></i>
                </button>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleChange}
                />
              </div>
              <h5 className="fw-bold mb-0">
                {form.f_name} {form.l_name}
              </h5>
            </div>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name</label>
                <input
                  type="text"
                  name="f_name"
                  className={`form-control${errors.f_name ? " is-invalid" : ""}`}
                  value={form.f_name}
                  onChange={handleChange}
                />
                {errors.f_name && <div className="invalid-feedback">{errors.f_name}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>
                <input
                  type="text"
                  name="l_name"
                  className={`form-control${errors.l_name ? " is-invalid" : ""}`}
                  value={form.l_name}
                  onChange={handleChange}
                />
                {errors.l_name && <div className="invalid-feedback">{errors.l_name}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className={`form-control${errors.phone ? " is-invalid" : ""}`}
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control${errors.email ? " is-invalid" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control${errors.password ? " is-invalid" : ""}`}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters long"
                  autoComplete="new-password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  className={`form-control${errors.confirm_password ? " is-invalid" : ""}`}
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters long"
                  autoComplete="new-password"
                />
                {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary px-4" disabled={updating}>
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        .sticky-top {
          position: sticky !important;
          top: 24px;
        }
      `}</style>
    </div>
  );
}
