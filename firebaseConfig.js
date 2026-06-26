// ==================== CONFIGURACIÓN FIREBASE - CON AUTO-RECONEXIÓN ====================

console.log('📦 Cargando firebaseConfig.js...');

let firebaseLoadAttempts = 0;
const maxAttempts = 30;
let reconnectAttempts = 0;

function checkAndInitFirebase() {
    firebaseLoadAttempts++;
    
    console.log(`🔍 Intento ${firebaseLoadAttempts}/${maxAttempts}: ¿Firebase disponible?`);
    
    if (typeof firebase === 'undefined') {
        console.warn(`⏳ Firebase SDK aún no cargado (${firebaseLoadAttempts}/${maxAttempts})`);
        if (firebaseLoadAttempts < maxAttempts) {
            setTimeout(checkAndInitFirebase, 200);
        } else {
            console.error('❌ FALLO: Firebase SDK no se cargó');
            window.firebaseConnected = false;
        }
        return;
    }
    
    if (window.firebaseApp) {
        console.log('✅ Firebase ya inicializado');
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
        console.log('🔌 Inicializando Firebase...');
        const app = firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        window.firebaseApp = app;
        window.firebaseDB = database;
        
        // Monitorear conexión en tiempo real
        console.log('🔗 Monitoreando conexión...');
        database.ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true) {
                console.log('✅✅✅ CONECTADO A FIREBASE EN TIEMPO REAL ✅✅✅');
                window.firebaseConnected = true;
                reconnectAttempts = 0;
                window.dispatchEvent(new Event('firebaseReady'));
            } else {
                console.warn('⚠️ Firebase DESCONECTADO - Intentando reconectar...');
                window.firebaseConnected = false;
                attemptReconnect();
            }
        });
        
        console.log('✅ Firebase listo!');
        
    } catch (error) {
        console.error('❌ Error Firebase:', error.message);
        window.firebaseConnected = false;
        
        if (firebaseLoadAttempts < maxAttempts) {
            setTimeout(checkAndInitFirebase, 300);
        }
    }
}

// Reconexión automática
function attemptReconnect() {
    reconnectAttempts++;
    const delay = Math.min(1000 * reconnectAttempts, 10000); // Max 10 segundos
    
    console.log(`🔄 Reconectando en ${delay}ms (intento ${reconnectAttempts})...`);
    
    setTimeout(() => {
        if (window.firebaseDB) {
            console.log('🔗 Verificando conexión nuevamente...');
            window.firebaseDB.ref('.info/connected').once('value', (snap) => {
                if (snap.val() !== true) {
                    attemptReconnect();
                }
            });
        }
    }, delay);
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkAndInitFirebase, 100);
    });
} else {
    setTimeout(checkAndInitFirebase, 100);
}

setTimeout(checkAndInitFirebase, 50);

console.log('📦 firebaseConfig.js cargado');