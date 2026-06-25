// ==================== DATOS DE MENÚ ====================
const MENU = {
    burgers: [
        { id: 1, name: 'Special AB', category: 'Angus' },
        { id: 2, name: 'Xlibra Beef', category: 'Angus' },
        { id: 3, name: 'A-50/50', category: 'Angus' },
        { id: 4, name: 'B-Bacon', category: 'Angus' },
        { id: 5, name: 'C-Cheese', category: 'Angus' },
        { id: 6, name: 'D-Hot', category: 'Angus' },
        { id: 7, name: 'Texas', category: 'Angus' },
        { id: 8, name: 'B-Bacon Beef', category: 'Angus' },
        { id: 9, name: 'Italian', category: 'Angus' },
        { id: 10, name: 'Hawaiian', category: 'Angus' },
    ],
    chicken: [
        { id: 11, name: 'Classic Chicken', category: 'Pollo' },
        { id: 12, name: 'Classic Chicken II', category: 'Pollo' },
        { id: 13, name: 'Italian Chicken', category: 'Pollo' },
        { id: 14, name: 'Chicken Texan', category: 'Pollo' },
        { id: 15, name: 'Buffalo', category: 'Pollo' },
    ],
    combos: [
        { id: 101, name: 'Italian Smashed', category: 'Smashed' },
        { id: 102, name: 'Crispy Mushroom', category: 'Smashed' },
        { id: 103, name: 'Hawaiian Smashed', category: 'Smashed' },
        { id: 104, name: 'Smoked Pork', category: 'Smashed' },
        { id: 105, name: 'Camarones', category: 'Smashed' },
    ],
    sides: [
        { id: 201, name: 'Aros de Cebolla', category: 'Acompañamientos' },
        { id: 202, name: 'Mozzarella Sticks', category: 'Acompañamientos' },
        { id: 203, name: 'Papas Fritas', category: 'Acompañamientos' },
        { id: 204, name: 'Chili Cheese Fries', category: 'Acompañamientos' },
        { id: 205, name: 'Boneless Wings', category: 'Acompañamientos' },
        { id: 206, name: 'Fish and Chips', category: 'Acompañamientos' },
    ],
    bebidas: [
        { id: 301, name: 'Gaseosa', category: 'Bebidas' },
        { id: 302, name: 'Gaseosa Lata', category: 'Bebidas' },
        { id: 303, name: 'Té Frío', category: 'Bebidas' },
        { id: 304, name: 'Smoothie', category: 'Bebidas' },
        { id: 305, name: 'Natural', category: 'Bebidas' },
        { id: 306, name: 'Botella de Agua', category: 'Bebidas' },
    ]
};

// ==================== UTILIDADES ====================
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

function formatPrice(amount) {
    return '₡' + Math.round(amount).toLocaleString('es-CR', { minimumFractionDigits: 0 });
}

function getAllProducts() {
    return Object.values(MENU).flat();
}

function loadAvailability() {
    const availability = JSON.parse(localStorage.getItem('abgb_availability') || '{}');
    
    // Inicializar todos los productos como disponibles
    getAllProducts().forEach(product => {
        if (!(product.id in availability)) {
            availability[product.id] = true;
        }
    });
    
    return availability;
}

function saveAvailability(availability) {
    localStorage.setItem('abgb_availability', JSON.stringify(availability));
    // Notificar a otros que cambiaron disponibilidades
    window.dispatchEvent(new Event('storageChange'));
}

function toggleAvailability(productId) {
    const availability = loadAvailability();
    availability[productId] = !availability[productId];
    saveAvailability(availability);
    renderAvailability();
}

