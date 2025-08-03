class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.submitBtn = this.form?.querySelector('.contact__submit');
    this.submitText = this.form?.querySelector('.contact__submit-text');
    this.submitLoading = this.form?.querySelector('.contact__submit-loading');
    this.charCount = document.getElementById('char-count');
    this.messageTextarea = document.getElementById('contact_message');
    this.countrySelect = document.getElementById('contact_country_code');
    this.helpBtn = document.querySelector('.contact__help-btn');
    
    this.init();
  }

  init() {
    if (this.form) {
      this.initFormValidation();
      // this.initFormSubmission(); // Disable AJAX submission for native Shopify handling
      this.initCharacterCount();
      this.initCountrySelect();
      this.initHelpButton();
    }
  }

  initCharacterCount() {
    if (this.messageTextarea && this.charCount) {
      this.updateCharacterCount();
      
      this.messageTextarea.addEventListener('input', () => {
        this.updateCharacterCount();
      });
    }
  }

  updateCharacterCount() {
    const currentLength = this.messageTextarea.value.length;
    const maxLength = this.messageTextarea.maxLength;
    
    this.charCount.textContent = currentLength;
    
    // Change color when approaching limit
    if (currentLength > maxLength * 0.9) {
      this.charCount.style.color = '#EF4444';
    } else if (currentLength > maxLength * 0.7) {
      this.charCount.style.color = '#F59E0B';
    } else {
      this.charCount.style.color = '#6B7280';
    }
  }

  initCountrySelect() {
    if (this.countrySelect) {
      this.countrySelect.addEventListener('change', () => {
        this.updatePhonePlaceholder();
      });
      
      // Set initial placeholder
      this.updatePhonePlaceholder();
    }
  }

  updatePhonePlaceholder() {
    const phoneInput = document.getElementById('contact_phone');
    if (phoneInput) {
      const selectedOption = this.countrySelect.options[this.countrySelect.selectedIndex];
      const countryCode = selectedOption.value;
      
      // Set placeholder based on country code
      switch (countryCode) {
        case '+1': // US/Canada
          phoneInput.placeholder = '(555) 123-4567';
          break;
        case '+44': // UK
          phoneInput.placeholder = '20 7946 0958';
          break;
        case '+91': // India
          phoneInput.placeholder = '98765 43210';
          break;
        case '+86': // China
          phoneInput.placeholder = '138 0013 8000';
          break;
        case '+81': // Japan
          phoneInput.placeholder = '90-1234-5678';
          break;
        case '+49': // Germany
          phoneInput.placeholder = '30 12345678';
          break;
        case '+33': // France
          phoneInput.placeholder = '1 23 45 67 89';
          break;
        case '+39': // Italy
          phoneInput.placeholder = '02 1234 5678';
          break;
        case '+34': // Spain
          phoneInput.placeholder = '91 123 45 67';
          break;
        case '+31': // Netherlands
          phoneInput.placeholder = '20 123 4567';
          break;
        default:
          phoneInput.placeholder = '(000) 000-0000';
      }
    }
  }

  initHelpButton() {
    if (this.helpBtn) {
      this.helpBtn.addEventListener('click', () => {
        this.showHelpTooltip();
      });
    }
  }

  showHelpTooltip() {
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.contact__help-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'contact__help-tooltip';
    tooltip.innerHTML = `
      <div class="contact__help-content">
        <h4>Phone Number Format</h4>
        <p>Enter your phone number without the country code. The country code is automatically added based on your selection.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>US/Canada: (555) 123-4567</li>
          <li>UK: 20 7946 0958</li>
          <li>India: 98765 43210</li>
        </ul>
        <button class="contact__help-close">Got it</button>
      </div>
    `;

    tooltip.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 300px;
      margin-top: 0.5rem;
    `;

    this.helpBtn.parentNode.style.position = 'relative';
    this.helpBtn.parentNode.appendChild(tooltip);

    // Close tooltip when clicking outside or on close button
    const closeBtn = tooltip.querySelector('.contact__help-close');
    closeBtn.addEventListener('click', () => tooltip.remove());

    document.addEventListener('click', (e) => {
      if (!tooltip.contains(e.target) && !this.helpBtn.contains(e.target)) {
        tooltip.remove();
      }
    });
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
      // Remove all non-digit characters for validation
      const cleanNumber = value.replace(/[\s\-\(\)\.]/g, '');
      if (cleanNumber.length < 7) {
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
      color: #EF4444;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      border-left: 3px solid #EF4444;
    `;
    
    field.style.borderColor = '#EF4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    
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
      
      // Combine first and last name
      const firstName = formData.get('contact[first_name]');
      const lastName = formData.get('contact[last_name]');
      formData.set('contact[name]', `${firstName} ${lastName}`.trim());
      
      // Combine country code and phone
      const countryCode = formData.get('contact[country_code]');
      const phone = formData.get('contact[phone]');
      if (phone) {
        formData.set('contact[phone]', `${countryCode} ${phone}`);
      }
      
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showSuccessMessage();
        this.form.reset();
        this.clearAllErrors();
        this.updateCharacterCount();
        this.updatePhonePlaceholder();
      } else {
        this.showMessage('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.disabled = true;
      this.submitText.textContent = 'Sending...';
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.disabled = false;
      this.submitText.textContent = 'Submit Form';
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
      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      ${type === 'success' ? 'background: #10B981;' : ''}
      ${type === 'error' ? 'background: #EF4444;' : ''}
      ${type === 'info' ? 'background: #3B82F6;' : ''}
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