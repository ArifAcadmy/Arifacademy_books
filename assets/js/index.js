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
      <a class="card__link" href="book.html?book=${encodeURIComponent(bookKey)}">View details</a>
    </div>
  `;
  return card;
}

function renderBooks(list) {
  booksGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  list.forEach((bookKey) => {
    fragment.appendChild(createCard(bookKey, booksData[bookKey]));
  });

  booksGrid.appendChild(fragment);
  searchMeta.textContent = `${list.length.toLocaleString()} books found`;
}

function filterBooks(query) {
  if (!query) {
    return booksList;
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
    renderBooks(booksList);
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
    const redirectUrl = `book.html?book=${encodeURIComponent(bookQuery)}`;
    window.location.replace(redirectUrl);
  }
}

searchInput.addEventListener('input', () => {
  const filtered = filterBooks(searchInput.value.trim());
  renderBooks(filtered);
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
