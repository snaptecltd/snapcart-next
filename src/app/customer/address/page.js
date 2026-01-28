"use client";
import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import {
  getCustomerAddressList,
  addCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/api/global.service";
import { toast } from "react-toastify";

const ADDRESS_TYPES = [
  { label: "Permanent", value: "permanent" },
  { label: "Home", value: "home" },
  { label: "Office", value: "office" },
  { label: "Shipping", value: "shipping" },
  { label: "Billing", value: "billing" },
];

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    contact_person_name: "",
    phone: "",
    city: "",
    zip: "",
    country: "Bangladesh",
    address: "",
    address_type: "home",
    latitude: "",
    longitude: "",
    is_billing: false,
  });
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    setLoading(true);
    getCustomerAddressList()
      .then(setAddresses)
      .catch(() => toast.error("Failed to load addresses"))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Simulate picking a location (for demo, set static lat/lng)
  const handlePickLocation = () => {
    setForm((f) => ({
      ...f,
      latitude: "23.8103",
      longitude: "90.4125",
    }));
    toast.info("Location set to Dhaka (demo)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    // Validate required fields
    const required = [
      "contact_person_name",
      "address_type",
      "address",
      "city",
      "zip",
      "country",
      "phone",
    ];
    const newErrors = {};
    required.forEach((key) => {
      if (!form[key]) newErrors[key] = "Required";
    });
    if (!form.latitude) newErrors.latitude = "Required";
    if (!form.longitude) newErrors.longitude = "Required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setAdding(true);
    try {
      await addCustomerAddress({
        ...form,
        is_billing: form.is_billing ? 1 : 0,
      });
      toast.success("Address added!");
      setShowModal(false);
      setForm({
        contact_person_name: "",
        phone: "",
        city: "",
        zip: "",
        country: "Bangladesh",
        address: "",
        address_type: "home",
        latitude: "",
        longitude: "",
        is_billing: false,
      });
      fetchAddresses();
    } catch (err) {
      if (err?.errors) {
        const apiErrors = {};
        err.errors.forEach((e) => {
          apiErrors[e.code] = e.message;
        });
        setErrors(apiErrors);
      } else {
        toast.error("Failed to add address");
      }
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteCustomerAddress(id);
      toast.success("Address deleted!");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={5} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">My Address</h4>
            <button className="btn btn-light border" onClick={() => setShowModal(true)}>
              Add Address
            </button>
          </div>
          <div className="row g-4">
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-5 text-muted">No addresses found.</div>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="col-12 col-md-6 col-lg-6">
                  <div className="bg-white rounded-4 shadow-sm p-4 position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="fw-bold" style={{ fontSize: 18 }}>
                        {a.address_type?.charAt(0).toUpperCase() + a.address_type?.slice(1) || "Address"}
                        <span className="text-muted ms-2" style={{ fontSize: 13 }}>
                          ({a.is_billing ? "Billing address" : "Shipping address"})
                        </span>
                      </div>
                      <div>
                        {/* Edit can be implemented similarly */}
                        {/* <button className="btn btn-link text-primary p-0 me-2"><i className="fas fa-edit"></i></button> */}
                        <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(a.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 15 }}>
                      <div>
                        <span className="fw-semibold">Name</span> : {a.contact_person_name}
                      </div>
                      <div>
                        <span className="fw-semibold">Phone</span> : {a.phone}
                      </div>
                      <div>
                        <span className="fw-semibold">City</span> : {a.city}
                      </div>
                      <div>
                        <span className="fw-semibold">Zip code</span> : {a.zip}
                      </div>
                      <div>
                        <span className="fw-semibold">Address</span> : {a.address}
                      </div>
                      <div>
                        <span className="fw-semibold">Country</span> : {a.country}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Modal: Add Address */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.25)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Add New Address</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3 d-flex gap-2 flex-wrap">
                    {ADDRESS_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t.value}
                        className={`btn ${form.address_type === t.value ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setForm((f) => ({ ...f, address_type: t.value }))}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Contact person name *</label>
                      <input
                        type="text"
                        name="contact_person_name"
                        className={`form-control${errors.contact_person_name ? " is-invalid" : ""}`}
                        value={form.contact_person_name}
                        onChange={handleChange}
                      />
                      {errors.contact_person_name && <div className="invalid-feedback">{errors.contact_person_name}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone *</label>
                      <input
                        type="text"
                        name="phone"
                        className={`form-control${errors.phone ? " is-invalid" : ""}`}
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+8801XXXXXXXXX"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">City *</label>
                      <input
                        type="text"
                        name="city"
                        className={`form-control${errors.city ? " is-invalid" : ""}`}
                        value={form.city}
                        onChange={handleChange}
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Zip code *</label>
                      <input
                        type="text"
                        name="zip"
                        className={`form-control${errors.zip ? " is-invalid" : ""}`}
                        value={form.zip}
                        onChange={handleChange}
                      />
                      {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Country *</label>
                      <input
                        type="text"
                        name="country"
                        className={`form-control${errors.country ? " is-invalid" : ""}`}
                        value={form.country}
                        onChange={handleChange}
                      />
                      {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Address *</label>
                      <input
                        type="text"
                        name="address"
                        className={`form-control${errors.address ? " is-invalid" : ""}`}
                        value={form.address}
                        onChange={handleChange}
                      />
                      {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Latitude *</label>
                      <input
                        type="text"
                        name="latitude"
                        className={`form-control${errors.latitude ? " is-invalid" : ""}`}
                        value={form.latitude}
                        onChange={handleChange}
                      />
                      {errors.latitude && <div className="invalid-feedback">{errors.latitude}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Longitude *</label>
                      <input
                        type="text"
                        name="longitude"
                        className={`form-control${errors.longitude ? " is-invalid" : ""}`}
                        value={form.longitude}
                        onChange={handleChange}
                      />
                      {errors.longitude && <div className="invalid-feedback">{errors.longitude}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Is Billing?</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_billing"
                          checked={form.is_billing}
                          onChange={handleChange}
                          id="is_billing"
                        />
                        <label className="form-check-label" htmlFor="is_billing">
                          Yes, this is a billing address
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Map placeholder */}
                  <div className="mt-4">
                    <div className="mb-2 fw-semibold">Pick location (demo)</div>
                    <button type="button" className="btn btn-outline-primary btn-sm mb-2" onClick={handlePickLocation}>
                      Set to Dhaka (Demo)
                    </button>
                    <div style={{ width: "100%", height: 200, background: "#e5e7eb", borderRadius: 8, position: "relative" }}>
                      <iframe
                        title="Google Map"
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: 8 }}
                        src="https://maps.google.com/maps?q=Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        allowFullScreen
                      ></iframe>
                      {/* Overlay for demo */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                        background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <span className="text-muted">Map demo only</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-dark" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={adding}>
                    {adding ? "Adding..." : "Add information"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .modal.fade.show {
          display: block;
          background: rgba(0,0,0,0.25);
        }
        .modal-dialog {
          max-width: 700px;
        }
      `}</style>
    </div>
  );
}
