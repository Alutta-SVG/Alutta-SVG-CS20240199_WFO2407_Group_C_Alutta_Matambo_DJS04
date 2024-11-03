import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import './PreviewComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    let page = 1;
    let matches = books;

    const displayBookDetails = (book) => {
        console.log(book);
    };

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

    const renderBooks = (booksToRender) => {
        const listElement = document.querySelector('[data-list-items]');
        listElement.innerHTML = '';
        const fragment = document.createDocumentFragment();
        booksToRender.slice(0, BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        listElement.appendChild(fragment);
        updateShowMoreButton(booksToRender.length);
    };

    const populateDropdown = (dropdown, options, defaultLabel) => {
        const fragment = document.createDocumentFragment();
        const defaultOption = new Option(defaultLabel, 'any');
        fragment.appendChild(defaultOption);

        Object.entries(options).forEach(([id, name]) => {
            const option = new Option(name, id);
            fragment.appendChild(option);
        });
        dropdown.appendChild(fragment);
    };

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

    const filterBooks = (filters) => {
        return books.filter(book => {
            const matchesGenre = filters.genre === 'any' || book.genres.includes(filters.genre);
            const matchesAuthor = filters.author === 'any' || book.author === filters.author;
            const matchesTitle = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            return matchesGenre && matchesAuthor && matchesTitle;
        });
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

    const handleShowMoreButtonClick = () => {
        const fragment = document.createDocumentFragment();
        matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1;
        updateShowMoreButton(matches.length);
    };

    const handleSearchFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        matches = filterBooks(filters);
        page = 1;
        renderBooks(matches);
    };

    const handleSettingsFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme);
        document.querySelector('[data-settings-overlay]').setAttribute('open', false);
    };

    const initEventListeners = () => {
        document.querySelector('[data-list-form]').addEventListener('submit', handleSettingsFormSubmit);
        document.querySelector('[data-search-form]').addEventListener('submit', handleSearchFormSubmit);
        document.querySelector('[data-list-button]').addEventListener('click', handleShowMoreButtonClick);
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
    };

    // Initial setup
    initTheme();
    populateDropdown(document.querySelector('[data-search-genres]'), genres, 'All Genres');
    populateDropdown(document.querySelector('[data-search-authors]'), authors, 'All Authors');
    renderBooks(matches);
    initEventListeners();
});
