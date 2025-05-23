// import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// dotenv.config();

const firebaseConfig = {
apiKey: "AIzaSyA_OyRkviSJMgcsuT89A0JDfwQe0oDuMTc",
  authDomain: "comp-sci-ai-sol.firebaseapp.com",
  databaseURL: "https://comp-sci-ai-sol-default-rtdb.firebaseio.com",
  projectId: "comp-sci-ai-sol",
  storageBucket: "comp-sci-ai-sol.firebasestorage.app",
  messagingSenderId: "383218234947",
  appId: "1:383218234947:web:c283be94e6b050dc74c6f6",
  measurementId: "G-0XZM0X0FNM"};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
const analytics = getAnalytics(firebaseApp);


export { auth, firestore, database, storage, analytics, firebaseApp };