class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Use shadow DOM for encapsulation
        this.render();
    }

    static get observedAttributes() {
        return ['data-image', 'data-title', 'data-author', 'data-preview'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render(); // Re-render when attributes change
    }
    render() {
        const image = this.getAttribute('data-image');
        const title = this.getAttribute('data-title');
        const author = this.getAttribute('data-author');
        const id = this.getAttribute('data-preview');

        this.shadowRoot.innerHTML = `
            <style>
                .book-preview {
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin: 10px;
                    display: inline-block;
                    cursor: pointer;
                }
                img {
                    max-width: 100px;
                }
            </style>
            <div class="book-preview" data-preview="${id}">
                <img src="${image}" alt="${title}" />
                <h3>${title}</h3>
                <p>${author}</p>
            </div>
        `;

        this.shadowRoot.querySelector('.book-preview').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('book-select', { detail: id, bubbles: true }));
        });
    }
}

customElements.define('book-preview', BookPreview);