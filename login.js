// ==================== CREDENCIALES ====================
const CREDENTIALS = {
    mesero: 'mesero123',
    chef: 'chef123',
    admin: 'admin123'
};

// ==================== VALIDAR LOGIN ====================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Validar
    if (!role || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    if (CREDENTIALS[role] !== password) {
        showError('Contraseña incorrecta');
        return;
    }

    // Guardar sesión
    localStorage.setItem('abgb_user_role', role);
    localStorage.setItem('abgb_user_logged_in', 'true');
    localStorage.setItem('abgb_login_time', new Date().toISOString());

    // Redirigir
    window.location.href = `${role}.html`;
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4000);
}

// ==================== CHECAR SI YA ESTÁ LOGUEADO ====================
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('abgb_user_logged_in');
    const userRole = localStorage.getItem('abgb_user_role');
    
    if (isLoggedIn && userRole) {
        // Si está logueado, redirige a su página
        window.location.href = `${userRole}.html`;
    }
});