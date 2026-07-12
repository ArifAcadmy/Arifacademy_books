import { registerServiceWorker } from './pwa.js';

const booksUrl = '../data/book.json';

function getBookUrl(key) {
  return `?book=${encodeURIComponent(key)}`;
}

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
  // Match the folder name inside /book/
  const match = pathname.match(/\/book\/([^/]+)/);
  if (match) return match[1];
  
  // Fallback: match any folder structure
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    return parts[parts.length - 1];
  }
  return null;
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
  bookImage.src = book.image || 'assets/images/placeholder.svg';
  bookImage.alt = `${book.title} cover`;
  bookImage.onerror = () => { bookImage.onerror = null; bookImage.src = 'assets/images/placeholder.svg'; };
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
        return `<li><a href="${getBookUrl(slug)}">${item ? item.title : slug}</a></li>`;
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
  if (!relatedBooksGrid) return;
  const normalized = book.title.toLowerCase().split(' ')[0];
  const related = Object.entries(booksData)
    .filter(([key]) => key !== bookKey)
    .filter(([, item]) => item.title.toLowerCase().includes(normalized))
    .slice(0, 4);

  if (relatedCount) relatedCount.textContent = `Related: ${related.length}`;
  relatedBooksGrid.innerHTML = '';

  related.forEach(([key, item]) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img loading="lazy" class="card__image" src="${item.image || 'assets/images/placeholder.svg'}" alt="${item.title}" onerror="this.onerror=null;this.src='assets/images/placeholder.svg'" />
      <div class="card__header">
        <h3 class="card__title">${item.title}</h3>
        <p class="card__description">${item.description}</p>
        <a class="card__link" href="${getBookUrl(key)}">Open book</a>
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
    const url = window.location.href;
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
        url: window.location.href
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
        renderNotFound();
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
    renderNotFound();
  }
}

function renderNotFound() {
  pageTitle.textContent = 'Book Not Found • Arif Academy';
  if (bookTitle) bookTitle.textContent = 'Book Not Found';
  if (bookTagline) bookTagline.textContent = 'The requested book could not be found.';
  if (bookImage) bookImage.src = 'assets/images/placeholder.svg';
  if (bookCategory) bookCategory.textContent = '';
  if (bookDescription) bookDescription.textContent = 'Try searching a different title, or check the list of available books.';
  if (downloadButton) { downloadButton.style.display = 'none'; }
  if (copyLinkButton) { copyLinkButton.style.display = 'none'; }
  // show popular books from data if available
  if (relatedBooksGrid) {
    relatedBooksGrid.innerHTML = '';
    const entries = Object.entries(booksData || {}).slice(0, 6);
    if (entries.length) {
      entries.forEach(([key, book]) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <img loading="lazy" class="card__image" src="${book.image || 'assets/images/placeholder.svg'}" alt="${book.title}" onerror="this.onerror=null;this.src='assets/images/placeholder.svg'" />
          <div class="card__header">
            <h3 class="card__title">${book.title}</h3>
            <p class="card__description">${book.description}</p>
            <a class="card__link" href="${getBookUrl(key)}">Open book</a>
          </div>
        `;
        relatedBooksGrid.appendChild(card);
      });
    } else {
      relatedBooksGrid.innerHTML = '<p class="search-meta">No books available.</p>';
    }
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
