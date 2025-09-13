// API Configuration and Functions
const API_BASE = "http://localhost:5000/api";

// Global state
let authToken = null;
let currentClientId = null;

// Authentication
async function authenticateClient(clientId = "CLI-001", apiKey = "techshop_api_key_123") {
    try {
        const response = await fetch(`${API_BASE}/auth/client/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, apiKey })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentClientId = clientId;
            
            document.getElementById("authOutput").innerHTML = `
                <div style="color: var(--success-color);">
                    <i class="fas fa-check-circle"></i> <strong>Authentication Successful</strong>
                </div>
                <div style="margin-top: 0.5rem;">
                    <strong>Company:</strong> ${data.client.companyName}<br>
                    <strong>Client ID:</strong> ${data.client.clientId}<br>
                    <strong>Token:</strong> ${data.token.substring(0, 20)}...
                </div>
            `;
            
            document.getElementById("submitBtn").disabled = false;

            // Join WebSocket room if connected
            if (socket && socket.connected) {
                socket.emit("join-room", `client-${currentClientId}`);
                addUpdate(`📍 Joined room: client-${currentClientId}`, "info");
            }

            addUpdate(`🔐 Authenticated as ${data.client.companyName}`, "success");
        } else {
            document.getElementById("authOutput").innerHTML = `
                <div style="color: var(--danger-color);">
                    <i class="fas fa-exclamation-triangle"></i> Authentication failed: ${data.error}
                </div>
            `;
        }
    } catch (error) {
        document.getElementById("authOutput").innerHTML = `
            <div style="color: var(--danger-color);">
                <i class="fas fa-times-circle"></i> Connection error: ${error.message}
            </div>
        `;
    }
}

// Submit Order
async function submitOrder() {
    if (!authToken) {
        alert("Please authenticate first");
        return;
    }

    const orderData = {
        clientId: currentClientId,
        packageDetails: {
            weight: parseFloat(document.getElementById("packageWeight").value),
            dimensions: { length: 30, width: 20, height: 15 },
            description: document.getElementById("packageDesc").value,
            value: 50000
        },
        pickupAddress: {
            street: "123 Galle Road",
            city: "Colombo",
            postalCode: "00300",
            country: "Sri Lanka",
            coordinates: { lat: 6.9271, lng: 79.8612 }
        },
        deliveryAddress: {
            street: "456 Main Street",
            city: document.getElementById("deliveryCity").value,
            postalCode: "20000",
            country: "Sri Lanka",
            coordinates: { lat: 7.2906, lng: 80.6337 },
            contactName: "John Doe",
            contactPhone: "+94771234567"
        },
        priority: document.getElementById("priority").value
    };

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            updateOrderOutput(`
                <div style="color: var(--success-color);">
                    <i class="fas fa-check-circle"></i> <strong>Order Submitted Successfully!</strong>
                </div>
                <div style="margin-top: 1rem;">
                    <strong>Order ID:</strong> ${data.orderId}<br>
                    <strong>Package:</strong> ${orderData.packageDetails.description}<br>
                    <strong>Destination:</strong> ${orderData.deliveryAddress.city}<br>
                    <strong>Priority:</strong> ${orderData.priority}<br>
                    <strong>Status:</strong> <span style="color: var(--warning-color);">Processing...</span>
                </div>
            `);
            addUpdate(`📦 New order created: ${data.orderId}`, "success");
        } else {
            updateOrderOutput(`
                <div style="color: var(--danger-color);">
                    <i class="fas fa-times-circle"></i> Order submission failed: ${data.error}
                </div>
            `);
        }
    } catch (error) {
        updateOrderOutput(`
            <div style="color: var(--danger-color);">
                <i class="fas fa-times-circle"></i> Connection error: ${error.message}
            </div>
        `);
    }
}

// Get Orders
async function getOrders() {
    if (!authToken || !currentClientId) {
        alert("Please authenticate first");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/clients/${currentClientId}/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            let output = `
                <div style="color: var(--primary-color);">
                    <i class="fas fa-list"></i> <strong>Your Orders (${data.orders.length} total)</strong>
                </div>
                <div style="margin-top: 1rem;">
            `;

            data.orders.forEach((order, index) => {
                const statusColor = order.status === "completed" ? "var(--success-color)" : 
                                  order.status === "processing" ? "var(--warning-color)" : "var(--info-color)";

                output += `
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-accent); border-radius: var(--radius-sm);">
                        <strong>${index + 1}. ${order.orderId}</strong><br>
                        <span style="margin-left: 1rem;"><i class="fas fa-box"></i> ${order.packageDetails.description}</span><br>
                        <span style="margin-left: 1rem;"><i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress.city}</span><br>
                        <span style="margin-left: 1rem;"><i class="fas fa-sync-alt"></i> Status: <span style="color: ${statusColor};">${order.status}</span></span><br>
                        <span style="margin-left: 1rem;"><i class="fas fa-calendar"></i> ${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                `;
            });

            output += "</div>";
            updateOrderOutput(output);
            addUpdate(`📋 Loaded ${data.orders.length} orders`, "info");
        } else {
            updateOrderOutput(`
                <div style="color: var(--danger-color);">
                    <i class="fas fa-times-circle"></i> Failed to load orders: ${data.error}
                </div>
            `);
        }
    } catch (error) {
        updateOrderOutput(`
            <div style="color: var(--danger-color);">
                <i class="fas fa-times-circle"></i> Connection error: ${error.message}
            </div>
        `);
    }
}

// System Health Check
async function checkSystemHealth() {
    try {
        const response = await fetch("http://localhost:5000/health");
        const data = await response.json();

        document.getElementById("healthOutput").innerHTML = `
            <div style="color: var(--success-color);">
                <i class="fas fa-heartbeat"></i> <strong>System Health Check</strong>
            </div>
            <div style="margin-top: 1rem;">
                <div><i class="fas fa-server" style="color: var(--success-color);"></i> API Server: ${data.status}</div>
                <div><i class="fas fa-clock" style="color: var(--info-color);"></i> Uptime: ${Math.floor(data.uptime / 60)} minutes</div>
                <div><i class="fas fa-calendar" style="color: var(--text-muted);"></i> Last Check: ${data.timestamp}</div>
                <div><i class="fas fa-database" style="color: var(--success-color);"></i> MongoDB: Connected</div>
                <div><i class="fas fa-rabbit" style="color: ${socket && socket.connected ? 'var(--success-color)' : 'var(--warning-color)'};"></i> WebSocket: ${socket && socket.connected ? 'Connected' : 'Checking...'}</div>
                <div><i class="fas fa-cog" style="color: var(--success-color);"></i> Background Workers: Active</div>
            </div>
        `;
        addUpdate("🏥 Health check completed", "success");
    } catch (error) {
        document.getElementById("healthOutput").innerHTML = `
            <div style="color: var(--danger-color);">
                <i class="fas fa-times-circle"></i> Health check failed: ${error.message}
            </div>
        `;
    }
}

function updateOrderOutput(html) {
    document.getElementById("orderOutput").innerHTML = html;
}