// WebSocket Configuration and Handlers
let socket = null;

// Real-time Updates State
let updateCount = 0;

// Initialize WebSocket Connection
function initializeWebSocket() {
    const wsStatus = document.getElementById("wsStatus");
    
    try {
        socket = io("ws://localhost:5000");

        socket.on("connect", () => {
            updateConnectionStatus(wsStatus, "connected", "Connected", "var(--success-color)");
            updateHeaderStatus("connected");
            addUpdate("🔌 WebSocket connected", "success");
            
            if (currentClientId) {
                socket.emit("join-room", `client-${currentClientId}`);
                addUpdate(`📍 Joined room: client-${currentClientId}`, "info");
            }
        });

        socket.on("disconnect", () => {
            updateConnectionStatus(wsStatus, "disconnected", "Disconnected", "var(--danger-color)");
            updateHeaderStatus("disconnected");
            addUpdate("🔌 WebSocket disconnected", "warning");
        });

        socket.on("connect_error", (error) => {
            updateConnectionStatus(wsStatus, "error", "Error", "var(--warning-color)");
            updateHeaderStatus("error");
            addUpdate(`⚠️ Connection error: ${error.message}`, "warning");
        });

        socket.on("orderStatusUpdate", (data) => {
            addUpdate(`📦 Order ${data.orderId}: ${data.status}`, "info");
        });

        socket.on("systemNotification", (data) => {
            addUpdate(`🔔 ${data.message}`, data.type || "info");
        });

        socket.on("driverUpdate", (data) => {
            addUpdate(`🚛 Driver ${data.driverId}: ${data.status}`, "info");
        });

        socket.on("routeOptimization", (data) => {
            addUpdate(`🗺️ Route optimized: ${data.ordersCount} orders`, "success");
        });

        addUpdate("🚀 WebSocket service initialized", "info");
        
    } catch (error) {
        updateConnectionStatus(wsStatus, "error", "Failed", "var(--danger-color)");
        updateHeaderStatus("error");
        addUpdate(`❌ WebSocket initialization failed: ${error.message}`, "error");
    }
}

function updateConnectionStatus(element, status, text, color) {
    element.innerHTML = `
        <span style="color: ${color};">
            <i class="fas fa-${getStatusIcon(status)}"></i> ${text}
        </span>
    `;
}

function updateHeaderStatus(status) {
    const headerStatus = document.getElementById("connectionStatus");
    if (headerStatus) {
        headerStatus.className = `status-badge ${status}`;
        headerStatus.innerHTML = `<i class="fas fa-circle"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
}

function getStatusIcon(status) {
    switch (status) {
        case "connected": return "check-circle";
        case "disconnected": return "times-circle";
        case "error": return "exclamation-triangle";
        default: return "circle";
    }
}

// Add Update to Live Feed
function addUpdate(message, type = "info") {
    const updatesContainer = document.getElementById("liveUpdates");
    updateCount++;
    
    const colors = {
        success: "var(--success-color)",
        error: "var(--danger-color)",
        warning: "var(--warning-color)",
        info: "var(--info-color)"
    };
    
    const update = document.createElement("div");
    update.style.cssText = `
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.5rem;
        background: var(--bg-accent);
        border-left: 3px solid ${colors[type]};
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        animation: slideIn 0.3s ease;
    `;
    
    update.innerHTML = `
        <span style="color: ${colors[type]}; font-weight: 500;">
            #${updateCount}
        </span>
        <span style="color: var(--text-muted); margin-left: 0.5rem;">
            ${new Date().toLocaleTimeString()}
        </span>
        <div style="margin-top: 0.25rem; color: var(--text-primary);">
            ${message}
        </div>
    `;
    
    updatesContainer.insertBefore(update, updatesContainer.firstChild);
    
    // Limit to 50 updates
    while (updatesContainer.children.length > 50) {
        updatesContainer.removeChild(updatesContainer.lastChild);
    }
}

// Manual WebSocket Connection Toggle
function toggleWebSocket() {
    const connectBtn = document.getElementById("connectBtn");
    
    if (socket && socket.connected) {
        socket.disconnect();
        connectBtn.textContent = "Connect";
        addUpdate("🔌 WebSocket disconnected manually", "warning");
    } else {
        if (socket) {
            socket.connect();
        } else {
            initializeWebSocket();
        }
        connectBtn.textContent = "Disconnect";
        addUpdate("🔌 WebSocket connection initiated", "info");
    }
}

// Clear Live Updates
function clearUpdates() {
    document.getElementById("liveUpdates").innerHTML = "";
    updateCount = 0;
    addUpdate("🧹 Updates cleared", "info");
}

// Test WebSocket Connection
function testWebSocket() {
    if (!socket || !socket.connected) {
        addUpdate("⚠️ WebSocket not connected", "warning");
        return;
    }
    
    socket.emit("test-connection", {
        clientId: currentClientId || "TEST",
        timestamp: new Date().toISOString(),
        message: "Test ping from client"
    });
    
    addUpdate("🏓 Test ping sent", "info");
}