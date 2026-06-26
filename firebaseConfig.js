// ==================== CONFIGURACIÓN FIREBASE ====================

function initFirebase() {
    // Verificar si firebase está disponible
    if (typeof firebase === 'undefined') {
        console.warn('⏳ Firebase SDK aún no está cargado, reintentando...');
        setTimeout(initFirebase, 300);
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
        console.log('🔌 Intentando conectar a Firebase...');
        const app = firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        // Probar conexión
        database.ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true) {
                console.log('✅ CONECTADO A FIREBASE!');
                window.firebaseApp = app;
                window.firebaseDB = database;
                window.firebaseConnected = true;
                window.dispatchEvent(new Event('firebaseReady'));
            } else {
                console.warn('❌ Firebase desconectado');
                window.firebaseConnected = false;
            }
        });
        
        window.firebaseApp = app;
        window.firebaseDB = database;
        console.log('✅ Firebase SDK inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error.message);
        console.error('Detalles:', error);
        // Reintenta después de 500ms
        setTimeout(initFirebase, 500);
    }
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFirebase, 50);
    });
} else {
    setTimeout(initFirebase, 50);
}

// También intenta inicializar inmediatamente
setTimeout(initFirebase, 50);