const devConfig = {
    apiKey: process.env.NEXT_PUBLIC_DEV_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_DEV_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_DEV_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_DEV_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_DEV_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_DEV_FIREBASE_APP_ID,
};

const prodConfig = {
    apiKey: process.env.NEXT_PUBLIC_PROD_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_PROD_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROD_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_PROD_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_PROD_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_PROD_FIREBASE_APP_ID,
};

const firebaseConfig = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export default firebaseConfig;