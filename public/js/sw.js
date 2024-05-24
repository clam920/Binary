console.log('Service Worker Loaded');

self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
});

self.addEventListener('push', (event) => {
    let data;
    try {
        data = event.data.json();
        console.log('Push Received:', data);
    } catch (e) {
        console.error('Error parsing push data:', e);
        return;  // Exit if data parsing fails
    }

    const title = data.title || 'No Title';
    const options = {
        body: data.body || 'No body content',
        icon: '/images/favicon.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
