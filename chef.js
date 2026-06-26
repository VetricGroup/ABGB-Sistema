// ==================== ESTADO ====================
let state = {
    orders: []
};

// ==================== FIREBASE LISTENER ====================
function setupFirebaseListener() {
    if (!window.firebaseDB || !window.firebaseConnected) {
        updateDebugPanel('Firebase: ❌ DID NOT CONNECT', 'localStorage (THIS DEVICE ONLY)', 0);
        console.warn('Firebase no está disponible, usando localStorage');
        // Usar localStorage como fallback
        loadOrdersFromLocalStorage();
        // Polling cada 2 segundos
        setInterval(loadOrdersFromLocalStorage, 2000);
        return;
    }

    updateDebugPanel('Firebase: ✅ CONNECTED', 'Firebase (Real-time)', 0);

    try {
        // Escuchar cambios en ordenes en tiempo real
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

            // Ordenar por fecha descendente
            orders.sort((a, b) => b.id - a.id);
            state.orders = orders;
            updateDebugPanel('Firebase: ✅ CONNECTED', 'Firebase (Real-time)', orders.length);
            renderOrders();
        });
    } catch (error) {
        updateDebugPanel('Firebase: ❌ ERROR', 'localStorage (FALLBACK)', 0);
        console.warn('Error con Firebase listener, usando localStorage:', error);
        loadOrdersFromLocalStorage();
        setInterval(loadOrdersFromLocalStorage, 2000);
    }
}

// ==================== ACTUALIZAR PANEL DEBUG ====================
function updateDebugPanel(firebaseStatus, mode, orderCount) {
    const debugFirebase = document.getElementById('debugFirebase');
    const debugOrders = document.getElementById('debugOrders');
    const debugMode = document.getElementById('debugMode');
    
    if (debugFirebase) debugFirebase.textContent = firebaseStatus;
    if (debugOrders) debugOrders.textContent = `Órdenes: ${orderCount}`;
    if (debugMode) debugMode.textContent = `Modo: ${mode}`;
}

// ==================== CARGAR DE LOCALSTORAGE ====================
function loadOrdersFromLocalStorage() {
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    
    // Filtrar órdenes no entregadas
    const activeOrders = orders.filter(o => o.status !== 'entregado');
    
    // Ordenar por fecha descendente
    activeOrders.sort((a, b) => b.id - a.id);
    
    state.orders = activeOrders;
    renderOrders();
}

// ==================== UTILIDADES ====================
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

function updateStatus(orderId, newStatus) {
    if (window.firebaseDB) {
        window.firebaseDB.ref('orders/' + orderId + '/status').set(newStatus).then(() => {
            // También actualizar en localStorage
            const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                localStorage.setItem('abgb_orders', JSON.stringify(orders));
            }
            loadOrdersFromLocalStorage();
        }).catch(() => {
            // Si Firebase falla, usar localStorage
            const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                localStorage.setItem('abgb_orders', JSON.stringify(orders));
            }
            loadOrdersFromLocalStorage();
        });
    } else {
        // Sin Firebase, usar localStorage directamente
        const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            localStorage.setItem('abgb_orders', JSON.stringify(orders));
        }
        loadOrdersFromLocalStorage();
    }
}

function removeOrder(orderId) {
    if (window.firebaseDB) {
        window.firebaseDB.ref('orders/' + orderId).remove().then(() => {
            // También remover de localStorage
            const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
            const filtered = orders.filter(o => o.id !== orderId);
            localStorage.setItem('abgb_orders', JSON.stringify(filtered));
            loadOrdersFromLocalStorage();
        }).catch(() => {
            // Si Firebase falla, usar localStorage
            const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
            const filtered = orders.filter(o => o.id !== orderId);
            localStorage.setItem('abgb_orders', JSON.stringify(filtered));
            loadOrdersFromLocalStorage();
        });
    } else {
        // Sin Firebase, usar localStorage directamente
        const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
        const filtered = orders.filter(o => o.id !== orderId);
        localStorage.setItem('abgb_orders', JSON.stringify(filtered));
        loadOrdersFromLocalStorage();
    }
}

function renderOrders() {
    const grid = document.getElementById('ordersGrid');
    const orders = state.orders;

    if (orders.length === 0) {
        grid.innerHTML = '<div class="empty-state">Sin órdenes activas</div>';
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

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase esté listo (con timeout)
    let firebaseReady = false;
    let attempts = 0;
    
    console.log('🔧 Iniciando Chef...');
    updateDebugPanel('Firebase: ⏳ Conectando...', 'Esperando...', 0);
    
    const checkFirebase = setInterval(() => {
        attempts++;
        console.log(`⏳ Intento ${attempts}: ¿Firebase disponible?`, window.firebaseDB ? '✅ SÍ' : '❌ NO');
        
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            console.log('✅ Firebase CONECTADO - Iniciando listener en tiempo real');
            updateDebugPanel('Firebase: ✅ CONECTADO', 'Firebase (Tiempo Real)', 0);
            setupFirebaseListener();
            firebaseReady = true;
        } else if (attempts > 5) {
            // Después de 1 segundo, usar localStorage como fallback
            clearInterval(checkFirebase);
            console.warn('❌ Firebase NO se inicializó después de 5 intentos - Usando localStorage (SOLO DISPOSITIVO LOCAL)');
            updateDebugPanel('Firebase: ❌ NO CONECTÓ', 'localStorage (SOLO ESTE DISPOSITIVO)', 0);
            loadOrdersFromLocalStorage();
        }
    }, 200);

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

    // Sincronización: detectar cambios en localStorage desde otro dispositivo
    window.addEventListener('storage', () => {
        loadOrdersFromLocalStorage();
    });

    // Polling cada 2 segundos para detectar cambios
    setInterval(() => {
        loadOrdersFromLocalStorage();
    }, 2000);
});