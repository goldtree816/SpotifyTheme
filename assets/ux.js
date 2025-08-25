/**
 * Enhanced UX JavaScript with polished animations and effects
 */

// Animation control based on theme settings
const ANIM_ENABLED = document.documentElement.dataset.animEnabled !== 'false';
const ANIM_INTENSITY = parseFloat(document.documentElement.dataset.animIntensity) || 1;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Enhanced scroll reveal with stagger and performance optimizations
function initScrollReveal() {
  if (!ANIM_ENABLED || REDUCED_MOTION) return;
  
  const elements = document.querySelectorAll('.reveal:not(.reveal-initialized)');
  if (!elements.length) return;
  
  // Mark as initialized to prevent double-binding
  elements.forEach(el => el.classList.add('reveal-initialized'));
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = parseFloat(element.dataset.revealDelay) || 0;
        
        // Apply intensity-based scaling
        const scale = 0.8 + (0.2 * ANIM_INTENSITY);
        element.style.transform = `translateY(${30 * scale}px)`;
        
        setTimeout(() => {
          element.classList.add('revealed');
        }, delay * 1000);
        
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  elements.forEach(el => observer.observe(el));
}

// Enhanced ripple effect with better performance
function initRipple() {
  const buttons = document.querySelectorAll('.btn-ripple:not(.ripple-initialized)');
  if (!buttons.length) return;
  
  buttons.forEach(btn => {
    btn.classList.add('ripple-initialized');
    
    btn.addEventListener('click', function(e) {
      if (!ANIM_ENABLED || REDUCED_MOTION) return;
      
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Enhanced 3D card tilt effect
function initCardTilt() {
  if (!ANIM_ENABLED || REDUCED_MOTION) return;
  
  const cards = document.querySelectorAll('[data-tilt]:not(.tilt-initialized)');
  if (!cards.length) return;
  
  cards.forEach(card => {
    card.classList.add('tilt-initialized');
    
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -10 * ANIM_INTENSITY;
      const rotateY = (x - centerX) / centerX * 10 * ANIM_INTENSITY;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// Enhanced parallax effect with smooth performance
function initParallax() {
  if (!ANIM_ENABLED || REDUCED_MOTION) return;
  
  const parallaxElements = document.querySelectorAll('[data-parallax]:not(.parallax-initialized)');
  if (!parallaxElements.length) return;
  
  parallaxElements.forEach(element => {
    element.classList.add('parallax-initialized');
    
    const speed = parseFloat(element.dataset.parallax) || 0.1;
    const intensity = speed * ANIM_INTENSITY;
    
    let ticking = false;
    
    function updateParallax() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const rate = scrolled * intensity;
          
          element.style.transform = `translateY(${rate}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', updateParallax, { passive: true });
  });
}

// Enhanced back to top button with smooth scroll
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;
  
  let ticking = false;
  
  function updateBackToTop() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const threshold = 300;
        
        if (scrolled > threshold) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  
  backToTop.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (ANIM_ENABLED && !REDUCED_MOTION) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  });
}

// Enhanced scroll progress bar
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  
  let ticking = false;
  
  function updateProgress() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / height) * 100;
        
        progressBar.style.width = `${progress}%`;
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', updateProgress, { passive: true });
}

// Enhanced sticky header with smooth transitions
function initStickyHeader() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  let ticking = false;
  let isSticky = false;
  
  function updateStickyHeader() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const threshold = 100;
        
        if (scrolled > threshold && !isSticky) {
          navbar.classList.add('sticky');
          isSticky = true;
        } else if (scrolled <= threshold && isSticky) {
          navbar.classList.remove('sticky');
          isSticky = false;
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', updateStickyHeader, { passive: true });
}

// Enhanced image blur-up loading
function initImageBlurUp() {
  const images = document.querySelectorAll('.image-blur-up:not(.blur-initialized)');
  if (!images.length) return;
  
  images.forEach(img => {
    img.classList.add('blur-initialized');
    
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
      
      img.addEventListener('error', function() {
        this.style.filter = 'none';
      });
    }
  });
}

// Enhanced hover effects with performance optimization
function initHoverEffects() {
  if (!ANIM_ENABLED || REDUCED_MOTION) return;
  
  const hoverElements = document.querySelectorAll('.hover-lift, .hover-scale, .hover-glow:not(.hover-initialized)');
  if (!hoverElements.length) return;
  
  hoverElements.forEach(element => {
    element.classList.add('hover-initialized');
    
    // Add will-change for better performance
    if (element.classList.contains('hover-lift')) {
      element.style.willChange = 'transform';
    } else if (element.classList.contains('hover-scale')) {
      element.style.willChange = 'transform';
    } else if (element.classList.contains('hover-glow')) {
      element.style.willChange = 'box-shadow';
    }
  });
}

// Enhanced loading states
function initLoadingStates() {
  const loadingElements = document.querySelectorAll('.loading:not(.loading-initialized)');
  if (!loadingElements.length) return;
  
  loadingElements.forEach(element => {
    element.classList.add('loading-initialized');
    
    // Remove loading class after content loads
    if (element.dataset.loadingDelay) {
      setTimeout(() => {
        element.classList.remove('loading');
      }, parseFloat(element.dataset.loadingDelay));
    }
  });
}

// Enhanced smooth scrolling for anchor links
function initSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.smooth-scroll-initialized)');
  if (!anchorLinks.length) return;
  
  anchorLinks.forEach(link => {
    link.classList.add('smooth-scroll-initialized');
    
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      
      if (ANIM_ENABLED && !REDUCED_MOTION) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        target.scrollIntoView();
      }
    });
  });
}

// Enhanced keyboard navigation
function initKeyboardNavigation() {
  document.addEventListener('keydown', function(e) {
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal.open, .dropdown.open');
      openModals.forEach(modal => {
        modal.classList.remove('open');
      });
    }
    
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
  });
}

// Enhanced performance monitoring
function initPerformanceMonitoring() {
  if (!ANIM_ENABLED) return;
  
  let frameCount = 0;
  let lastTime = performance.now();
  
  function checkPerformance() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      if (fps < 30) {
        // Reduce animation intensity for better performance
        document.documentElement.style.setProperty('--motion-slow', '0.3s');
        document.documentElement.style.setProperty('--motion-med', '0.15s');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkPerformance);
  }
  
  requestAnimationFrame(checkPerformance);
}

// Enhanced intersection observer for better performance
function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Enhanced debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced throttle utility
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Initialize all enhanced UX features
function initEnhancedUX() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

function initAll() {
  // Initialize core features
  initScrollReveal();
  initRipple();
  initCardTilt();
  initParallax();
  initBackToTop();
  initScrollProgress();
  initStickyHeader();
  initImageBlurUp();
  initHoverEffects();
  initLoadingStates();
  initSmoothScrolling();
  initKeyboardNavigation();
  
  // Initialize performance monitoring
  initPerformanceMonitoring();
  
  // Re-initialize on dynamic content changes
  const observer = new MutationObserver(debounce(() => {
    initScrollReveal();
    initRipple();
    initCardTilt();
    initParallax();
    initImageBlurUp();
    initHoverEffects();
    initLoadingStates();
  }, 100));
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Enhanced hamburger menu functionality
function initHamburgerMenu() {
  const hamburger = document.getElementById('navbarHamburger');
  const mobileNav = document.querySelector('.navbar-center');
  const overlay = document.querySelector('.mobile-nav-overlay');
  
  if (!hamburger || !mobileNav) return;
  
  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    
    hamburger.setAttribute('aria-expanded', !isOpen);
    mobileNav.classList.toggle('open');
    
    if (overlay) {
      overlay.classList.toggle('active');
    }
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }
  
  hamburger.addEventListener('click', toggleMenu);
  
  // Close menu when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      toggleMenu();
    }
  });
}

// Enhanced search functionality
function initEnhancedSearch() {
  const searchForm = document.querySelector('.search-form.minimal');
  if (!searchForm) return;
  
  const searchInput = searchForm.querySelector('.search-input');
  const searchBtn = searchForm.querySelector('.search-btn');
  
  if (!searchInput || !searchBtn) return;
  
  // Toggle search expansion
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchForm.classList.toggle('is-open');
    
    if (searchForm.classList.contains('is-open')) {
      searchInput.focus();
    }
  });
  
  // Close search when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
      searchForm.classList.remove('is-open');
    }
  });
  
  // Handle search submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });
}

// Initialize enhanced features
initEnhancedUX();
initHamburgerMenu();
initEnhancedSearch();

// Export functions for external use
window.UXUtils = {
  initScrollReveal,
  initRipple,
  initCardTilt,
  initParallax,
  initBackToTop,
  initScrollProgress,
  initStickyHeader,
  initImageBlurUp,
  initHoverEffects,
  initLoadingStates,
  initSmoothScrolling,
  initKeyboardNavigation,
  createIntersectionObserver,
  debounce,
  throttle
};

