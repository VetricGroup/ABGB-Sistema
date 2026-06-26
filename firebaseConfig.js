// ==================== CONFIGURACIÓN FIREBASE ====================

// Esperar a que Firebase esté disponible globalmente
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK no está cargado');
        return;
    }

    const firebaseConfig = {
        apiKey: "AIzaSyDrrfV4P38FAg0_L3rXlBl5CmoUiAo5hJY",
        authDomain: "abgb-sistema.firebaseapp.com",
        databaseURL: "https://abgb-sistema-default-rtdb.firebaseio.com",
        projectId: "abgb-sistema",
        storageBucket: "abgb-sistema.firebasestorage.app",
        messagingSenderId: "391706802475",
        appId: "1:391706802475:web:b0ab5fc5750edda3582d6e",
        measurementId: "G-7CBQ88KWB9"
    };

    try {
        const app = firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        window.firebaseApp = app;
        window.firebaseDB = database;
        
        console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}