document.addEventListener('DOMContentLoaded', function () {
  const input = document.querySelector('.navbar__search-input');
  const resultsBox = document.getElementById('navbar-search-results');
  const form = input.closest('form');
  let debounceTimeout;

  function clearResults() {
    resultsBox.innerHTML = '';
    resultsBox.style.display = 'none';
  }

  function renderResults(products) {
    if (!products.length) {
      clearResults();
      return;
    }
    resultsBox.innerHTML = products.map(product => `
      <a href="${product.url}" class="navbar__search-result">
        <img src="${product.featured_image ? product.featured_image.url : ''}" alt="${product.title}" style="width:40px;height:40px;object-fit:cover;margin-right:0.5em;">
        <span>${product.title}</span>
      </a>
    `).join('');
    resultsBox.style.display = 'block';
  }

  input.addEventListener('input', function () {
    const query = this.value.trim();
    clearTimeout(debounceTimeout);
    if (!query) {
      clearResults();
      return;
    }
    debounceTimeout = setTimeout(() => {
      fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
        .then(res => {
          if (!res.ok) throw new Error('Predictive search not available');
          return res.json();
        })
        .then(data => {
          renderResults(data.resources.results.products);
        })
        .catch(() => {
          // Fallback: submit the form to /search
          form.submit();
        });
    }, 250);
  });

  input.addEventListener('blur', function () {
    setTimeout(clearResults, 200);
  });

  input.addEventListener('focus', function () {
    if (resultsBox.innerHTML) resultsBox.style.display = 'block';
  });
}); 