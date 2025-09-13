// Application Initialization and Main Logic
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 SwiLogistics Client Portal Loading...");
    
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    console.log("📝 Starting app initialization...");
    
    // Check if required classes are available
    if (typeof UIBuilder === 'undefined') {
        console.error("❌ UIBuilder class not found!");
        return;
    }
    if (typeof PrimaryButton === 'undefined') {
        console.error("❌ PrimaryButton class not found!");
        return;
    }
    if (typeof InputField === 'undefined') {
        console.error("❌ InputField class not found!");
        return;
    }
    
    console.log("✅ All required classes available");
    
    // Build the UI using UIBuilder
    const uiBuilder = new UIBuilder();
    
    // Create all sections
    createAuthSection(uiBuilder);
    createOrderSection(uiBuilder);
    createSystemSection(uiBuilder);
    
    // Initialize WebSocket (make sure function exists)
    if (typeof initializeWebSocket === 'function') {
        initializeWebSocket();
    } else {
        console.error("❌ initializeWebSocket function not found!");
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Add initial welcome message (check if function exists)
    if (typeof addUpdate === 'function') {
        addUpdate("👋 Welcome to SwiLogistics Client Portal", "info");
        addUpdate("🔐 Please authenticate to start using the system", "info");
    } else {
        console.log("👋 Welcome to SwiLogistics Client Portal");
        console.log("🔐 Please authenticate to start using the system");
    }
    
    console.log("✅ Application initialized successfully");
}

function createAuthSection(uiBuilder) {
    const authContainer = document.getElementById("authContainer");
    
    const authSection = uiBuilder.createSection(
        "auth-section",
        "Authentication",
        "fas fa-shield-alt",
        "var(--primary-color)"
    );
    
    // Client ID Input
    const clientIdInput = new InputField({
        id: "clientId",
        type: "text",
        placeholder: "Enter Client ID",
        value: "CLI-001"
    });
    
    // API Key Input
    const apiKeyInput = new InputField({
        id: "apiKey",
        type: "password",
        placeholder: "Enter API Key",
        value: "techshop_api_key_123"
    });
    
    // Auth Button
    const authButton = new PrimaryButton({
        id: "authBtn",
        text: "Authenticate",
        icon: "fas fa-key",
        onClick: () => authenticateClient(
            document.getElementById("clientId").value,
            document.getElementById("apiKey").value
        )
    });
    
    // Build auth section
    const authContent = document.createElement("div");
    authContent.style.display = "grid";
    authContent.style.gap = "1rem";
    
    authContent.appendChild(clientIdInput.render());
    authContent.appendChild(apiKeyInput.render());
    authContent.appendChild(authButton.render());
    
    // Output area
    const authOutput = document.createElement("div");
    authOutput.id = "authOutput";
    authOutput.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-accent);
        border-radius: var(--radius-sm);
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-style: italic;
    `;
    authOutput.textContent = "Click authenticate to connect...";
    
    authSection.appendChild(authContent);
    authSection.appendChild(authOutput);
    authContainer.appendChild(authSection);
}

function createOrderSection(uiBuilder) {
    const orderContainer = document.getElementById("orderContainer");
    
    const orderSection = uiBuilder.createSection(
        "order-section",
        "Order Management",
        "fas fa-box",
        "var(--accent-color)"
    );
    
    // Form inputs
    const formGrid = document.createElement("div");
    formGrid.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;";
    
    // Package Weight Input
    const weightInput = new InputField({
        id: "packageWeight",
        type: "number",
        placeholder: "Package Weight (kg)",
        value: "5.5"
    });
    
    // Package Description Input
    const descInput = new InputField({
        id: "packageDesc",
        type: "text",
        placeholder: "Package Description",
        value: "Electronics - Laptop"
    });
    
    // Delivery City Input
    const cityInput = new InputField({
        id: "deliveryCity",
        type: "text",
        placeholder: "Delivery City",
        value: "Kandy"
    });
    
    // Priority Select
    const prioritySelect = new SelectField({
        id: "priority",
        options: [
            { value: "standard", text: "Standard" },
            { value: "express", text: "Express" },
            { value: "urgent", text: "Urgent" }
        ]
    });
    
    formGrid.appendChild(weightInput.render());
    formGrid.appendChild(descInput.render());
    formGrid.appendChild(cityInput.render());
    formGrid.appendChild(prioritySelect.render());
    
    // Action buttons
    const buttonGrid = document.createElement("div");
    buttonGrid.style.cssText = "display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;";
    
    const submitButton = new PrimaryButton({
        id: "submitBtn",
        text: "Submit Order",
        icon: "fas fa-paper-plane",
        disabled: true,
        onClick: submitOrder
    });
    
    const getOrdersButton = new PrimaryButton({
        id: "getOrdersBtn",
        text: "Get My Orders",
        icon: "fas fa-list",
        variant: "secondary",
        onClick: getOrders
    });
    
    buttonGrid.appendChild(submitButton.render());
    buttonGrid.appendChild(getOrdersButton.render());
    
    // Output area
    const orderOutput = document.createElement("div");
    orderOutput.id = "orderOutput";
    orderOutput.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-accent);
        border-radius: var(--radius-sm);
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-style: italic;
    `;
    orderOutput.textContent = "Submit an order or fetch existing orders...";
    
    orderSection.appendChild(formGrid);
    orderSection.appendChild(buttonGrid);
    orderSection.appendChild(orderOutput);
    orderContainer.appendChild(orderSection);
}

