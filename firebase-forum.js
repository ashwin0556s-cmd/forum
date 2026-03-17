// Firebase Forum (replaces script.js)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment, getDoc, where, serverTimestamp, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Auth listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    loadPosts();
  } else {
    window.location.href = 'auth.html';
  }
});

// Load posts real-time
function loadPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  onSnapshot(q, (snapshot) => {
    renderPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

// Render posts
function renderPosts(posts) {
  const container = document.querySelector('.forum-container');
  const existingPosts = container.querySelectorAll('.post:not(.post-box)');
  existingPosts.forEach(p => p.remove());

  posts.forEach(post => {
    const postEl = createPostElement(post);
    container.appendChild(postEl);
  });
}

function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post';
  postDiv.dataset.id = post.id;

  const isOwner = currentUser && currentUser.uid === post.userId;

  postDiv.innerHTML = `
    <div class="post-header">
      <span class="author">👤 ${post.userName || 'Anonymous'}</span>
      <span class="timestamp">${post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : new Date(post.createdAt).toLocaleString()}</span>
    </div>
    <h3>${post.title || post.content.substring(0, 60)}...</h3>
    <p>${post.content}</p>
    <div class="actions">
      <span class="like-btn" data-id="${post.id}">♡ Like (${post.likeCount || 0})</span>
      <span class="comment-toggle" data-id="${post.id}">💬 Comment</span>
      <span class="delete-btn" data-id="${post.id}">🗑 Delete</span> <!-- Owner only backend check -->
    </div>
    <div class="comments-section" id="comments-${post.id}" style="display: none;">
      <div class="comments-list"></div>
      <div class="comment-box">
        <input type="text" placeholder="Write a comment..." data-post-id="${post.id}" />
        <button class="comment-submit">➤</button>
      </div>
    </div>
  `;

  // Load comments
  loadComments(post.id);

  return postDiv;
}

// Load comments for post
function loadComments(postId) {
  const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt'));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsList = document.querySelector(`#comments-${postId} .comments-list`);
    commentsList.innerHTML = snapshot.docs.map(doc => {
      const comment = doc.data();
      return `<div class="comment">
        <strong>${comment.userName || 'Anonymous'}:</strong> ${comment.text}
        <span class="comment-time">${comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : new Date(comment.createdAt).toLocaleString()}</span>
      </div>`;
    }).join('');
  });
}

// Event delegation
document.querySelector('.forum-container').addEventListener('click', async (e) => {
  const postId = e.target.dataset.id;

  if (e.target.matches('.like-btn') && postId) {
    await handleLike(postId);
  } else if (e.target.matches('.comment-submit') && postId) {
    await handleCommentSubmit(e.target.previousElementSibling);
  } else if (e.target.matches('.comment-toggle') && postId) {
    toggleComments(postId);
  } else if (e.target.matches('.delete-btn') && postId) {
    await handleDelete(postId);
  }
});

// Keypress for comments
document.querySelector('.forum-container').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter' && e.target.matches('.comment-box input') && e.target.dataset.postId) {
    await handleCommentSubmit(e.target);
    e.target.value = '';
  }
});

// Like (prevent duplicates)
async function handleLike(postId) {
  const likeId = currentUser.uid + '_' + postId;
  const likeRef = doc(db, 'likes', likeId);
  const likeSnap = await getDoc(likeRef);

  if (!likeSnap.exists()) {
    await setDoc(likeRef, { userId: currentUser.uid, postId });
    await updateDoc(doc(db, 'posts', postId), { likeCount: increment(1) });
  }
}

// Comment
async function handleCommentSubmit(input) {
  const postId = input.dataset.postId;
  const text = input.value.trim();
  if (!text || !currentUser) return;

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const userName = userDoc.data()?.name || 'Anonymous';

  await addDoc(collection(db, 'comments'), {
    postId,
    userId: currentUser.uid,
    userName,
    text,
    createdAt: serverTimestamp(),
    likeCount: 0
  });

  await updateDoc(doc(db, 'users', currentUser.uid), {
    commentCount: increment(1)
  });
}

// Delete (own post only)
async function handleDelete(postId) {
  if (!confirm('Delete post?')) return;

  await deleteDoc(doc(db, 'posts', postId));
  await updateDoc(doc(db, 'users', currentUser.uid), {
    postCount: increment(-1)
  });
}

// Toggle comments
function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// New post
document.querySelector('.post-box .btn').addEventListener('click', async () => {
  const textarea = document.querySelector('.post-box textarea');
  const content = textarea.value.trim();
  if (!content || !currentUser) return;

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const userName = userDoc.data()?.name;

  const lines = content.split('\n');
  const title = lines[0].length > 60 ? lines[0].substring(0, 60) + '...' : lines[0];

  await addDoc(collection(db, 'posts'), {
    userId: currentUser.uid,
    userName,
    title,
    content,
    likeCount: 0,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, 'users', currentUser.uid), {
    postCount: increment(1)
  });

  textarea.value = '';
});

