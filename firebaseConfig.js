// ==================== CONFIGURACIÓN FIREBASE ====================

// Esperar a que Firebase esté completamente disponible
function initFirebase() {
    // Verificar si firebase está disponible
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK aún no está cargado, reintentando...');
        setTimeout(initFirebase, 500);
        return;
    }

    // Verificar si ya fue inicializado
    if (window.firebaseApp) {
        console.log('✅ Firebase ya está inicializado');
        return;
    }

    const firebaseConfig = {
        apiKey: "AIzaSyDrrfV4P38FAg0_L3rXlBl5CmoUiAo5hJY",
        authDomain: "abgb-sistema.firebaseapp.com",
        databaseURL: "https://abgb-sistema-default-rtdb.firebaseio.com",
        projectId: "abgb-sistema",
        storageBucket: "abgb-sistema.firebasestorage.app",
        messagingSenderId: "391706802475",
        appId: "1:391706802475:web:b0ab5fc5750edda3582d6e"
    };

    try {
        const app = firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        window.firebaseApp = app;
        window.firebaseDB = database;
        
        console.log('✅ Firebase inicializado correctamente');
        window.dispatchEvent(new Event('firebaseReady'));
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error.message);
        // Reintenta después de 1 segundo
        setTimeout(initFirebase, 1000);
    }
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFirebase, 100);
    });
} else {
    setTimeout(initFirebase, 100);
}

// También intenta inicializar inmediatamente
setTimeout(initFirebase, 100);