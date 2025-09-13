// InputField Component
class InputField {
    constructor(config) {
        this.label = config.label || '';
        this.type = config.type || 'text';
        this.id = config.id || `input-${Math.random().toString(36).substr(2, 9)}`;
        this.value = config.value || '';
        this.placeholder = config.placeholder || '';
        this.required = config.required || false;
        this.disabled = config.disabled || false;
        this.className = config.className || '';
        this.step = config.step || null;
        this.min = config.min || null;
        this.max = config.max || null;
        this.onChange = config.onChange || (() => {});
    }

    render() {
        const container = document.createElement('div');
        container.className = `form-group ${this.className}`.trim();

        // Create label if provided
        if (this.label) {
        const label = document.createElement('label');
        label.textContent = this.label;
        label.setAttribute('for', this.id);
        label.className = 'form-label';
        container.appendChild(label);
        }

        // Create input
        const input = document.createElement('input');
        input.type = this.type;
        input.id = this.id;
        input.value = this.value;
        input.placeholder = this.placeholder;
        input.required = this.required;
        input.disabled = this.disabled;
        input.className = 'form-input';

        // Add numeric attributes if applicable
        if (this.step) input.step = this.step;
        if (this.min !== null) input.min = this.min;
        if (this.max !== null) input.max = this.max;

        // Add event listener
        input.addEventListener('input', this.onChange);

        container.appendChild(input);
        return container;
    }

    static create(config) {
        return new InputField(config).render();
    }
}

// Export for use
window.InputField = InputField;