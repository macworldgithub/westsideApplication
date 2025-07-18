// import { registerRootComponent } from 'expo';
// import messaging from '@react-native-firebase/messaging';
// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately


// // Register background handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
  
// });

// registerRootComponent(App);

// import { registerRootComponent } from 'expo';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import App from './App';

// // Register background handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);

//   // Create a notification channel for Android
//   await notifee.createChannel({
//     id: 'default',
//     name: 'Default Channel',
//     importance: AndroidImportance.HIGH,
//   });

//   // Display notification using Notifee
//   await notifee.displayNotification({
//     title: remoteMessage.notification?.title || 'Notification',
//     body: remoteMessage.notification?.body || 'You have a new notification',
//     android: {
//       channelId: 'default',
//       importance: AndroidImportance.HIGH,
//       pressAction: {
//         id: 'default',
//       },
//     },
//     ios: {
//       sound: 'default',
//     },
//   });
//   console.log('Background notification displayed via Notifee');
// });

// registerRootComponent(App);
import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import App from './App';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);

  // Skip if no notification data
  if (!remoteMessage.notification || !remoteMessage.notification.title || !remoteMessage.notification.body) {
    console.log('Skipping background notification: missing title or body');
    return;
  }

  // Create a notification channel for Android
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Display notification using Notifee
  await notifee.displayNotification({
    id: remoteMessage.messageId, // Use messageId to prevent duplicates
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
    data: remoteMessage.data || {}, // Include data for navigation
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
  console.log('Background notification displayed via Notifee');
});

// Handle background notification press
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Background notification pressed:', detail.notification);
    // Navigation in background is not possible directly, as the app is not active
    // The navigation will be handled when the app opens (via App.tsx foreground handler)
  }
});

registerRootComponent(App);