'use client';

// Real-Time Mobile Push Notification Service (Amazon / Blinkit / Flipkart Style)

export function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  if ('Notification' in window) {
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    }).catch(() => false);
  }
  return Promise.resolve(false);
}

export function sendPushNotification(title: string, body: string, icon: string = '🛒', tag: string = 'grocery-alert') {
  if (typeof window === 'undefined') return;

  // Check if browser/device supports Web Notifications
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/images/products/03_alphonso_mango.png',
        badge: '/images/products/01_red_delicious_apple.png',
        tag,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.log('Push notification display fallback triggered', e);
    }
  }
}

export function triggerOrderPlacedPush(orderId: string, address: string) {
  sendPushNotification(
    `🛵 Order ${orderId} Confirmed!`,
    `Your Smart Grocery order is confirmed and delivering to ${address}. Track live on map!`,
    '📦',
    'order-status'
  );
}

export function triggerDeliveryArrivingPush(orderId: string) {
  sendPushNotification(
    `⚡ Delivery Agent Arriving Soon!`,
    `FreshCart Super Hub #104 delivery partner is 2 mins away from your location.`,
    '🛵',
    'delivery-status'
  );
}

export function triggerFlashDealPush(productName: string, discount: string) {
  sendPushNotification(
    `⚡ ${discount} Flash Sale Alert!`,
    `Special discount on ${productName} available right now in Chettipedu!`,
    '🔥',
    'deal-alert'
  );
}
