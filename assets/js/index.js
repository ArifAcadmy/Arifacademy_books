import { registerServiceWorker } from './pwa.js';

const booksUrl = 'data/book.json';
const searchInput = document.getElementById('searchInput');
const booksGrid = document.getElementById('booksGrid');
const searchMeta = document.getElementById('searchMeta');
const themeToggle = document.getElementById('themeToggle');

let booksData = {};
let booksList = [];
let activeTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  localStorage.setItem('theme', theme);
}

function createCard(bookKey, book) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <img loading="lazy" class="card__image" src="${book.image}" alt="${book.title}" />
    <div class="card__header">
      <h3 class="card__title">${book.title}</h3>
      <p class="card__description">${book.description}</p>
      <p class="card__meta">${book.category || 'Book'}</p>
      <a class="card__link" href="cambridge-ielts/?book=${encodeURIComponent(bookKey)}">View details</a>
    </div>
  `;
  return card;
}

function renderBooks(list, isSearching = false) {
  booksGrid.innerHTML = '';
  
  if (!isSearching) {
    booksGrid.innerHTML = `
      <div class="search-placeholder">
        <span class="search-placeholder-icon">📚</span>
        <h3>Start typing to search</h3>
        <p>Enter a book title, category, or keyword to find your book instantly.</p>
      </div>
    `;
    searchMeta.textContent = 'Enter search query';
    return;
  }

  if (list.length === 0) {
    booksGrid.innerHTML = `
      <div class="search-placeholder">
        <span class="search-placeholder-icon">🔍</span>
        <h3>No books found</h3>
        <p>We couldn't find any books matching your query. Try another keyword.</p>
      </div>
    `;
    searchMeta.textContent = '0 books found';
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((bookKey) => {
    fragment.appendChild(createCard(bookKey, booksData[bookKey]));
  });

  booksGrid.appendChild(fragment);
  searchMeta.textContent = `${list.length.toLocaleString()} books found`;
}

function filterBooks(query) {
  if (!query) {
    return [];
  }

  const normalized = query.toLowerCase();
  return booksList.filter((key) => {
    const book = booksData[key];
    return (
      book.title.toLowerCase().includes(normalized) ||
      book.description.toLowerCase().includes(normalized) ||
      (book.category || '').toLowerCase().includes(normalized)
    );
  });
}

async function fetchBooks() {
  try {
    const response = await fetch(booksUrl, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Unable to fetch books.');
    const data = await response.json();
    booksData = data;
    booksList = Object.keys(data);
    renderBooks([], false);
  } catch (error) {
    booksGrid.innerHTML = '<p class="search-meta">Failed to load books. Please refresh the page.</p>';
    console.error(error);
  }
}

function installKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      searchInput.focus();
    }
  });
}

function redirectToBookFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const bookQuery = params.get('book');
  if (params.has('book') && bookQuery) {
    const redirectUrl = `cambridge-ielts/?book=${encodeURIComponent(bookQuery)}`;
    window.location.replace(redirectUrl);
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (!query) {
    renderBooks([], false);
  } else {
    const filtered = filterBooks(query);
    renderBooks(filtered, true);
  }
});

themeToggle.addEventListener('click', () => {
  activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
  setTheme(activeTheme);
});

setTheme(activeTheme);
installKeyboardShortcuts();
redirectToBookFromQuery();
fetchBooks();
registerServiceWorker();
