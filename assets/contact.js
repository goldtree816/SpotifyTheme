class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.submitBtn = this.form?.querySelector('.contact__submit');
    this.submitText = this.form?.querySelector('.contact__submit-text');
    this.submitLoading = this.form?.querySelector('.contact__submit-loading');
    
    this.init();
  }

  init() {
    if (this.form) {
      this.initFormValidation();
      this.initFormSubmission();
    }
  }

  initFormValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    this.clearFieldError(field);
    
    if (required && !value) {
      this.showFieldError(field, 'This field is required');
      return false;
    }
    
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }
    
    if (type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        this.showFieldError(field, 'Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const error = document.createElement('div');
    error.className = 'contact__field-error';
    error.textContent = message;
    error.style.cssText = `
      color: #e74c3c;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(231, 76, 60, 0.1);
      border-radius: 8px;
      border-left: 3px solid #e74c3c;
    `;
    
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    
    field.parentNode.appendChild(error);
  }

  clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const error = field.parentNode.querySelector('.contact__field-error');
    if (error) {
      error.remove();
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  initFormSubmission() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!this.validateForm()) {
        this.showMessage('Please fix the errors above', 'error');
        return;
      }
      
      await this.submitForm();
    });
  }

  async submitForm() {
    this.setLoadingState(true);
    
    try {
      const formData = new FormData(this.form);
      
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showSuccessMessage();
        this.form.reset();
        this.clearAllErrors();
      } else {
        this.showMessage('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      this.showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.disabled = true;
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.disabled = false;
    }
  }

  showSuccessMessage() {
    const existingSuccess = this.form.querySelector('.contact__success');
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    const success = document.createElement('div');
    success.className = 'contact__success';
    success.innerHTML = `
      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.5rem;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Thank you! Your message has been sent successfully. We'll get back to you soon.
    `;
    
    this.form.insertBefore(success, this.form.firstChild);
    this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      if (success.parentNode) {
        success.remove();
      }
    }, 5000);
  }

  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `contact__message contact__message--${type}`;
    messageEl.textContent = message;
    
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      ${type === 'success' ? 'background: #27ae60;' : ''}
      ${type === 'error' ? 'background: #e74c3c;' : ''}
      ${type === 'info' ? 'background: #3498db;' : ''}
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          document.body.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }

  clearAllErrors() {
    const errors = this.form.querySelectorAll('.contact__field-error');
    errors.forEach(error => error.remove());
    
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ContactForm();
}); 