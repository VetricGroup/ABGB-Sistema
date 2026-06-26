// ==================== CONFIGURACIÓN FIREBASE ====================
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

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Exportar para usar en otros archivos
window.firebaseApp = app;
window.firebaseDB = database;