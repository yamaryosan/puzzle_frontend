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

const stagingConfig = {
    apiKey: process.env.NEXT_PUBLIC_STAGING_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_STAGING_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_STAGING_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STAGING_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_STAGING_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_STAGING_FIREBASE_APP_ID,
};

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production' ? prodConfig : process.env.NEXT_PUBLIC_FIREBASE_ENV === 'staging' ? stagingConfig : devConfig;

export default firebaseConfig;