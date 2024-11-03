// Import necessary data and components
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import './PreviewComponent.js';

// Wait until the DOM is fully loaded to run the script
document.addEventListener('DOMContentLoaded', () => {

    let page = 1; // Track the current page 
    let matches = books; // Store the list of books to be displayed based on filters

    // Display book details in the console 
    const displayBookDetails = (book) => {
        console.log(book);
    };

    // Create a custom book preview element using the book data
    const createBookPreviewElement = ({ author, id, image, title }) => {
        const bookPreview = document.createElement('book-preview');
        bookPreview.setAttribute('data-image', image);
        bookPreview.setAttribute('data-title', title);
        bookPreview.setAttribute('data-author', authors[author]);
        bookPreview.setAttribute('data-preview', id);

        // Listen for the custom book event to display selected book details
        bookPreview.addEventListener('book-select', (event) => {
            const bookId = event.detail;
            const selectedBook = books.find(book => book.id === bookId);
            if (selectedBook) displayBookDetails(selectedBook);
        });

        return bookPreview;
    };

    // Render a list of books on the page
    const renderBooks = (booksToRender) => {
        const listElement = document.querySelector('[data-list-items]');
        listElement.innerHTML = ''; // Clear the current list
        const fragment = document.createDocumentFragment(); // Use a fragment for efficient DOM manipulation
        booksToRender.slice(0, BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        listElement.appendChild(fragment);
        updateShowMoreButton(booksToRender.length);
    };

    // Populate a dropdown with a list of options
    const populateDropdown = (dropdown, options, defaultLabel) => {
        const fragment = document.createDocumentFragment();
        const defaultOption = new Option(defaultLabel, 'any'); // Add a default "Any" option
        fragment.appendChild(defaultOption);

        // Add each option to the dropdown
        Object.entries(options).forEach(([id, name]) => {
            const option = new Option(name, id);
            fragment.appendChild(option);
        });
        dropdown.appendChild(fragment);
    };

    // Apply the chosen theme (day or night) to the document
    const applyTheme = (theme) => {
        const isNight = theme === 'night';
        document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
    };

    // Initialize the theme based on the user's system preferences
    const initTheme = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'night' : 'day';
        document.querySelector('[data-settings-theme]').value = theme;
        applyTheme(theme);
    };

    // Filter the list of books based on selected filters (genre, author, and title)
    const filterBooks = (filters) => {
        return books.filter(book => {
            const matchesGenre = filters.genre === 'any' || book.genres.includes(filters.genre);
            const matchesAuthor = filters.author === 'any' || book.author === filters.author;
            const matchesTitle = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            return matchesGenre && matchesAuthor && matchesTitle;
        });
    };

    // Update the "Show More" button to display the remaining number of books
    const updateShowMoreButton = (totalBooks) => {
        const button = document.querySelector('[data-list-button]');
        const remainingBooks = totalBooks - page * BOOKS_PER_PAGE;
        button.disabled = remainingBooks <= 0; // Disable button if no books remain
        button.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
    };

    // Handle "Show More" button clicks to load additional books
    const handleShowMoreButtonClick = () => {
        const fragment = document.createDocumentFragment();
        matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
            fragment.appendChild(createBookPreviewElement(book));
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1; // Increment the page count
        updateShowMoreButton(matches.length);
    };

    // Handle form submission for the search filter
    const handleSearchFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        matches = filterBooks(filters); // Filter books based on form data
        page = 1; // Reset to the first page
        renderBooks(matches); // Render filtered books
    };

    // Handle form submission for the settings (theme selection)
    const handleSettingsFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme); // Apply the selected theme
        document.querySelector('[data-settings-overlay]').setAttribute('open', false);
    };

    // Initialize event listeners for various UI elements
    const initEventListeners = () => {
        const listForm = document.querySelector('[data-list-form]');
        const searchForm = document.querySelector('[data-search-form]');
        const listButton = document.querySelector('[data-list-button]');
        const headerSearch = document.querySelector('[data-header-search]');
        const headerSettings = document.querySelector('[data-header-settings]');
        const searchCancel = document.querySelector('[data-search-cancel]');
        const settingsCancel = document.querySelector('[data-settings-cancel]');
    
        // Add event listeners of elements that exist in the DOM
        if (listForm) listForm.addEventListener('submit', handleSettingsFormSubmit);
        if (searchForm) searchForm.addEventListener('submit', handleSearchFormSubmit);
        if (listButton) listButton.addEventListener('click', handleShowMoreButtonClick);
        if (headerSearch) headerSearch.addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').setAttribute('open', true);
            document.querySelector('[data-search-title]').focus();
        });
        if (headerSettings) headerSettings.addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').setAttribute('open', true);
        });
        if (searchCancel) searchCancel.addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').removeAttribute('open');
        });
        if (settingsCancel) settingsCancel.addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').removeAttribute('open');
        });
    };

    // Initial setup: set theme, populate dropdowns, render initial books, and initialize event listeners
    initTheme();
    populateDropdown(document.querySelector('[data-search-genres]'), genres, 'All Genres');
    populateDropdown(document.querySelector('[data-search-authors]'), authors, 'All Authors');
    renderBooks(matches);
    initEventListeners();
});
