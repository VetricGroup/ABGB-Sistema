// ==================== SISTEMA DE NOTIFICACIONES PERSONALIZADO - iOS OPTIMIZADO ====================

const NotificationManager = {
    container: null,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),

    init() {
        // Crear contenedor
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            
            if (this.isIOS) {
                container.style.cssText = `
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    z-index: 99999;
                    pointer-events: none;
                    max-width: 100%;
                `;
            } else {
                container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 99999;
                    pointer-events: none;
                    max-width: 400px;
                `;
            }
            
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notificationContainer');
        }
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const notification = document.createElement('div');
        
        const colors = {
            success: { bg: '#22c55e', icon: '✓' },
            error: { bg: '#ef4444', icon: '✕' },
            warning: { bg: '#eab308', icon: '⚠' },
            info: { bg: '#3b82f6', icon: 'ℹ' }
        };

        const config = colors[type] || colors.info;

        // HTML más simple para iOS
        notification.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                background: #1a1a1a;
                border-left: 4px solid ${config.bg};
                border-radius: 8px;
                padding: 14px 16px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                animation: slideInNotif 0.3s ease-out;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: ${config.bg};
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                    flex-shrink: 0;
                ">${config.icon}</div>
                <div style="
                    color: #fff;
                    font-size: 13px;
                    font-weight: 500;
                    line-height: 1.4;
                    flex: 1;
                ">${message}</div>
            </div>
        `;

        this.container.appendChild(notification);

        // Animar salida
        setTimeout(() => {
            notification.style.animation = 'slideOutNotif 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    success(message, duration = 3000) {
        console.log('✓ SUCCESS:', message);
        this.show(message, 'success', duration);
    },

    error(message, duration = 4000) {
        console.log('✕ ERROR:', message);
        this.show(message, 'error', duration);
    },

    warning(message, duration = 3500) {
        console.log('⚠ WARNING:', message);
        this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        console.log('ℹ INFO:', message);
        this.show(message, 'info', duration);
    }
};

// Agregar estilos CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotif {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOutNotif {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    * {
        box-sizing: border-box;
    }
`;
document.head.appendChild(style);

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
    NotificationManager.init();
}

console.log('✅ Notifications.js cargado (' + (NotificationManager.isIOS ? 'iOS' : 'Desktop') + ')');