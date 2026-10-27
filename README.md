# env-gen

## Object to Environment vars

**Input**

```ts
// example firebase config credentials
const firebaseConfig = {
  apiKey: 'adkfj',
  authDomain: 'adjfad',
  projectId: 'ioiuero',
  storageBucket: 'ijsmxnm',
  messagingSenderId: '0384905',
  appId: '8:9582340'
}
```

**Output**

```zsh

# FIREBASE
PUBLIC_FIREBASE_API_KEY="adkfj"
PUBLIC_FIREBASE_AUTH_DOMAIN="adjfad"
PUBLIC_FIREBASE_PROJECT_ID="ioiuero"
PUBLIC_FIREBASE_STORAGE_BUCKET="ijsmxnm"
PUBLIC_FIREBASE_MESSAGING_SENDER_ID="0384905"
PUBLIC_FIREBASE_APP_ID="8:9582340"
```
