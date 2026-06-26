// ==================== CONFIGURACIÓN FIREBASE - VERSIÓN ULTRA-ROBUSTA ====================

console.log('📦 Cargando firebaseConfig.js...');

// Verificar si Firebase SDK está cargado
let firebaseLoadAttempts = 0;
const maxAttempts = 20;

function checkAndInitFirebase() {
    firebaseLoadAttempts++;
    
    console.log(`🔍 Intento ${firebaseLoadAttempts}/${maxAttempts}: ¿Firebase disponible?`);
    
    // Verificar firebase global
    if (typeof firebase === 'undefined') {
        console.warn(`⏳ Firebase SDK aún no cargado (${firebaseLoadAttempts}/${maxAttempts})`);
        if (firebaseLoadAttempts < maxAttempts) {
            setTimeout(checkAndInitFirebase, 200);
        } else {
            console.error('❌ FALLO: Firebase SDK no se cargó después de 20 intentos');
            window.firebaseConnected = false;
        }
        return;
    }
    
    // Firebase está disponible, intentar inicializar
    if (window.firebaseApp) {
        console.log('✅ Firebase ya inicializado previamente');
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
        console.log('🔌 Inicializando Firebase con config...');
        const app = firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase app inicializado');
        
        const database = firebase.database();
        console.log('✅ Database reference obtenida');
        
        // Guardar referencias globales
        window.firebaseApp = app;
        window.firebaseDB = database;
        
        // Verificar conexión en tiempo real
        console.log('🔗 Verificando conexión en tiempo real...');
        database.ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true) {
                console.log('✅✅✅ CONECTADO A FIREBASE EN TIEMPO REAL! ✅✅✅');
                window.firebaseConnected = true;
                window.dispatchEvent(new Event('firebaseReady'));
            } else {
                console.warn('⚠️ Firebase desconectado');
                window.firebaseConnected = false;
            }
        });
        
        console.log('✅ Firebase completamente listo!');
        
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error.message);
        console.error('Stack:', error.stack);
        window.firebaseConnected = false;
        
        // Reintentar
        if (firebaseLoadAttempts < maxAttempts) {
            console.log('🔄 Reintentando en 300ms...');
            setTimeout(checkAndInitFirebase, 300);
        }
    }
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    console.log('⏳ Esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOMContentLoaded disparado');
        setTimeout(checkAndInitFirebase, 100);
    });
} else {
    console.log('✅ DOM ya cargado');
    setTimeout(checkAndInitFirebase, 100);
}

// También intentar inmediatamente
setTimeout(checkAndInitFirebase, 50);

console.log('📦 firebaseConfig.js cargado');