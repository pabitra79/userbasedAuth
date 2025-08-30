// Mobile toggle functionality
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("show");
}

// Improved delete function
function deleteProduct(productId, productName) {
  if (
    confirm(
      `Are you sure you want to delete "${productName || "this product"}"?`
    )
  ) {
    // Show loading state
    const button = event.target.closest("button");
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    button.disabled = true;

    fetch(`/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", // Request JSON response
      },
    })
      .then((response) => {
        console.log("Response status:", response.status);
        console.log("Response type:", response.headers.get("content-type"));

        // Handle successful deletion (200) or redirect (302/301)
        if (response.ok || response.status === 302 || response.status === 301) {
          console.log("Delete successful");

          // Remove the product card with animation
          const productCard = button.closest(".col-md-6, .col-lg-4, .col-xl-3");
          if (productCard) {
            productCard.style.transition = "opacity 0.3s ease";
            productCard.style.opacity = "0.5";
            setTimeout(() => {
              productCard.remove();

              // Check if no products left
              const remainingProducts =
                document.querySelectorAll(".product-card");
              if (remainingProducts.length === 0) {
                location.reload(); // Reload to show "no products" message
              }
            }, 300);
          }

          showAlert("success", "Product deleted successfully!");
          return;
        }

        // Try to parse JSON error response
        return response
          .json()
          .then((data) => {
            throw new Error(data.message || "Failed to delete product");
          })
          .catch(() => {
            throw new Error("Failed to delete product");
          });
      })
      .catch((error) => {
        console.error("Delete error:", error);

        // Restore button state
        button.innerHTML = originalHTML;
        button.disabled = false;

        showAlert("error", "Failed to delete product: " + error.message);
      });
  }
}

// Alert function
function showAlert(type, message) {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".alert");
  existingAlerts.forEach((alert) => alert.remove());

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${
    type === "success" ? "success" : "danger"
  } alert-dismissible fade show`;
  alertDiv.innerHTML = `
    <i class="fas fa-${
      type === "success" ? "check-circle" : "exclamation-circle"
    } me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  const container = document.querySelector(".container.main-content");
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Image preview function
function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("imagePreview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
  }
}
