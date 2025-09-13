// SelectField Component
class SelectField {
    constructor(config) {
        this.label = config.label || '';
        this.id = config.id || `select-${Math.random().toString(36).substr(2, 9)}`;
        this.options = config.options || [];
        this.value = config.value || '';
        this.required = config.required || false;
        this.disabled = config.disabled || false;
        this.className = config.className || '';
        this.onChange = config.onChange || (() => {});
        this.placeholder = config.placeholder || 'Select an option';
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

        // Create select
        const select = document.createElement('select');
        select.id = this.id;
        select.required = this.required;
        select.disabled = this.disabled;
        select.className = 'form-select';

        // Add placeholder option if provided
        if (this.placeholder && !this.value) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = this.placeholder;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);
        }

        // Add options
        this.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.value === this.value) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
        });

        // Add event listener
        select.addEventListener('change', this.onChange);

        container.appendChild(select);
        return container;
    }

    static create(config) {
        return new SelectField(config).render();
    }
}

// Export for use
window.SelectField = SelectField;