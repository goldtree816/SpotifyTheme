// Product Reviews JavaScript
document.addEventListener('DOMContentLoaded', function() {
  initializeReviews();
});

function initializeReviews() {
  // Initialize star rating system
  initializeStarRating();
  
  // Initialize image upload preview
  initializeImageUpload();
  
  // Initialize form submission
  initializeFormSubmission();
  
  // Initialize helpful buttons
  initializeHelpfulButtons();
}

// Star Rating System
function initializeStarRating() {
  const starInputs = document.querySelectorAll('.star-input');
  
  starInputs.forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      setRating(rating);
    });
    
    star.addEventListener('mouseenter', () => {
      highlightStars(index + 1);
    });
    
    star.addEventListener('mouseleave', () => {
      resetStarHighlight();
    });
  });
}

function setRating(rating) {
  const starInputs = document.querySelectorAll('.star-input');
  const selectedRating = document.querySelector('.selected-rating');
  
  starInputs.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('filled');
      star.classList.remove('active');
    } else {
      star.classList.remove('filled', 'active');
    }
  });
  
  // Store the selected rating
  if (selectedRating) {
    selectedRating.value = rating;
  } else {
    // Create hidden input if it doesn't exist
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'rating';
    hiddenInput.value = rating;
    hiddenInput.className = 'selected-rating';
    document.getElementById('reviewForm').appendChild(hiddenInput);
  }
}

function highlightStars(rating) {
  const starInputs = document.querySelectorAll('.star-input');
  
  starInputs.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function resetStarHighlight() {
  const starInputs = document.querySelectorAll('.star-input');
  starInputs.forEach(star => {
    star.classList.remove('active');
  });
}

// Modal Functions
function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Focus on first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input, textarea');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Reset form
  resetReviewForm();
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('reviewModal');
  if (event.target === modal) {
    closeReviewModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeReviewModal();
  }
});

// Image Upload Preview
function initializeImageUpload() {
  const fileInput = document.getElementById('reviewImages');
  const imagePreview = document.getElementById('imagePreview');
  
  if (fileInput && imagePreview) {
    fileInput.addEventListener('change', function(event) {
      const files = event.target.files;
      imagePreview.innerHTML = '';
      
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `Review image ${index + 1}`;
            img.style.cursor = 'pointer';
            
            // Add remove functionality
            img.addEventListener('click', () => removeImage(index));
            
            imagePreview.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
}

function removeImage(index) {
  const fileInput = document.getElementById('reviewImages');
  const imagePreview = document.getElementById('imagePreview');
  
  // Remove from preview
  const images = imagePreview.querySelectorAll('img');
  if (images[index]) {
    images[index].remove();
  }
  
  // Remove from file input (this is a simplified version)
  // In a real implementation, you'd need to handle the FileList properly
  fileInput.value = '';
}

// Form Submission
function initializeFormSubmission() {
  const form = document.getElementById('reviewForm');
  
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      submitReview();
    });
  }
}