// ==================== DISPONIBILIDAD ====================
function renderAvailability() {
    const availability = loadAvailability();
    const products = getAllProducts();
    const grid = document.getElementById('availabilityGrid');

    grid.innerHTML = products.map(product => {
        const isAvailable = availability[product.id];
        const unavailableClass = !isAvailable ? 'unavailable' : '';

        return `
            <div class="product-availability ${unavailableClass}" onclick="toggleAvailability(${product.id})">
                <div class="product-name">${product.name}</div>
                <button class="toggle ${!isAvailable ? 'off' : ''}">
                    ${isAvailable ? 'OK' : 'X'}
                </button>
            </div>
        `;
    }).join('');
}

// ==================== HISTORIAL ====================
function renderHistorial() {
    const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
    const container = document.getElementById('historyList');

    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin historial de órdenes</div>';
        return;
    }

    container.innerHTML = history.reverse().map(order => `
        <div class="history-item">
            <div class="history-order-id">Orden #${order.id} - Mesa #${order.table} - ${order.createdAt}</div>
            <div class="history-details">
                ${order.items.map(i => `${i.name} (×${i.qty})`).join(' | ')}<br>
                Total: ${formatPrice(order.total)}
            </div>
        </div>
    `).join('');
}

// ==================== REPORTES ====================
function renderReports() {
    const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');

    const totalOrders = history.length;
    const totalRevenue = history.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Mesa más activa
    const tableCount = {};
    history.forEach(o => {
        tableCount[o.table] = (tableCount[o.table] || 0) + 1;
    });
    const mostActiveTable = Object.entries(tableCount).length > 0
        ? Object.entries(tableCount).sort((a, b) => b[1] - a[1])[0][0]
        : '-';

    // Top 5 productos
    const productCount = {};
    history.forEach(o => {
        o.items.forEach(i => {
            productCount[i.name] = (productCount[i.name] || 0) + i.qty;
        });
    });
    const topProducts = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Actualizar valores
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
    document.getElementById('avgTicket').textContent = formatPrice(avgTicket);
    document.getElementById('mostActiveTable').textContent = mostActiveTable ? `Mesa #${mostActiveTable}` : '-';

    // Top productos
    const topList = document.getElementById('topProductsList');
    if (topProducts.length === 0) {
        topList.innerHTML = '<div class="empty-state">Sin datos</div>';
    } else {
        topList.innerHTML = topProducts.map(([name, count]) => `
            <div class="top-product-item">
                <span class="top-product-name">${name}</span>
                <span class="top-product-count">${count} unidades</span>
            </div>
        `).join('');
    }
}

// ==================== CIERRE DE CAJA ====================
function renderCierreData() {
    const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
    
    const totalVendido = history.reduce((sum, o) => sum + o.total, 0);
    const taxes = Math.round(totalVendido * 0.13 / 1.13);
    const totalOrders = history.length;
    const avgTicket = totalOrders > 0 ? totalVendido / totalOrders : 0;

    document.getElementById('cierreTotalVendido').textContent = formatPrice(totalVendido);
    document.getElementById('cierreTaxes').textContent = formatPrice(taxes);
    document.getElementById('cierreTotalOrders').textContent = totalOrders;
    document.getElementById('cierreAvgTicket').textContent = formatPrice(avgTicket);

    renderCierreHistory();
}

function renderCierreHistory() {
    const closures = JSON.parse(localStorage.getItem('abgb_closures') || '[]');
    const container = document.getElementById('cierreHistory');

    if (closures.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin cierres realizados</div>';
        return;
    }

    container.innerHTML = closures.reverse().map(closure => `
        <div class="cierre-item">
            <div class="cierre-date">${closure.date}</div>
            <div class="cierre-details">
                Total: ${formatPrice(closure.totalVendido)} | 
                Órdenes: ${closure.totalOrders} | 
                Ticket Promedio: ${formatPrice(closure.avgTicket)}
            </div>
        </div>
    `).join('');
}

