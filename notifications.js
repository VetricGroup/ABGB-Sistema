// ==================== SISTEMA DE NOTIFICACIONES PERSONALIZADO ====================

const NotificationManager = {
    container: null,

    init() {
        // Crear contenedor si no existe
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                pointer-events: none;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notificationContainer');
        }
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: { bg: '#22c55e', icon: '✓' },
            error: { bg: '#ef4444', icon: '✕' },
            warning: { bg: '#eab308', icon: '⚠' },
            info: { bg: '#3b82f6', icon: 'ℹ' }
        };

        const config = colors[type] || colors.info;

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon" style="background: ${config.bg};">
                    ${config.icon}
                </div>
                <div class="notification-text">${message}</div>
            </div>
            <div class="notification-progress"></div>
        `;

        notification.style.cssText = `
            display: flex;
            flex-direction: column;
            background: #141414;
            border: 2px solid ${config.bg};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const icon = notification.querySelector('.notification-icon');
        icon.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            color: white;
            font-weight: bold;
            font-size: 18px;
            flex-shrink: 0;
        `;

        const text = notification.querySelector('.notification-text');
        text.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Poppins', sans-serif;
            flex: 1;
        `;

        const progress = notification.querySelector('.notification-progress');
        progress.style.cssText = `
            height: 3px;
            background: ${config.bg};
            margin-top: 8px;
            border-radius: 2px;
            animation: shrink ${duration}ms linear forwards;
        `;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    },

    warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
};

// Agregar estilos CSS globales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }

    @keyframes shrink {
        from {
            width: 100%;
        }
        to {
            width: 0%;
        }
    }

    @media (max-width: 600px) {
        #notificationContainer {
            left: 10px !important;
            right: 10px !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
    NotificationManager.init();
}