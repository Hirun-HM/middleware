// PrimaryButton Component
class PrimaryButton {
    constructor(config) {
        this.text = config.text || 'Button';
        this.onClick = config.onClick || (() => {});
        this.disabled = config.disabled || false;
        this.variant = config.variant || 'primary'; // primary, secondary, success, danger
        this.size = config.size || 'medium'; // small, medium, large
        this.id = config.id || null;
        this.className = config.className || '';
    }

    render() {
        const button = document.createElement('button');
        button.textContent = this.text;
        button.disabled = this.disabled;
        
        if (this.id) button.id = this.id;
        
        // Base classes
        button.className = `btn btn-${this.variant} btn-${this.size} ${this.className}`.trim();
        
        // Add event listener
        button.addEventListener('click', this.onClick);
        
        return button;
    }

    static create(config) {
        return new PrimaryButton(config).render();
    }
}

// Export for use
window.PrimaryButton = PrimaryButton;