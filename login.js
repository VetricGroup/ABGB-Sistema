// ==================== VALIDACIÓN DE LOGIN ====================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    // Credenciales correctas
    const validCredentials = {
        mesero: 'mesero123',
        chef: 'chef123',
        admin: 'admin123'
    };

    // Validar
    if (!role) {
        showError('Selecciona un rol');
        return;
    }

    if (!password) {
        showError('Ingresa tu contraseña');
        return;
    }

    if (validCredentials[role] !== password) {
        showError('Contraseña incorrecta');
        return;
    }

    // Éxito - guardar sesión
    console.log('✅ Login exitoso:', role);
    localStorage.setItem('abgb_user_logged_in', 'true');
    localStorage.setItem('abgb_user_role', role);

    // Mostrar notificación de éxito
    NotificationManager.success('¡Bienvenido ' + role + '!', 2000);

    // Redirigir después de 1 segundo
    setTimeout(() => {
        if (role === 'mesero') {
            window.location.href = 'mesero.html';
        } else if (role === 'chef') {
            window.location.href = 'chef.html';
        } else if (role === 'admin') {
            window.location.href = 'admin.html';
        }
    }, 1000);
});

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = '❌ ' + message;
    errorMsg.style.display = 'block';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

// Verificar si ya está logueado
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('abgb_user_logged_in');
    const role = localStorage.getItem('abgb_user_role');

    if (isLoggedIn && role) {
        // Ya tiene sesión activa
        if (role === 'mesero') {
            window.location.href = 'mesero.html';
        } else if (role === 'chef') {
            window.location.href = 'chef.html';
        } else if (role === 'admin') {
            window.location.href = 'admin.html';
        }
    }
});