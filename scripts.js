import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'
import './PreviewComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    let page = 1;
    let matches = books

    // Function to display book details (define this function)
    const displayBookDetails = (book) => {
        console.log(book);
        // Implement your display logic here, e.g., show a modal with book details
    };

    /**
     * Pure function to create an HTML button for a book preview
     * @param {Object} book - A book object with author, id, image, and title properties
     * @returns {HTMLElement} - The book preview button element
     */
    const createBookPreviewElement = ({ author, id, image, title }) => {
        const bookPreview = document.createElement('book-preview');
        bookPreview.setAttribute('data-image', image);
        bookPreview.setAttribute('data-title', title);
        bookPreview.setAttribute('data-author', authors[author]);
        bookPreview.setAttribute('data-preview', id);

        bookPreview.addEventListener('book-select', (event) => {
            const bookId = event.detail;
            const selectedBook = books.find(book => book.id === bookId);
            if (selectedBook) displayBookDetails(selectedBook);
        });

        return bookPreview;
    };

    /**
     * Renders the initial set of books based on the BOOKS_PER_PAGE limit
     * @param {Array} booksToRender - Array of book objects
     */
    const renderInitialBooks = (booksToRender) => {
        const fragment = document.createDocumentFragment();
        booksToRender.slice(0, BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
    };

    renderInitialBooks(matches);

/**
 * Populates a dropdown with options based on a given list
 * @param {HTMLElement} dropdown - The dropdown element to populate
 * @param {Object} options - Object with option values as keys and labels as values
 * @param {string} defaultLabel - Default label for the first option
 */
    const populateDropdown = (dropdown, options, defaultLabel) => {
        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = 'any';
        defaultOption.innerText = defaultLabel;
        fragment.appendChild(defaultOption);

        Object.entries(options).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.innerText = name;
            fragment.appendChild(option);
        });
        dropdown.appendChild(fragment);
    };

    populateDropdown(document.querySelector('[data-search-genres]'), genres, 'All Genres');
    populateDropdown(document.querySelector('[data-search-authors]'), authors, 'All Authors');

/**
 * Toggles the color scheme based on user preference
 * @param {string} theme - Selected theme (either 'night' or 'day')
 */
    const applyTheme = (theme) => {
        const isNight = theme === 'night';
        document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
    };

    const initTheme = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'night' : 'day';
        document.querySelector('[data-settings-theme]').value = theme;
        applyTheme(theme);
    };

    initTheme();

    document.querySelector('[data-list-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme);
        document.querySelector('[data-settings-overlay]').setAttribute('open', false);
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        matches = filterBooks(filters);
        page = 1;
        updateBookList(matches);
    });
     
    /**
 * Filters books based on search criteria
 * @param {Object} filters - Object with search criteria
 * @returns {Array} - Filtered list of books
 */

    


    const filterBooks = (filters) => {
        return books.filter(book => {
            const matchesGenre = filters.genre === 'any' || book.genres.includes(filters.genre);
            const matchesAuthor = filters.author === 'any' || book.author === filters.author;
            const matchesTitle = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            return matchesGenre && matchesAuthor && matchesTitle;
        });
    };

    const updateBookList = (filteredBooks) => {
        const listElement = document.querySelector('[data-list-items]');
        listElement.innerHTML = '';
        const fragment = document.createDocumentFragment();
        filteredBooks.slice(0, BOOKS_PER_PAGE).forEach(book => fragment.appendChild(createBookPreviewElement(book)));
        listElement.appendChild(fragment);
        updateShowMoreButton(filteredBooks.length);
    };

    const updateShowMoreButton = (totalBooks) => {
        const button = document.querySelector('[data-list-button]');
        const remainingBooks = totalBooks - page * BOOKS_PER_PAGE;
        button.disabled = remainingBooks <= 0;
        button.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
    };

    // Event listeners for show more button, header search, settings, etc.
    document.querySelector('[data-list-button]').addEventListener('click', () => {
        const fragment = document.createDocumentFragment();
        matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1;
        updateShowMoreButton(matches.length);
    });

    // Search and settings overlay handling
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').setAttribute('open', true);
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').setAttribute('open', true);
    });

    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').removeAttribute('open');
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').removeAttribute('open');
    });

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const bookPreview = event.target.closest('book-preview');
        const bookId = bookPreview?.getAttribute('data-preview');
        if (bookId) {
            const selectedBook = books.find(book => book.id === bookId);
            if (selectedBook) displayBookDetails(selectedBook);
        }
    });
});