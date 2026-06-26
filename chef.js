// ==================== ESTADO ====================
let state = {
    orders: [],
    lastCheck: 0
};

// ==================== CARGAR DE LOCALSTORAGE ====================
function loadOrdersFromLocalStorage() {
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    
    // Filtrar órdenes no entregadas
    const activeOrders = orders.filter(o => o.status !== 'entregado');
    
    // Ordenar por fecha descendente
    activeOrders.sort((a, b) => b.id - a.id);
    
    // Solo actualizar si hay cambios
    if (JSON.stringify(state.orders) !== JSON.stringify(activeOrders)) {
        state.orders = activeOrders;
        renderOrders();
    }
}

// ==================== FIREBASE LISTENER (como bonus) ====================
function setupFirebaseListener() {
    if (!window.firebaseDB) {
        console.warn('Firebase no disponible - Usando localStorage');
        updateDebugPanel('Firebase: ❌ NO SYNC', 'localStorage (POLLING)', 0);
        loadOrdersFromLocalStorage();
        // Polling AGRESIVO cada 500ms
        setInterval(loadOrdersFromLocalStorage, 500);
        return;
    }

    try {
        console.log('Intentando sincronizar con Firebase...');
        window.firebaseDB.ref('orders').on('value', (snapshot) => {
            const data = snapshot.val();
            const orders = [];

            if (data) {
                Object.values(data).forEach(order => {
                    if (order.status !== 'entregado') {
                        orders.push(order);
                    }
                });
            }

            orders.sort((a, b) => b.id - a.id);
            state.orders = orders;
            updateDebugPanel('Firebase: ✅ SYNC', 'Firebase + localStorage', orders.length);
            renderOrders();
        });
    } catch (error) {
        console.warn('Error Firebase, usando localStorage:', error);
        updateDebugPanel('Firebase: ❌ ERROR', 'localStorage (POLLING)', 0);
        loadOrdersFromLocalStorage();
        setInterval(loadOrdersFromLocalStorage, 500);
    }
}

// ==================== UTILIDADES ====================
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

function updateStatus(orderId, newStatus) {
    // PRIMERO: actualizar en localStorage
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('abgb_orders', JSON.stringify(orders));
    }
    
    // SEGUNDO: intentar actualizar en Firebase
    if (window.firebaseDB) {
        try {
            window.firebaseDB.ref('orders/' + orderId + '/status').set(newStatus).catch(() => {
                console.warn('Firebase falló, pero localStorage está actualizado');
            });
        } catch (e) {}
    }
    
    loadOrdersFromLocalStorage();
}

function removeOrder(orderId) {
    // PRIMERO: actualizar en localStorage
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem('abgb_orders', JSON.stringify(filtered));
    
    // SEGUNDO: intentar actualizar en Firebase
    if (window.firebaseDB) {
        try {
            window.firebaseDB.ref('orders/' + orderId).remove().catch(() => {
                console.warn('Firebase falló, pero localStorage está actualizado');
            });
        } catch (e) {}
    }
    
    loadOrdersFromLocalStorage();
}

function renderOrders() {
    const grid = document.getElementById('ordersGrid');
    const orders = state.orders;

    if (orders.length === 0) {
        grid.innerHTML = '<div class="empty-state">Sin órdenes activas</div>';
        updateDebugPanel(
            window.firebaseConnected ? 'Firebase: ✅ SYNC' : 'Firebase: ❌ NO SYNC',
            window.firebaseConnected ? 'Firebase + localStorage' : 'localStorage (POLLING)',
            0
        );
    } else {
        grid.innerHTML = orders.map(order => `
            <div class="order-card ${order.status}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-id">Mesa #${order.table}</div>
                        <div class="order-meta">
                            Orden #${order.id} • ${order.createdAt}
                        </div>
                    </div>
                    <div class="order-badge">${order.status.toUpperCase()}</div>
                </div>

                <div class="order-body">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-name">${item.name}</div>
                            <div class="item-qty">×${item.qty}</div>
                        </div>
                        ${item.special && item.special.length > 0 ? `
                            <div class="item-special">
                                Especial: ${item.special.join(', ')}
                                ${item.customNotes ? '<br>' + item.customNotes : ''}
                            </div>
                        ` : ''}
                    `).join('')}
                </div>

                <div class="order-footer">
                    ${order.status === 'nuevo' ? `
                        <button class="btn-action primary" onclick="updateStatus(${order.id}, 'preparando')">
                            En Preparación
                        </button>
                    ` : ''}
                    
                    ${order.status === 'preparando' ? `
                        <button class="btn-action primary" onclick="updateStatus(${order.id}, 'listo')">
                            Marcar Listo
                        </button>
                    ` : ''}
                    
                    ${order.status === 'listo' ? `
                        <button class="btn-action primary" onclick="updateStatus(${order.id}, 'entregado')">
                            Entregar
                        </button>
                    ` : ''}
                    
                    <button class="btn-action danger" onclick="removeOrder(${order.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
        
        updateDebugPanel(
            window.firebaseConnected ? 'Firebase: ✅ SYNC' : 'Firebase: ❌ NO SYNC',
            window.firebaseConnected ? 'Firebase + localStorage' : 'localStorage (POLLING)',
            orders.length
        );
    }

    updateStatusCounts();
}

function updateStatusCounts() {
    const orders = state.orders;
    
    const countNuevo = orders.filter(o => o.status === 'nuevo').length;
    const countPreparando = orders.filter(o => o.status === 'preparando').length;
    const countListo = orders.filter(o => o.status === 'listo').length;

    document.getElementById('countNuevo').textContent = countNuevo;
    document.getElementById('countPreparando').textContent = countPreparando;
    document.getElementById('countListo').textContent = countListo;
}

function updateDebugPanel(firebaseStatus, mode, orderCount) {
    const debugFirebase = document.getElementById('debugFirebase');
    const debugOrders = document.getElementById('debugOrders');
    const debugMode = document.getElementById('debugMode');
    
    if (debugFirebase) debugFirebase.textContent = firebaseStatus;
    if (debugOrders) debugOrders.textContent = `Órdenes: ${orderCount}`;
    if (debugMode) debugMode.textContent = `Modo: ${mode}`;
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Iniciando Chef...');
    
    // Intentar Firebase (opcional, es un bonus)
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        attempts++;
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            setupFirebaseListener();
        } else if (attempts > 3) {
            clearInterval(checkFirebase);
            console.log('Firebase no disponible - Modo localStorage');
            setupFirebaseListener();
        }
    }, 100);

    // SIEMPRE cargar desde localStorage PRIMERO
    loadOrdersFromLocalStorage();
    renderOrders();
    updateTime();
    setInterval(updateTime, 60000);

    // Cerrar sesión
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('abgb_user_logged_in');
            localStorage.removeItem('abgb_user_role');
            window.location.href = 'login.html';
        }
    });

    // Polling AGRESIVO cada 500ms para detectar cambios
    setInterval(() => {
        loadOrdersFromLocalStorage();
    }, 500);
});