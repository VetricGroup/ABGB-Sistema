// ==================== ESTADO ====================
let state = {
    orders: []
};

// ==================== FIREBASE LISTENER ====================
function setupFirebaseListener() {
    if (!window.firebaseDB) {
        console.error('Firebase no está inicializado');
        return;
    }

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
        renderOrders();
    });
}

// ==================== UTILIDADES ====================
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    state.orders = orders.filter(o => o.status !== 'entregado');
    return state.orders;
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
            renderOrders();
        });
    }
}

function removeOrder(orderId) {
    if (window.firebaseDB) {
        window.firebaseDB.ref('orders/' + orderId).remove().then(() => {
            // También remover de localStorage
            const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
            const filtered = orders.filter(o => o.id !== orderId);
            localStorage.setItem('abgb_orders', JSON.stringify(filtered));
            renderOrders();
        });
    }
}

function renderOrders() {
    const orders = loadOrders();
    const grid = document.getElementById('ordersGrid');

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
    // Esperar a que Firebase esté listo
    let firebaseReady = false;
    let attempts = 0;
    
    const checkFirebase = setInterval(() => {
        attempts++;
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            setupFirebaseListener();
            firebaseReady = true;
        } else if (attempts > 10) {
            clearInterval(checkFirebase);
            console.error('Firebase no se inicializó');
            // Usar localStorage como fallback
            loadOrders();
            renderOrders();
        }
    }, 200);

    loadOrders();
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

    // Sincronización: detectar nuevos pedidos
    window.addEventListener('storage', () => {
        renderOrders();
    });

    // Polling cada 2 segundos para detectar cambios
    setInterval(() => {
        renderOrders();
    }, 2000);
});