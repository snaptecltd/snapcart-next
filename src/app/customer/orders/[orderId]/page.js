"use client";
import { useEffect, useState, useRef } from "react";
import { 
  getCustomerOrderDetails, 
  getProductReviewByProductAndOrder, 
  submitProductReview, 
  updateProductReview 
} from "@/lib/api/global.service";
import Sidebar from "../../partials/Sidebar";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

const statusMap = {
  pending: { label: "Pending", color: "#38bdf8" },
  processing: { label: "Processing", color: "#facc15" },
  delivered: { label: "Delivered", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  returned: { label: "Returned", color: "#f87171" },
  completed: { label: "Completed", color: "#22c55e" },
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getCustomerOrderDetails(orderId)
      .then((data) => setDetails(data && Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [orderId]);

  const order = details && details.length > 0 ? details[0].order : null;

  // Function to handle review button click
  const handleReviewClick = async (product) => {
    setSelectedProduct(product);
    setExistingReview(null);
    setRating(0);
    setComment("");
    setImages([]);
    setPreviewImages([]);
    setDeletedImages([]);
    
    try {
      // Get existing review for this product and order
      const response = await getProductReviewByProductAndOrder(product.product_id, orderId);
      console.log("Review API response:", response);
      
      if (response && response.id) {
        // Review exists
        setExistingReview(response);
        setRating(response.rating || 0);
        setComment(response.comment || "");
        
        // Load existing images if any
        const existingPreviews = [];
        
        // Try attachment_full_url first
        if (response.attachment_full_url && Array.isArray(response.attachment_full_url)) {
          response.attachment_full_url.forEach((img, index) => {
            const attachmentId = response.attachment && response.attachment[index] 
              ? response.attachment[index].id 
              : `existing-attachment-${index}-${Date.now()}`;
            
            existingPreviews.push({
              id: attachmentId,
              url: img.path || img,
              isExisting: true
            });
          });
        } 
        // Fallback to attachment array
        else if (response.attachment && Array.isArray(response.attachment)) {
          response.attachment.forEach((attachment, index) => {
            const attachmentId = attachment.id || `existing-attachment-${index}-${Date.now()}`;
            existingPreviews.push({
              id: attachmentId,
              url: attachment.path || attachment,
              isExisting: true
            });
          });
        }
        
        console.log("Existing previews loaded:", existingPreviews);
        setPreviewImages(existingPreviews);
      } else {
        console.log("No existing review found");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      console.error("Error details:", error.response?.data);
      // No existing review - this is expected for new reviews
    } finally {
      setShowReviewModal(true);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    const newPreviews = [];

    files.forEach((file, index) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      newImages.push(file);
      
      // Create preview with unique key
      const uniqueId = `new-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = {
        id: uniqueId,
        url: URL.createObjectURL(file),
        isExisting: false,
        file: file
      };
      newPreviews.push(preview);
    });

    setImages(prev => [...prev, ...newImages]);
    setPreviewImages(prev => [...prev, ...newPreviews]);
    
    // Clear file input to allow uploading same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    console.log("Removing image with ID:", imageId);
    
    const imageToRemove = previewImages.find(img => img.id === imageId);
    if (!imageToRemove) return;
    
    if (imageToRemove.isExisting) {
      // For existing images, mark for deletion
      setDeletedImages(prev => {
        const newDeleted = [...prev, imageToRemove.id];
        console.log("Deleted images updated:", newDeleted);
        return newDeleted;
      });
    } else {
      // Remove from new images array
      setImages(prev => {
        const newImages = prev.filter(img => img !== imageToRemove.file);
        console.log("New images after removal:", newImages);
        return newImages;
      });
      
      // Revoke the object URL to prevent memory leaks
      if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
    }
    
    // Remove from previews
    setPreviewImages(prev => {
      const newPreviews = prev.filter(img => img.id !== imageId);
      console.log("Previews after removal:", newPreviews);
      return newPreviews;
    });
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setReviewLoading(true);
    try {
      if (existingReview && existingReview.id) {
        // Update existing review
        const reviewData = {
          review_id: existingReview.id, // This will be sent as 'id' in the service
          product_id: selectedProduct.product_id,
          order_id: orderId,
          comment: comment.trim(),
          rating: rating,
          new_images: images,
          deleted_images: deletedImages
        };

        console.log("Attempting to update review with ID:", existingReview.id);
        console.log("Full review data:", reviewData);
        
        const response = await updateProductReview(reviewData);
        console.log("Update response:", response);
        toast.success("Review updated successfully!");
      } else {
        // Submit new review
        const reviewData = {
          product_id: selectedProduct.product_id,
          order_id: orderId,
          comment: comment.trim(),
          rating: rating,
          images: images
        };

        console.log("Submitting new review with data:", reviewData);
        const response = await submitProductReview(reviewData);
        console.log("Submit response:", response);
        toast.success("Review submitted successfully!");
      }

      // Refresh the order details to update the review status
      const updatedDetails = await getCustomerOrderDetails(orderId);
      setDetails(updatedDetails && Array.isArray(updatedDetails) ? updatedDetails : []);
      
      // Close modal and reset state
      handleCloseModal();
      
    } catch (error) {
      console.error("Error submitting review:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 404) {
        toast.error("Review not found. It may have been deleted. Please submit as a new review.");
        setExistingReview(null); // Switch to new review mode
      } else if (error.response?.data?.message?.includes("Attempt to assign property")) {
        toast.error("Review not found. Please submit as a new review.");
        setExistingReview(null); // Switch to new review mode
      } else if (error.response?.data?.errors) {
        // Show validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages[0] || "Validation error");
      } else {
        toast.error(error.response?.data?.message || "Failed to submit review");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseModal = () => {
    // Clean up object URLs to prevent memory leaks
    previewImages.forEach(img => {
      if (!img.isExisting && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    
    setShowReviewModal(false);
    setSelectedProduct(null);
    setExistingReview(null);
    setRating(0);
    setComment("");
    setImages([]);
    setPreviewImages([]);
    setDeletedImages([]);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={`star-${i}-${Date.now()}`}
          type="button"
          onClick={() => setRating(i)}
          className="btn btn-link p-0 border-0"
          style={{ fontSize: "2rem" }}
          disabled={reviewLoading}
        >
          <i className={`fas fa-star ${i <= rating ? "text-warning" : "text-secondary"}`}></i>
        </button>
      );
    }
    return stars;
  };

  const getRatingLabel = (rating) => {
    switch(rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select Rating";
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={1} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">
                Order #{orderId}{" "}
                {order && (
                  <span
                    className="badge ms-2"
                    style={{
                      background: statusMap[order.order_status]?.color || "#e5e7eb",
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    {statusMap[order.order_status]?.label || order.order_status}
                  </span>
                )}
              </h4>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : !details || details.length === 0 ? (
              <div className="text-center py-4">No details found.</div>
            ) : (
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 mb-2">
                      <div className="fw-semibold mb-1">Shipping Address</div>
                      <div>
                        <div>{order?.shipping_address_data?.contact_person_name}</div>
                        <div>{order?.shipping_address_data?.phone}</div>
                        <div>
                          {order?.shipping_address_data?.address}, {order?.shipping_address_data?.city},{" "}
                          {order?.shipping_address_data?.zip}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 mb-2">
                      <div className="fw-semibold mb-1">Billing Address</div>
                      <div>
                        <div>{order?.billing_address_data?.contact_person_name || "-"}</div>
                        <div>{order?.billing_address_data?.phone || "-"}</div>
                        <div>
                          {order?.billing_address_data?.address || "-"}
                          {order?.billing_address_data?.city ? `, ${order?.billing_address_data?.city}` : ""}
                          {order?.billing_address_data?.zip ? `, ${order?.billing_address_data?.zip}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="table-responsive mb-3">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Name</th>
                        <th>Variant</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                        <th>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((item, idx) => (
                        <tr key={`product-${item.id || idx}-${Date.now()}`}>
                          <td>
                            <img
                              src={item.product_details?.thumbnail_full_url?.path || "/placeholder.png"}
                              alt={item.product_details?.name}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 8,
                                background: "#f8f9fa",
                              }}
                            />
                          </td>
                          <td>
                            <div className="fw-semibold">{item.product_details?.name}</div>
                            <div className="text-muted small">{item.product_details?.code}</div>
                          </td>
                          <td>{item.variant || "-"}</td>
                          <td>{item.qty}</td>
                          <td>{moneyBDT(item.price)}</td>
                          <td>{item.discount ? moneyBDT(item.discount) : "-"}</td>
                          <td>{moneyBDT((item.price - (item.discount || 0)) * item.qty)}</td>
                          <td>
                            {order?.order_status === "delivered" ? (
                              item.reviewData ? (
                                <div className="d-flex align-items-center">
                                  <div className="text-success small">
                                    <i className="fas fa-check-circle me-1"></i> Reviewed
                                  </div>
                                  <button
                                    onClick={() => handleReviewClick(item)}
                                    className="btn btn-sm btn-link text-decoration-none p-0 ms-2"
                                    title="Edit Review"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleReviewClick(item)}
                                  className="btn btn-sm btn-outline-primary"
                                  style={{ minWidth: "80px" }}
                                >
                                  <i className="fas fa-star me-1"></i> Review
                                </button>
                              )
                            ) : (
                              <div className="text-muted small">
                                Review after delivery
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 mb-2">
                      <div className="fw-semibold mb-1">Payment Info</div>
                      <div>
                        Payment Status: <span className="fw-bold">{order?.payment_status}</span>
                      </div>
                      <div>
                        Payment Method:{" "}
                        <span className="fw-bold">
                          {order?.payment_method?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 mb-2">
                      <div className="fw-semibold mb-1">Order Summary</div>
                      <div>
                        Total Item: {details.reduce((sum, i) => sum + (i.qty || 0), 0)}
                      </div>
                      <div>
                        Subtotal: {moneyBDT(details.reduce((sum, i) => sum + i.price * i.qty, 0))}
                      </div>
                      <div>
                        Discount: {moneyBDT(details.reduce((sum, i) => sum + (i.discount || 0), 0))}
                      </div>
                      <div>
                        Shipping Fee: {moneyBDT(order?.shipping_cost || 0)}
                      </div>
                      <div className="fw-bold mt-2">
                        Total: {moneyBDT(order?.order_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {existingReview ? "Update Review" : "Submit A Review"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={reviewLoading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Product Info */}
                <div className="mb-4">
                  <h6 className="fw-bold">{selectedProduct.product_details?.name}</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <small className="text-muted">Qty: {selectedProduct.qty}</small>
                    </div>
                    <div className="col-md-8">
                      <small className="text-muted">Price: {moneyBDT(selectedProduct.price)}</small>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Rate The Quality</label>
                  <div className="d-flex align-items-center mb-2">
                    <div className="d-flex">
                      {renderStars()}
                    </div>
                    <span className="ms-3 fw-semibold">{getRatingLabel(rating)}</span>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Have thoughts to share?</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={reviewLoading}
                  ></textarea>
                </div>

                {/* Upload Images */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Upload Images</label>
                  <div className="border rounded p-3 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="d-none"
                      disabled={reviewLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => fileInputRef.current.click()}
                      disabled={reviewLoading}
                    >
                      <i className="fas fa-cloud-upload-alt me-2"></i>
                      Choose Files
                    </button>
                    <p className="small text-muted mt-2 mb-0">
                      Upload product images (Max 5MB each)
                    </p>
                  </div>

                  {/* Image Previews */}
                  {previewImages.length > 0 && (
                    <div className="mt-3">
                      <div className="row g-2">
                        {previewImages.map((img) => (
                          <div key={`preview-${img.id || `img-${Date.now()}-${Math.random()}`}`} className="col-3">
                            <div className="position-relative">
                              <img
                                src={img.url}
                                alt="Preview"
                                className="img-fluid rounded border"
                                style={{ height: "80px", objectFit: "cover", width: "100%" }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                style={{ 
                                  transform: "translate(30%, -30%)",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 0
                                }}
                                onClick={() => removeImage(img.id)}
                                disabled={reviewLoading}
                              >
                                <i className="fas fa-times" style={{ fontSize: "12px" }}></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={reviewLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {existingReview ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    existingReview ? "Update Review" : "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}