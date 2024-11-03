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