function submitReview() {
  const form = document.getElementById('reviewForm');
  const formData = new FormData(form);
  
  // Get rating from hidden input or star display
  const ratingInput = form.querySelector('.selected-rating');
  const rating = ratingInput ? ratingInput.value : getSelectedRating();
  
  if (!rating || rating < 1) {
    showNotification('Please select a rating', 'error');
    return;
  }
  
  // Validate required fields
  const title = formData.get('title');
  const content = formData.get('content');
  
  if (!title || !content) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  // Simulate API call (replace with actual API endpoint)
  setTimeout(() => {
    // Add the review to the page
    addReviewToPage({
      rating: parseInt(rating),
      title: title,
      content: content,
      reviewer: 'You',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });
    
    // Reset form and close modal
    resetReviewForm();
    closeReviewModal();
    
    // Show success message
    showNotification('Review submitted successfully!', 'success');
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1500);
}

function getSelectedRating() {
  const filledStars = document.querySelectorAll('.star-input.filled');
  return filledStars.length;
}

 function addReviewToPage(review) {
   const reviewsList = document.getElementById('reviews-list');
   const noReviewsMessage = document.getElementById('no-reviews-message');
   
   // Remove "no reviews" message if it exists
   if (noReviewsMessage) {
     noReviewsMessage.remove();
   }
   
   const reviewHTML = `
     <div class="review-item" data-rating="${review.rating}" data-date="${new Date().toISOString().split('T')[0]}">
       <div class="review-header">
         <div class="reviewer-info">
           <div class="reviewer-avatar">
             <i class="fas fa-user"></i>
           </div>
           <div class="reviewer-details">
             <h4 class="reviewer-name">${review.reviewer}</h4>
             <div class="review-rating">
               ${generateStars(review.rating)}
             </div>
           </div>
         </div>
         <div class="review-date">${review.date}</div>
       </div>
       <h5 class="review-title">${review.title}</h5>
       <p class="review-content">${review.content}</p>
       <div class="review-helpful">
         <button class="helpful-btn" onclick="markHelpful(this)">
           <i class="fas fa-thumbs-up"></i>
           Helpful (0)
         </button>
       </div>
     </div>
   `;
   
   // Add to the beginning of the list
   reviewsList.insertAdjacentHTML('afterbegin', reviewHTML);
   
   // Show pagination section
   const paginationSection = document.getElementById('reviews-pagination');
   if (paginationSection) {
     paginationSection.style.display = 'block';
   }
   
   // Update review count
   updateReviewCount();
 }

function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star star filled"></i>';
    } else {
      stars += '<i class="far fa-star star"></i>';
    }
  }
  return stars;
}

 function updateReviewCount() {
   const totalReviews = document.querySelector('.total-reviews');
   if (totalReviews) {
     const currentCount = parseInt(totalReviews.textContent.match(/\d+/)[0]);
     totalReviews.textContent = `${currentCount + 1} reviews`;
   }
 }

 // Filtering and Sorting
 function filterReviews(rating) {
   const reviews = document.querySelectorAll('.review-item');
   const noReviewsMessage = document.getElementById('no-reviews-message');
   
   if (reviews.length === 0) {
     // No reviews to filter
     return;
   }
   
   reviews.forEach(review => {
     const reviewRating = parseInt(review.dataset.rating);
     
     if (rating === 'all' || reviewRating === parseInt(rating)) {
       review.style.display = 'block';
     } else {
       review.style.display = 'none';
     }
   });
 }

 function sortReviews(sortBy) {
   const reviewsList = document.getElementById('reviews-list');
   const reviews = Array.from(reviewsList.querySelectorAll('.review-item'));
   
   if (reviews.length === 0) {
     // No reviews to sort
     return;
   }
   
   reviews.sort((a, b) => {
     const ratingA = parseInt(a.dataset.rating);
     const ratingB = parseInt(b.dataset.rating);
     const dateA = new Date(a.dataset.date);
     const dateB = new Date(b.dataset.date);
     
     switch (sortBy) {
       case 'newest':
         return dateB - dateA;
       case 'oldest':
         return dateA - dateB;
       case 'highest':
         return ratingB - ratingA;
       case 'lowest':
         return ratingA - ratingB;
       default:
         return 0;
     }
   });
   
   // Re-append sorted reviews
   reviews.forEach(review => {
     reviewsList.appendChild(review);
   });
 }

// Helpful Button Functionality
function initializeHelpfulButtons() {
  const helpfulBtns = document.querySelectorAll('.helpful-btn');
  
  helpfulBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      markHelpful(this);
    });
  });
}

function markHelpful(button) {
  if (button.classList.contains('active')) {
    return; // Already marked as helpful
  }
  
  const text = button.textContent;
  const currentCount = parseInt(text.match(/\d+/)[0]);
  const newCount = currentCount + 1;
  
  button.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${newCount})`;
  button.classList.add('active');
  
  // Add animation
  button.style.transform = 'scale(1.1)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 200);
}

 // Load More Reviews
 function loadMoreReviews() {
   const paginationBtn = document.querySelector('.pagination-btn');
   paginationBtn.textContent = 'Loading...';
   paginationBtn.disabled = true;
   
   // In a real implementation, this would fetch more reviews from your backend API
   // For now, we'll show a message that no more reviews are available
   setTimeout(() => {
     paginationBtn.textContent = 'No More Reviews';
     paginationBtn.disabled = true;
     paginationBtn.style.opacity = '0.6';
     
     showNotification('No more reviews available', 'info');
   }, 1000);
 }

// Utility Functions
function resetReviewForm() {
  const form = document.getElementById('reviewForm');
  if (form) {
    form.reset();
    
    // Reset stars
    const starInputs = document.querySelectorAll('.star-input');
    starInputs.forEach(star => {
      star.classList.remove('filled', 'active');
    });
    
    // Reset image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
      imagePreview.innerHTML = '';
    }
    
    // Remove hidden rating input
    const hiddenRating = form.querySelector('.selected-rating');
    if (hiddenRating) {
      hiddenRating.remove();
    }
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 600;
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'success':
      notification.style.background = '#28a745';
      break;
    case 'error':
      notification.style.background = '#dc3545';
      break;
    default:
      notification.style.background = '#17a2b8';
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Export functions for global access
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.filterReviews = filterReviews;
window.sortReviews = sortReviews;
window.markHelpful = markHelpful;
window.loadMoreReviews = loadMoreReviews; 