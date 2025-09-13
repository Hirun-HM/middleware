// UI Components and Builders
class UIBuilder {
    // Create card structure
    static createCard(config) {
        const card = document.createElement('div');
        card.className = 'feature-card';

        // Header
        if (config.title || config.icon) {
            const header = document.createElement('div');
            header.className = 'card-header';

            if (config.icon) {
                const iconEl = document.createElement('div');
                iconEl.className = `card-icon ${config.iconType || ''}`;
                iconEl.innerHTML = config.icon;
                header.appendChild(iconEl);
            }

            if (config.title) {
                const title = document.createElement('h3');
                title.className = 'card-title';
                title.textContent = config.title;
                header.appendChild(title);
            }

            card.appendChild(header);
        }

        // Content
        if (config.content) {
            card.appendChild(config.content);
        }

        return card;
    }

    // Create button group
    static createButtonGroup(buttons) {
        const group = document.createElement('div');
        group.className = 'button-group';

        buttons.forEach(btnConfig => {
            const btn = PrimaryButton.create(btnConfig);
            group.appendChild(btn);
        });

        return group;
    }

    // Create form
    static createForm(fields) {
        const form = document.createElement('div');
        form.className = 'order-form';

        fields.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'form-row';

            row.forEach(fieldConfig => {
                let field;
                if (fieldConfig.type === 'select') {
                    field = SelectField.create(fieldConfig);
                } else {
                    field = InputField.create(fieldConfig);
                }
                rowEl.appendChild(field);
            });

            form.appendChild(rowEl);
        });

        return form;
    }

    // Create output container
    static createOutput(id, initialText = '') {
        const container = document.createElement('div');
        container.className = 'output-container';

        const content = document.createElement('div');
        content.className = 'output-content';
        content.id = id;
        content.innerHTML = initialText;

        container.appendChild(content);
        return container;
    }

    // Create updates container
    static createUpdatesContainer(id) {
        const container = document.createElement('div');
        container.className = 'updates-container';
        container.id = id;

        // Initial message
        const item = document.createElement('div');
        item.className = 'update-item';
        item.innerHTML = `
            <div class="update-icon">📡</div>
            <div class="update-content">
                <div class="update-message">Click "Connect" to receive real-time updates</div>
                <div class="update-timestamp">System ready</div>
            </div>
        `;
        container.appendChild(item);

        return container;
    }
}

// Section builders
class SectionBuilder {
    static createAuthSection() {
        const content = document.createElement('div');

        // Buttons
        const buttons = UIBuilder.createButtonGroup([
            {
                text: 'Login as TechShop',
                onClick: () => authenticateClient(),
                variant: 'primary',
                size: 'medium'
            },
            {
                text: 'Login as Fashion Hub',
                onClick: () => authenticateClient('CLI-002', 'fashionhub_api_key_789'),
                variant: 'secondary',
                size: 'medium'
            }
        ]);

        // Output
        const output = UIBuilder.createOutput('authOutput', 
            '<i class="fas fa-info-circle"></i> Click a login button to authenticate...'
        );

        content.appendChild(buttons);
        content.appendChild(output);

        return UIBuilder.createCard({
            title: 'Client Authentication',
            icon: '<i class="fas fa-lock"></i>',
            iconType: 'auth',
            content
        });
    }

    static createOrderSection() {
        const content = document.createElement('div');

        // Form
        const form = UIBuilder.createForm([
            [
                {
                    label: 'Package Description',
                    id: 'packageDesc',
                    value: 'Electronics - Smartphone'
                },
                {
                    label: 'Weight (kg)',
                    type: 'number',
                    id: 'packageWeight',
                    value: '2.5',
                    step: '0.1'
                }
            ],
            [
                {
                    label: 'Delivery City',
                    type: 'select',
                    id: 'deliveryCity',
                    options: [
                        { value: 'Kandy', text: 'Kandy' },
                        { value: 'Galle', text: 'Galle' },
                        { value: 'Jaffna', text: 'Jaffna' },
                        { value: 'Anuradhapura', text: 'Anuradhapura' }
                    ]
                },
                {
                    label: 'Priority Level',
                    type: 'select',
                    id: 'priority',
                    options: [
                        { value: 'normal', text: 'Normal' },
                        { value: 'high', text: 'High' },
                        { value: 'urgent', text: 'Urgent' }
                    ]
                }
            ]
        ]);

        // Buttons
        const buttons = UIBuilder.createButtonGroup([
            {
                text: 'Submit Order',
                onClick: submitOrder,
                variant: 'primary',
                size: 'large',
                id: 'submitBtn',
                disabled: true
            },
            {
                text: 'View Orders',
                onClick: getOrders,
                variant: 'secondary',
                size: 'medium'
            }
        ]);

        // Output
        const output = UIBuilder.createOutput('orderOutput',
            '<i class="fas fa-exclamation-triangle"></i> Please authenticate first to submit orders...'
        );

        content.appendChild(form);
        content.appendChild(buttons);
        content.appendChild(output);

        return UIBuilder.createCard({
            title: 'Order Management',
            icon: '<i class="fas fa-box"></i>',
            iconType: 'orders',
            content
        });
    }

    static createRealtimeSection() {
        const content = document.createElement('div');

        // Buttons
        const buttons = UIBuilder.createButtonGroup([
            {
                text: 'Connect',
                onClick: connectWebSocket,
                variant: 'success',
                size: 'medium'
            },
            {
                text: 'Disconnect',
                onClick: disconnectWebSocket,
                variant: 'danger',
                size: 'medium'
            },
            {
                text: 'Clear',
                onClick: clearUpdates,
                variant: 'secondary',
                size: 'small'
            }
        ]);

        // Updates container
        const updates = UIBuilder.createUpdatesContainer('updatesList');

        content.appendChild(buttons);
        content.appendChild(updates);

        return UIBuilder.createCard({
            title: 'Real-time Updates',
            icon: '<i class="fas fa-bolt"></i>',
            iconType: 'realtime',
            content
        });
    }

    static createSystemSection() {
        const content = document.createElement('div');

        // Buttons
        const buttons = UIBuilder.createButtonGroup([
            {
                text: 'Health Check',
                onClick: checkSystemHealth,
                variant: 'primary',
                size: 'medium'
            },
            {
                text: 'Driver Update',
                onClick: simulateDriverUpdate,
                variant: 'secondary',
                size: 'medium'
            }
        ]);

        // Output
        const output = UIBuilder.createOutput('healthOutput',
            '<i class="fas fa-check-circle"></i> System status: Ready for demonstration'
        );

        content.appendChild(buttons);
        content.appendChild(output);

        return UIBuilder.createCard({
            title: 'System Status',
            icon: '<i class="fas fa-cogs"></i>',
            iconType: 'system',
            content
        });
    }
}

// Export for global use
window.UIBuilder = UIBuilder;
window.SectionBuilder = SectionBuilder;