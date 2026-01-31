"use client";

import Swal from "sweetalert2";

export const confirmAlert = (options = {}) => {
  return Swal.fire({
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    ...options,
  });
};
