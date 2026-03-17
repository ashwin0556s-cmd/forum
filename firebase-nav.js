import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';

initializeApp(firebaseConfig);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  const loginLink = document.getElementById('login-link');
  const dashboardLink = document.getElementById('dashboard-link');
  const logoutBtn = document.getElementById('logout-btn');
  if (user) {
    loginLink.style.display = 'none';
    dashboardLink.style.display = 'inline';
    logoutBtn.style.display = 'inline';
  } else {
    loginLink.style.display = 'inline';
    dashboardLink.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'index.html';
});
