import { registerServiceWorker } from './pwa.js';

const booksUrl = 'data/book.json';
const pageTitle = document.getElementById('pageTitle');
const metaDescription = document.getElementById('metaDescription');
const canonicalLink = document.getElementById('canonicalLink');
const ogTitle = document.getElementById('ogTitle');
const ogDescription = document.getElementById('ogDescription');
const ogUrl = document.getElementById('ogUrl');
const ogImage = document.getElementById('ogImage');
const twitterTitle = document.getElementById('twitterTitle');
const twitterDescription = document.getElementById('twitterDescription');
const bookTitle = document.getElementById('bookTitle');
const bookTagline = document.getElementById('bookTagline');
const bookImage = document.getElementById('bookImage');
const bookCategory = document.getElementById('bookCategory');
const bookDescription = document.getElementById('bookDescription');
const downloadButton = document.getElementById('downloadButton');
const copyLinkButton = document.getElementById('copyLinkButton');
const shareButton = document.getElementById('shareButton');
const favoriteButton = document.getElementById('favoriteButton');
const viewsCount = document.getElementById('viewsCount');
const relatedCount = document.getElementById('relatedCount');
const bookExtra = document.getElementById('bookExtra');
const breadcrumbBook = document.getElementById('breadcrumbBook');
const relatedBooksGrid = document.getElementById('relatedBooksGrid');
const themeToggle = document.getElementById('themeToggle');

const bookDetail = document.getElementById('bookDetail');

let booksData = {};
let bookKey = null;
let activeTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  localStorage.setItem('theme', theme);
}

function getBookKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('book')) return params.get('book');

  const pathname = window.location.pathname.replace(/\/index\.html$/, '/');
  const path = pathname.replace(/\/book\/?/, '').replace(/\.html$/, '').replace(/^\//, '').replace(/\/+$/,'');
  return path || null;
}

function getCurrentUrl() {
  return window.location.href;
}

function getRecentlyViewedBooks() {
  const stored = JSON.parse(localStorage.getItem('book-recently-viewed') || '[]');
  return Array.isArray(stored) ? stored.filter((slug) => slug && slug !== bookKey) : [];
}

function saveRecentlyViewedBook(key) {
  const stored = JSON.parse(localStorage.getItem('book-recently-viewed') || '[]');
  const recent = Array.isArray(stored) ? stored.filter((slug) => slug !== key) : [];
  recent.unshift(key);
  localStorage.setItem('book-recently-viewed', JSON.stringify(recent.slice(0, 6)));
}

