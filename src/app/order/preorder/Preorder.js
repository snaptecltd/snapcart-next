"use client";
import { useState, useRef } from "react";
import { submitPreOrder } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function Preorder() {
  const [form, setForm] = useState({
    product_information: "",
    name: "",
    email: "",
    phone_number: "",
    address: "",
    product_image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.product_information) newErrors.product_information = "Product information is required.";
    if (!form.name) newErrors.name = "Name is required.";
    if (!form.email) newErrors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) newErrors.email = "Invalid email.";
    if (!form.phone_number) newErrors.phone_number = "Phone number is required.";
    if (!form.address) newErrors.address = "Address is required.";
    if (!form.product_image) newErrors.product_image = "Product image is required.";
    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, product_image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, product_image: undefined }));
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, product_image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      const formData = new FormData();
      formData.append("product_information", form.product_information);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone_number", form.phone_number);
      formData.append("address", form.address);
      formData.append("product_image", form.product_image);

      await submitPreOrder(formData);
      toast.success("Thank you! One of our agents will contact you soon.");
      setForm({
        product_information: "",
        name: "",
        email: "",
        phone_number: "",
        address: "",
        product_image: null,
      });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      // API returns { errors: { field: [msg] } }
      if (err?.errors) {
        const apiErrors = {};
        Object.entries(err.errors).forEach(([key, val]) => {
          apiErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(apiErrors);
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Submission failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-4" style={{ fontSize: "2.5rem" }}>
        Looking for Somethings Different?
      </h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Product Information <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="product_information"
            className={`form-control${errors.product_information ? " is-invalid" : ""}`}
            value={form.product_information}
            onChange={handleChange}
            placeholder="Enter product information"
          />
          {errors.product_information && <div className="invalid-feedback">{errors.product_information}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Your Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            className={`form-control${errors.name ? " is-invalid" : ""}`}
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="row g-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="phone_number"
              className={`form-control${errors.phone_number ? " is-invalid" : ""}`}
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Enter Phone Number"
            />
            {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Address <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="address"
            className={`form-control${errors.address ? " is-invalid" : ""}`}
            value={form.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Upload Product Image <span className="text-danger">*</span>
          </label>
          <div
            className={`border rounded-3 p-3 d-flex flex-column align-items-center justify-content-center ${errors.product_image ? "border-danger" : "border-secondary"}`}
            style={{ minHeight: 150, background: "#fafafa" }}
          >
            {!imagePreview ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  style={{ maxWidth: 300 }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <div className="text-muted small mt-2">
                  Click here to upload image
                </div>
              </>
            ) : (
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                />
                <div className="fw-semibold mt-2">Image Uploaded</div>
                <div className="text-muted small mb-2">
                  Click here to upload another image
                </div>
                <button
                  type="button"
                  className="btn btn-link text-danger p-0"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {errors.product_image && <div className="text-danger small mt-1">{errors.product_image}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100 fw-semibold mt-3"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
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

        `}</style>
    </div>
  );
}
