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
    product_image: [], // now an array
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]); // array of previews
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
    if (!form.product_image || form.product_image.length === 0) newErrors.product_image = "At least one product image is required.";
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

  // Allowed image types
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];

  // Handle image upload (multiple)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];
    let error = "";
    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        error = "Only JPG, JPEG, PNG, GIF, WEBP images are allowed.";
      } else {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }
    });
    if (error) {
      setErrors((prev) => ({
        ...prev,
        product_image: error,
      }));
      setForm((prev) => ({ ...prev, product_image: [] }));
      setImagePreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setForm((prev) => ({ ...prev, product_image: validFiles }));
    setImagePreview(previews);
    setErrors((prev) => ({ ...prev, product_image: undefined }));
  };

  // Remove single image
  const handleRemoveImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      product_image: prev.product_image.filter((_, i) => i !== idx),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== idx));
    // Reset input if all removed
    if (fileInputRef.current && form.product_image.length === 1) fileInputRef.current.value = "";
  };

  // Remove all images
  const handleRemoveAllImages = () => {
    setForm((prev) => ({ ...prev, product_image: [] }));
    setImagePreview([]);
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
      // Append all images
      form.product_image.forEach((img) => {
        if (img instanceof File) formData.append("product_image[]", img);
      });

      await submitPreOrder(formData);
      toast.success("Thank you! One of our agents will contact you soon.");
      setForm({
        product_information: "",
        name: "",
        email: "",
        phone_number: "",
        address: "",
        product_image: [],
      });
      setImagePreview([]);
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
            {imagePreview.length === 0 ? (
              <>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  className="form-control"
                  style={{ maxWidth: 300 }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                />
                <div className="text-muted small mt-2">
                  Click here to upload image(s)
                </div>
              </>
            ) : (
              <div className="text-center w-100">
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-2">
                  {imagePreview.map((src, idx) => (
                    <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                      />
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0"
                        style={{ position: "absolute", top: 2, right: 2, fontSize: 16 }}
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="fw-semibold mt-2">Image(s) Uploaded</div>
                <div className="text-muted small mb-2">
                  Click below to upload more or remove all
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  className="form-control mt-2"
                  style={{ maxWidth: 300 }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                />
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 mt-2"
                  onClick={handleRemoveAllImages}
                >
                  Remove All
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