function closeCashRegister() {
    const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
    
    if (history.length === 0) {
        alert('No hay órdenes para cerrar');
        return;
    }

    if (!confirm('¿Cerrar caja y limpiar historial? Esta acción no se puede deshacer.')) {
        return;
    }

    const totalVendido = history.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = history.length;
    const avgTicket = totalOrders > 0 ? totalVendido / totalOrders : 0;

    const closure = {
        date: new Date().toLocaleString('es-CR'),
        totalVendido: totalVendido,
        totalOrders: totalOrders,
        avgTicket: avgTicket
    };

    const closures = JSON.parse(localStorage.getItem('abgb_closures') || '[]');
    closures.push(closure);
    localStorage.setItem('abgb_closures', JSON.stringify(closures));

    // Limpiar historial
    localStorage.removeItem('abgb_history');

    renderCierreData();
    renderHistorial();
    renderReports();
    alert('Caja cerrada exitosamente');
}

// ==================== TABS ====================
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remover active
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Agregar active
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
            
            // Renderizar contenido
            if (tabName === 'disponibilidad') {
                renderAvailability();
            } else if (tabName === 'historial') {
                renderHistorial();
            } else if (tabName === 'reportes') {
                renderReports();
            } else if (tabName === 'cierre') {
                renderCierreData();
            }
        });
    });
}

// ==================== CERRAR SESIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    renderAvailability();
    renderHistorial();
    renderReports();
    renderCierreData();
    updateTime();
    setInterval(updateTime, 60000);

    // Botón exportar
    document.getElementById('btnExport').addEventListener('click', () => {
        const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
        let txt = 'HISTORIAL DE ÓRDENES ABGB\n';
        txt += '========================\n\n';
        
        history.forEach(o => {
            txt += `Orden #${o.id}\n`;
            txt += `Mesa: #${o.table} | Hora: ${o.createdAt}\n`;
            txt += `Items:\n`;
            o.items.forEach(i => {
                txt += `  - ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}\n`;
            });
            txt += `Total: ${formatPrice(o.total)}\n`;
            txt += '---\n\n';
        });

        const blob = new Blob([txt], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    });

    // Botón limpiar
    document.getElementById('btnClear').addEventListener('click', () => {
        if (confirm('¿Borrar todo el historial? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('abgb_history');
            renderHistorial();
            renderReports();
        }
    });

    // Botones de cierre de caja
    if (document.getElementById('btnGenerateCierreReport')) {
        document.getElementById('btnGenerateCierreReport').addEventListener('click', () => {
            const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
            let txt = 'REPORTE DE CIERRE DE CAJA\n';
            txt += '========================\n';
            txt += `Fecha: ${new Date().toLocaleString('es-CR')}\n\n`;
            
            const totalVendido = history.reduce((sum, o) => sum + o.total, 0);
            const taxes = Math.round(totalVendido * 0.13 / 1.13);
            const totalOrders = history.length;
            const avgTicket = totalOrders > 0 ? totalVendido / totalOrders : 0;

            txt += `Total Vendido: ${formatPrice(totalVendido)}\n`;
            txt += `Impuestos (13%): ${formatPrice(taxes)}\n`;
            txt += `Total Órdenes: ${totalOrders}\n`;
            txt += `Ticket Promedio: ${formatPrice(avgTicket)}\n\n`;
            txt += 'Detalle de Órdenes:\n';
            txt += '---\n';
            
            history.forEach(o => {
                txt += `Orden #${o.id} - Mesa #${o.table} - ${o.createdAt}\n`;
                txt += `Total: ${formatPrice(o.total)}\n`;
                txt += '---\n';
            });

            const blob = new Blob([txt], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cierre_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
        });
    }

    if (document.getElementById('btnCloseCash')) {
        document.getElementById('btnCloseCash').addEventListener('click', closeCashRegister);
    }

    // Cerrar sesión
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('abgb_user_logged_in');
            localStorage.removeItem('abgb_user_role');
            window.location.href = 'login.html';
        }
    });

    // Sincronización: detectar cambios desde mesero
    window.addEventListener('storage', () => {
        renderHistorial();
        renderReports();
        renderAvailability();
    });
});