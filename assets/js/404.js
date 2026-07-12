import { registerServiceWorker } from './pwa.js';

const popularBooksGrid = document.getElementById('popularBooksGrid');
const openSearchButton = document.getElementById('openSearchButton');
const themeToggle = document.getElementById('themeToggle');
const booksUrl = 'data/book.json';
let activeTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  localStorage.setItem('theme', theme);
}

async function fetchPopularBooks() {
  try {
    const response = await fetch(booksUrl, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Books file not found');
    const books = await response.json();
    const entries = Object.entries(books).slice(0, 6);
    popularBooksGrid.innerHTML = entries.map(([key, book]) => `
      <article class="card">
        <img loading="lazy" class="card__image" src="${book.image}" alt="${book.title}" />
        <div class="card__header">
          <h3 class="card__title">${book.title}</h3>
          <p class="card__description">${book.description}</p>
          <a class="card__link" href="cambridge-ielts/?book=${encodeURIComponent(key)}">Open book</a>
        </div>
      </article>
    `).join('');
  } catch (error) {
    popularBooksGrid.innerHTML = '<p class="search-meta">Unable to load popular books.</p>';
    console.error(error);
  }
}

setTheme(activeTheme);

themeToggle.addEventListener('click', () => {
  activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
  setTheme(activeTheme);
});

openSearchButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

fetchPopularBooks();
registerServiceWorker();
