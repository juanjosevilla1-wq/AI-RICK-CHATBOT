// Este archivo es el Service Worker que gestiona las notificaciones push.

// Evento que se dispara cuando el usuario hace clic en una notificación.
self.addEventListener('notificationclick', (event) => {
    // Cierra la notificación.
    event.notification.close();
    
    // Enfoca la ventana de la aplicación si está abierta, o la abre si está cerrada.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Busca una ventana existente y la enfoca.
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            // Si no hay ventanas abiertas, abre una nueva.
            return clients.openWindow('/');
        })
    );
});

// Evento que se dispara cuando el Service Worker se activa.
self.addEventListener('activate', event => {
    // 'clients.claim()' permite que un service worker activado tome el control
    // de la página inmediatamente, en lugar de esperar a la siguiente carga.
    event.waitUntil(clients.claim());
});
