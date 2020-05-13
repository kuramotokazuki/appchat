import firebase from 'firebase'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: "AIzaSyCwOqrmuPtXkdReaKsufHGt6uUwFvCz2ZI",
  authDomain: "chat-app-518be.firebaseapp.com",
  databaseURL: "https://chat-app-518be.firebaseio.com",
  projectId: "chat-app-518be",
  storageBucket: "chat-app-518be.appspot.com",
  messagingSenderId: "690365171754",
  appId: "1:690365171754:web:688610317bbb0a1c451b53",
  measurementId: "G-ZTMHKEFNH7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

