document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.js-search-toggle');
  const overlay = document.querySelector('.js-search-overlay');
  const closeBtn = document.querySelector('.js-search-close');
  const searchInput = document.querySelector('.search-modal__input');

  // Debugging: Log if elements are missing
  if (!toggleBtn || !overlay || !closeBtn || !searchInput) {
    console.error('Search elements missing:', {
      toggleBtn: !!toggleBtn,
      overlay: !!overlay,
      closeBtn: !!closeBtn,
      searchInput: !!searchInput
    });
    return;
  }

  const open = () => {
    document.body.classList.add('search-active');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    searchInput.focus(); // Focus on input when opened
  };

  const close = () => {
    document.body.classList.remove('search-active');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    open();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (
      document.body.classList.contains('search-active') &&
      !overlay.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      close();
    }
  });

  // Close on overlay click (background)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('search-active')) {
      close();
    }
  });
});