function updateSeo(book) {
  const currentUrl = window.location.href;
  pageTitle.textContent = `${book.title} • Arif Academy`;
  metaDescription.content = book.description;
  canonicalLink.href = currentUrl;
  ogTitle.content = book.title;
  ogDescription.content = book.description;
  ogUrl.content = currentUrl;
  ogImage.content = book.image;
  twitterTitle.content = book.title;
  twitterDescription.content = book.description;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': book.title,
    'description': book.description,
    'image': book.image,
    'url': currentUrl,
    'genre': book.category || 'Book',
    'publisher': {
      '@type': 'Organization',
      'name': 'Arif Academy'
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

function populateBookDetails(book) {
  bookTitle.textContent = book.title;
  breadcrumbBook.textContent = book.title;
  bookTagline.textContent = book.description;
  bookImage.src = book.image;
  bookImage.alt = `${book.title} cover`;
  bookCategory.textContent = book.category || 'Book';
  bookDescription.textContent = book.description;
  downloadButton.href = book.download;
  downloadButton.dataset.download = book.download;
  updateSeo(book);
  renderBookExtras(book);
}

function renderBookExtras(book) {
  const recentBooks = getRecentlyViewedBooks();
  const descriptionHtml = book.extra || `<p>${book.description}</p>`;
  bookExtra.innerHTML = `
    <div class="book-details-grid">
      <div><strong>Title:</strong> ${book.title}</div>
      <div><strong>Category:</strong> ${book.category || 'Book'}</div>
      <div><strong>Download URL:</strong> <a href="${book.download}" target="_blank" rel="noopener noreferrer">Open download</a></div>
      <div><strong>Slug:</strong> ${bookKey}</div>
    </div>
    <div class="book-extra-description">${descriptionHtml}</div>
    ${recentBooks.length ? `<div class="recent-shell"><h3>Recently viewed</h3><ul>${recentBooks
      .map((slug) => {
        const item = booksData[slug];
        return `<li><a href="book.html?book=${encodeURIComponent(slug)}">${item ? item.title : slug}</a></li>`;
      })
      .join('')}</ul></div>` : ''}
  `;
}

function setViewCount() {
  const storageKey = `book-view-${bookKey}`;
  const stored = Number(localStorage.getItem(storageKey)) || 0;
  localStorage.setItem(storageKey, stored + 1);
  viewsCount.textContent = `Views: ${stored + 1}`;
}

function populateRelatedBooks(book) {
  const normalized = book.title.toLowerCase().split(' ')[0];
  const related = Object.entries(booksData)
    .filter(([key]) => key !== bookKey)
    .filter(([, item]) => item.title.toLowerCase().includes(normalized))
    .slice(0, 4);

  relatedCount.textContent = `Related: ${related.length}`;
  relatedBooksGrid.innerHTML = '';

  related.forEach(([key, item]) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img loading="lazy" class="card__image" src="${item.image}" alt="${item.title}" />
      <div class="card__header">
        <h3 class="card__title">${item.title}</h3>
        <p class="card__description">${item.description}</p>
        <a class="card__link" href="book.html?book=${encodeURIComponent(key)}">Open book</a>
      </div>
    `;
    relatedBooksGrid.appendChild(card);
  });
}

function setFavorite(book) {
  const favorites = JSON.parse(localStorage.getItem('book-favorites') || '[]');
  const exists = favorites.includes(bookKey);
  if (exists) {
    favoriteButton.textContent = 'Favorite ✓';
    favoriteButton.disabled = true;
    return;
  }

  favorites.push(bookKey);
  localStorage.setItem('book-favorites', JSON.stringify(favorites));
  favoriteButton.textContent = 'Favorite ✓';
  favoriteButton.disabled = true;
}

function loadFavoriteState() {
  const favorites = JSON.parse(localStorage.getItem('book-favorites') || '[]');
  if (favorites.includes(bookKey)) {
    favoriteButton.textContent = 'Favorite ✓';
    favoriteButton.disabled = true;
  }
}

function installClipboard() {
  copyLinkButton.addEventListener('click', async () => {
    const url = `${window.location.origin}${window.location.pathname}?book=${encodeURIComponent(bookKey)}`;
    try {
      await navigator.clipboard.writeText(url);
      copyLinkButton.textContent = 'Link Copied';
      setTimeout(() => {
        copyLinkButton.textContent = 'Copy Link';
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  });
}

function installShare() {
  shareButton.addEventListener('click', async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: bookTitle.textContent,
        text: bookDescription.textContent,
        url: `${window.location.origin}${window.location.pathname}?book=${encodeURIComponent(bookKey)}`
      });
    } catch (error) {
      console.error(error);
    }
  });
}

async function loadBook() {
  try {
    const response = await fetch(booksUrl, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Books file not found');
    booksData = await response.json();
    bookKey = getBookKeyFromUrl();

    if (!bookKey || !booksData[bookKey]) {
      window.location.href = '404.html';
      return;
    }

    const book = booksData[bookKey];
    populateBookDetails(book);
    setViewCount();
    populateRelatedBooks(book);
    saveRecentlyViewedBook(bookKey);
    loadFavoriteState();
    installClipboard();
    installShare();
  } catch (error) {
    console.error(error);
    window.location.href = '404.html';
  }
}

setTheme(activeTheme);
themeToggle.addEventListener('click', () => {
  activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
  setTheme(activeTheme);
});

favoriteButton.addEventListener('click', () => setFavorite());
loadBook();
registerServiceWorker();
