

const publicVapidKey = 'BNNkgoX1NK5WoNudAGCdFgnji0W6UJfwOUYWyH32oRlX_M7wQng0a61LEK1_j5vjNa4fGzsIWZzTb-t5EDea1xY';

const urlBase64toUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

const registerPushSubscription = async () =>{
    if ('serviceWorker' in navigator){
        const registration = await navigator.serviceWorker.register('/js/sw.js');
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64toUint8Array(publicVapidKey)
        });

        const response = await fetch('/save-subscription', {
            method: 'POST',
            body: JSON.stringify({subscription}),
            headers: {
                'content-type': 'application/json'
            }
        });

        console.log('Push notification saved.');
        if (response.ok) {
            console.log('Push notification subscription saved successfully.');
        } else {
            console.error('Failed to save subscription:', response.statusText);
        }
    
    } else {
        console.error('Service Worker is not supported in this browser');
    }
}

registerPushSubscription()

