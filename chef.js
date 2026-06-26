// ==================== ESTADO ====================
let state = {
    orders: [],
    orderIds: new Set()
};

// ==================== FIREBASE LISTENER ====================
function setupFirebaseListener() {
    if (!window.firebaseDB) {
        console.error('❌ Firebase no disponible');
        updateDebugPanel('Firebase: ❌ NO CONNECT', 'ERROR', 0);
        return;
    }

    console.log('🔗 Escuchando Firebase en tiempo real...');
    
    try {
        // Escuchar SOLO órdenes nuevas
        window.firebaseDB.ref('orders').on('child_added', (snapshot) => {
            const order = snapshot.val();
            if (order && !state.orderIds.has(order.id)) {
                state.orderIds.add(order.id);
                if (order.status !== 'entregado') {
                    state.orders.push(order);
                }
                console.log('📦 Orden nueva:', order.id);
                refreshOrders();
            }
        });

        // Escuchar cambios en órdenes existentes
        window.firebaseDB.ref('orders').on('child_changed', (snapshot) => {
            const order = snapshot.val();
            const index = state.orders.findIndex(o => o.id === order.id);
            
            if (order.status === 'entregado') {
                // Eliminar órdenes entregadas
                if (index !== -1) {
                    state.orders.splice(index, 1);
                }
            } else if (index !== -1) {
                // Actualizar orden existente
                state.orders[index] = order;
            } else if (index === -1 && order.status !== 'entregado') {
                // Agregar si no existe
                state.orders.push(order);
            }
            
            console.log('🔄 Orden actualizada:', order.id);
            refreshOrders();
        });

        // Escuchar órdenes eliminadas
        window.firebaseDB.ref('orders').on('child_removed', (snapshot) => {
            const order = snapshot.val();
            const index = state.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
                state.orders.splice(index, 1);
                state.orderIds.delete(order.id);
            }
            console.log('🗑️ Orden eliminada:', order.id);
            refreshOrders();
        });

    } catch (error) {
        console.error('❌ Error Firebase:', error);
        updateDebugPanel('Firebase: ❌ ERROR', 'ERROR', 0);
    }
}

// ==================== ACTUALIZAR VISTA ====================
function refreshOrders() {
    // Ordenar por fecha descendente
    state.orders.sort((a, b) => b.id - a.id);
    
    updateDebugPanel('Firebase: ✅ SYNC', 'Firebase Real-time', state.orders.length);
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
        console.log('🔄 Actualizando orden:', orderId, '→', newStatus);
        window.firebaseDB.ref('orders/' + orderId + '/status').set(newStatus).then(() => {
            console.log('✅ Estado actualizado');
        }).catch((error) => {
            console.error('❌ Error actualizando:', error);
        });
    }
}

function removeOrder(orderId) {
    if (window.firebaseDB) {
        console.log('🗑️ Eliminando orden:', orderId);
        window.firebaseDB.ref('orders/' + orderId).remove().then(() => {
            console.log('✅ Orden eliminada');
        }).catch((error) => {
            console.error('❌ Error eliminando:', error);
        });
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
    
    // Esperar a Firebase
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        attempts++;
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            console.log('✅ Firebase disponible - Iniciando listener');
            setupFirebaseListener();
        } else if (attempts > 5) {
            clearInterval(checkFirebase);
            console.error('❌ Firebase no disponible');
            updateDebugPanel('Firebase: ❌ NOT LOADED', 'ERROR', 0);
        }
    }, 100);

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
});