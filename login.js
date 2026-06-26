// ==================== ESTADO ====================
let adminState = {
    orders: [],
    availability: {},
    currentTab: 'dashboard'
};

// ==================== FIREBASE LISTENER ====================
function setupAdminFirebaseListener() {
    if (!window.firebaseDB) {
        console.error('Firebase no disponible');
        return;
    }

    console.log('🔗 Admin escuchando Firebase...');
    
    // Escuchar todas las órdenes
    window.firebaseDB.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        adminState.orders = [];

        if (data) {
            Object.values(data).forEach(order => {
                if (order) {
                    adminState.orders.push(order);
                }
            });
        }

        console.log('📦 Admin recibió órdenes:', adminState.orders.length);
        updateDashboard();
    });
}

// ==================== DATOS DE MENÚ ====================
const MENU = {
    burgers: [
        { id: 1, name: 'Special AB', price: 6500 },
        { id: 2, name: 'Xlibra Beef', price: 5000 },
        { id: 3, name: 'A-50/50', price: 6000 },
        { id: 4, name: 'B-Bacon', price: 6000 },
        { id: 5, name: 'C-Cheese', price: 6000 },
        { id: 6, name: 'D-Hot', price: 6000 },
        { id: 7, name: 'Texas', price: 6500 },
        { id: 8, name: 'B-Bacon Beef', price: 5500 },
        { id: 9, name: 'Italian', price: 6500 },
        { id: 10, name: 'Hawaiian', price: 6500 },
    ],
    chicken: [
        { id: 11, name: 'Classic Chicken', price: 5500 },
        { id: 12, name: 'Classic Chicken II', price: 6000 },
        { id: 13, name: 'Italian Chicken', price: 7000 },
        { id: 14, name: 'Chicken Texan', price: 7000 },
        { id: 15, name: 'Buffalo', price: 6500 },
    ],
    combos: [
        { id: 101, name: 'Italian Smashed', price: 7000 },
        { id: 102, name: 'Crispy Mushroom', price: 7000 },
        { id: 103, name: 'Hawaiian Smashed', price: 7000 },
        { id: 104, name: 'Smoked Pork', price: 8000 },
        { id: 105, name: 'Camarones', price: 8000 },
    ],
    sides: [
        { id: 201, name: 'Aros de Cebolla', price: 4000 },
        { id: 202, name: 'Mozzarella Sticks', price: 4000 },
        { id: 203, name: 'Papas Fritas', price: 3500 },
        { id: 204, name: 'Chili Cheese Fries', price: 5500 },
        { id: 205, name: 'Boneless Wings', price: 6500 },
        { id: 206, name: 'Fish and Chips', price: 6500 },
    ],
    bebidas: [
        { id: 301, name: 'Gaseosa', price: 1000 },
        { id: 302, name: 'Gaseosa Lata', price: 1500 },
        { id: 303, name: 'Té Frío', price: 1500 },
        { id: 304, name: 'Smoothie', price: 2000 },
        { id: 305, name: 'Natural', price: 1000 },
        { id: 306, name: 'Botella de Agua', price: 1000 },
    ]
};

function getAllProducts() {
    return Object.values(MENU).flat();
}

function formatPrice(amount) {
    return '₡' + Math.round(amount).toLocaleString('es-CR', { minimumFractionDigits: 0 });
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    const orders = adminState.orders;
    
    // Contar órdenes por estado
    const countNuevo = orders.filter(o => o.status === 'nuevo').length;
    const countPreparando = orders.filter(o => o.status === 'preparando').length;
    const countListo = orders.filter(o => o.status === 'listo').length;
    const countEntregado = orders.filter(o => o.status === 'entregado').length;

    // Calcular ingresos
    let totalRevenue = 0;
    orders.forEach(order => {
        totalRevenue += order.total || 0;
    });

    // Productos más vendidos
    const productCount = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productCount[item.name] = (productCount[item.name] || 0) + item.qty;
        });
    });

    const topProducts = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Mesa más activa
    const tableCount = {};
    orders.forEach(order => {
        tableCount['Mesa ' + order.table] = (tableCount['Mesa ' + order.table] || 0) + 1;
    });

    const mostActiveTable = Object.entries(tableCount)
        .sort((a, b) => b[1] - a[1])[0];

    // Actualizar HTML
    document.getElementById('statsNuevo').textContent = countNuevo;
    document.getElementById('statsPreparando').textContent = countPreparando;
    document.getElementById('statsListo').textContent = countListo;
    document.getElementById('statsEntregado').textContent = countEntregado;
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
    
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
    document.getElementById('avgTicket').textContent = formatPrice(avgTicket);
    
    if (mostActiveTable) {
        document.getElementById('mostActiveTable').textContent = mostActiveTable[0] + ' (' + mostActiveTable[1] + ' órdenes)';
    }

    // Productos top 5
    const topProductsHtml = topProducts.map((item, idx) => `
        <div class="top-product-item">
            <span>${idx + 1}. ${item[0]}</span>
            <span>${item[1]} vendidas</span>
        </div>
    `).join('');
    document.getElementById('topProducts').innerHTML = topProductsHtml || '<div style="color: #aaa;">Sin órdenes aún</div>';
}