function createSystemSection(uiBuilder) {
    const systemContainer = document.getElementById("systemContainer");
    
    // System Health Section
    const healthSection = uiBuilder.createSection(
        "health-section",
        "System Health",
        "fas fa-heartbeat",
        "var(--success-color)"
    );
    
    const healthButton = new PrimaryButton({
        id: "healthBtn",
        text: "Check Health",
        icon: "fas fa-stethoscope",
        variant: "success",
        onClick: checkSystemHealth
    });
    
    const healthOutput = document.createElement("div");
    healthOutput.id = "healthOutput";
    healthOutput.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-accent);
        border-radius: var(--radius-sm);
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-style: italic;
    `;
    healthOutput.textContent = "Click to check system status...";
    
    healthSection.appendChild(healthButton.render());
    healthSection.appendChild(healthOutput);
    
    // WebSocket Section
    const wsSection = uiBuilder.createSection(
        "ws-section",
        "Real-time Connection",
        "fas fa-wifi",
        "var(--info-color)"
    );
    
    const wsControls = document.createElement("div");
    wsControls.style.cssText = "display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;";
    
    const wsStatus = document.createElement("div");
    wsStatus.id = "wsStatus";
    wsStatus.innerHTML = `<span style="color: var(--warning-color);"><i class="fas fa-circle"></i> Connecting...</span>`;
    
    const connectButton = new PrimaryButton({
        id: "connectBtn",
        text: "Disconnect",
        icon: "fas fa-plug",
        variant: "warning",
        onClick: toggleWebSocket
    });
    
    const testButton = new PrimaryButton({
        id: "testBtn",
        text: "Test",
        icon: "fas fa-flask",
        variant: "secondary",
        onClick: testWebSocket
    });
    
    const clearButton = new PrimaryButton({
        id: "clearBtn",
        text: "Clear",
        icon: "fas fa-trash",
        variant: "danger",
        onClick: clearUpdates
    });
    
    wsControls.appendChild(wsStatus);
    wsControls.appendChild(connectButton.render());
    wsControls.appendChild(testButton.render());
    wsControls.appendChild(clearButton.render());
    
    // Live Updates Container
    const updatesContainer = document.createElement("div");
    updatesContainer.innerHTML = `
        <h4 style="margin: 1rem 0 0.5rem 0; color: var(--text-secondary);">
            <i class="fas fa-broadcast-tower"></i> Live Updates
        </h4>
        <div id="liveUpdates" style="
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            padding: 0.5rem;
            background: var(--bg-primary);
        "></div>
    `;
    
    wsSection.appendChild(wsControls);
    wsSection.appendChild(updatesContainer);
    
    systemContainer.appendChild(healthSection);
    systemContainer.appendChild(wsSection);
}

function setupEventListeners() {
    // Handle Enter key in form inputs
    document.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const activeElement = document.activeElement;
            
            if (activeElement.closest("#authContainer")) {
                document.getElementById("authBtn").click();
            } else if (activeElement.closest("#orderContainer")) {
                const submitBtn = document.getElementById("submitBtn");
                if (!submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
    });
    
    // Handle visibility change for reconnection
    document.addEventListener("visibilitychange", function() {
        if (!document.hidden && socket && !socket.connected) {
            addUpdate("🔄 Page visible - checking connection", "info");
            setTimeout(() => {
                if (socket && !socket.connected) {
                    socket.connect();
                }
            }, 1000);
        }
    });
}

// Add CSS animation for slide-in effect
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);