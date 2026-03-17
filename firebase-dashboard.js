import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const statsContainer = document.getElementById('user-stats');
const userPosts = document.getElementById('user-posts');

// Auth guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  // Load user stats
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const stats = userDoc.data();

  statsContainer.innerHTML = `
    <div class="stat-card">
      <h3>${stats.name}</h3>
      <p>Posts: ${stats.postCount || 0}</p>
      <p>Comments: ${stats.commentCount || 0}</p>
      <p>Likes Received: ${stats.totalLikesReceived || 0}</p>
      <p>Member since: ${stats.createdAt.toDate().toLocaleDateString()}</p>
    </div>
  `;

  // Load user posts real-time
  loadUserPosts(user.uid);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

async function loadUserPosts(userId) {
  const q = query(collection(db, 'posts'), where('userId', '==', userId));
  onSnapshot(q, (snapshot) => {
    let html = '<h2>Your Posts</h2>';
    snapshot.forEach((doc) => {
      const post = doc.data();
      html += `
        <div class="post">
          <h3>${post.content.substring(0, 100)}...</h3>
          <p>Likes: ${post.likeCount || 0}</p>
          <small>${post.createdAt.toDate().toLocaleString()}</small>
        </div>
      `;
    });
    userPosts.innerHTML = html;
  });
}