// ==================== CIERRE DE CAJA ====================
function generateClosingPDF() {
    console.log('📄 Generando PDF de cierre de caja...');
    
    const orders = adminState.orders;
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CR');
    const timeStr = now.toLocaleTimeString('es-CR');

    // Cálculos
    let totalRevenue = 0;
    let totalTax = 0;
    orders.forEach(order => {
        totalRevenue += order.total || 0;
        totalTax += order.tax || 0;
    });
    const subtotal = totalRevenue - totalTax;

    // Crear contenido HTML para PDF
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    background: white;
                    color: #333;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #ffb800;
                    padding-bottom: 20px;
                }
                .logo {
                    font-size: 48px;
                    font-weight: 900;
                    color: #ffb800;
                    margin-bottom: 10px;
                    letter-spacing: 2px;
                }
                .subtitle {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .date-time {
                    font-size: 12px;
                    color: #999;
                    margin-top: 10px;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;
                    border-left: 4px solid #ffb800;
                    padding-left: 10px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #eee;
                    font-size: 14px;
                }
                .stat-label {
                    color: #666;
                    font-weight: 500;
                }
                .stat-value {
                    font-weight: 700;
                    color: #333;
                    font-size: 18px;
                }
                .stat-value.highlight {
                    color: #ffb800;
                }
                .summary-box {
                    background: #f9f9f9;
                    border: 2px solid #ffb800;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    font-size: 14px;
                }
                .summary-row.total {
                    font-weight: 700;
                    font-size: 18px;
                    color: #ffb800;
                    border-top: 2px solid #ffb800;
                    padding-top: 15px;
                    margin-top: 10px;
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                .product-card {
                    background: #f9f9f9;
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 3px solid #ffb800;
                }
                .product-name {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }
                .product-qty {
                    color: #666;
                    font-size: 13px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #ffb800;
                    color: #999;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">AB</div>
                <div class="subtitle">ABGB BURGERS</div>
                <div class="subtitle">Alajuela, Costa Rica</div>
                <div class="date-time">${dateStr} - ${timeStr}</div>
            </div>

            <div class="section">
                <div class="section-title">📊 Resumen de Órdenes</div>
                <div class="stat-row">
                    <span class="stat-label">Total de órdenes:</span>
                    <span class="stat-value highlight">${orders.length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Nuevas:</span>
                    <span class="stat-value">${orders.filter(o => o.status === 'nuevo').length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">En preparación:</span>
                    <span class="stat-value">${orders.filter(o => o.status === 'preparando').length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Listas para entregar:</span>
                    <span class="stat-value">${orders.filter(o => o.status === 'listo').length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Entregadas:</span>
                    <span class="stat-value">${orders.filter(o => o.status === 'entregado').length}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">💰 Ingresos</div>
                <div class="summary-box">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>IVA (13%):</span>
                        <span>${formatPrice(totalTax)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>TOTAL:</span>
                        <span>${formatPrice(totalRevenue)}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">🍔 Top 5 Productos Vendidos</div>
                <div class="product-grid">
                    ${Object.entries(adminState.orders.reduce((acc, order) => {
                        order.items.forEach(item => {
                            acc[item.name] = (acc[item.name] || 0) + item.qty;
                        });
                        return acc;
                    }, {}))
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, qty]) => `
                        <div class="product-card">
                            <div class="product-name">${name}</div>
                            <div class="product-qty">${qty} ${qty === 1 ? 'vendida' : 'vendidas'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="footer">
                <p>CIERRE DE CAJA - ABGB BURGERS</p>
                <p>Documento generado automáticamente</p>
            </div>
        </body>
        </html>
    `;

    // Crear PDF usando print
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// ==================== TABS ====================
function switchTab(tab) {
    adminState.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Iniciando Admin...');
    
    // Esperar Firebase
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        attempts++;
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            setupAdminFirebaseListener();
        } else if (attempts > 5) {
            clearInterval(checkFirebase);
            console.error('Firebase no disponible');
            NotificationManager.error('Firebase no disponible en Admin');
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