// Forum functionality using localStorage

// Initialize posts from localStorage or use default sample post
const defaultPosts = [
  {
    id: 1,
    title: "⚡ How does GraphQL improve APIs?",
    content: "GraphQL allows clients to request only the data they need...",
    likes: 12,
    comments: [],
    timestamp: new Date().toISOString(),
    author: "TechEnthusiast",
  },
];

// Get posts from localStorage or use defaults
function getPosts() {
  const storedPosts = localStorage.getItem("forumPosts");
  if (storedPosts) {
    return JSON.parse(storedPosts);
  }
  return defaultPosts;
}

// Save posts to localStorage
function savePosts(posts) {
  localStorage.setItem("forumPosts", JSON.stringify(posts));
}

// Generate unique ID
function generateId() {
  return Date.now();
}

// Get formatted timestamp
function getTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

// Create post HTML element
function createPostElement(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "post";
  postDiv.dataset.id = post.id;

  const commentsHtml =
    post.comments.length > 0
      ? post.comments
          .map(
            (c) => `
        <div class="comment">
          <strong>${c.author}:</strong> ${c.text}
          <span class="comment-time">${getTimestamp(c.timestamp)}</span>
        </div>
      `,
          )
          .join("")
      : "";

  postDiv.innerHTML = `
    <div class="post-header">
      <span class="author">👤 ${post.author || "Anonymous"}</span>
      <span class="timestamp">${getTimestamp(post.timestamp)}</span>
    </div>
    <h3>${post.title}</h3>
    <p>${post.content}</p>
    <div class="actions">
      <span class="like-btn" data-id="${post.id}">♡ Like (${post.likes})</span>
      <span class="comment-toggle" data-id="${post.id}">💬 Comment (${post.comments.length})</span>
      <span class="delete-btn" data-id="${post.id}">🗑 Delete</span>
    </div>
    <div class="comments-section" id="comments-${post.id}" style="display: none;">
      <div class="comments-list">
        ${commentsHtml}
      </div>
      <div class="comment-box">
        <input type="text" placeholder="Write a comment..." data-post-id="${post.id}" />
        <button class="comment-submit">➤</button>
      </div>
    </div>
  `;

  return postDiv;
}

// Render all posts
function renderPosts() {
  const forumContainer = document.querySelector(".forum-container");
  const posts = getPosts();

  // Remove existing posts (keep the post-box)
  const existingPosts = forumContainer.querySelectorAll(".post");
  existingPosts.forEach((post) => post.remove());

  // Add posts in reverse order (newest first)
  const postsReversed = [...posts].reverse();
  postsReversed.forEach((post) => {
    const postElement = createPostElement(post);
    forumContainer.appendChild(postElement);
  });

  // Setup delegation
  setupEventDelegation();
}

// Single event delegation for all actions
function setupEventDelegation() {
  const forumContainer = document.querySelector(".forum-container");
  forumContainer.addEventListener("click", handleForumAction);
  forumContainer.addEventListener("keypress", handleKeyPress);
}

function handleForumAction(e) {
  const btn = e.target.closest('[data-id]');
  if (!btn) return;

  const postId = parseInt(btn.dataset.id);
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (btn.matches('.like-btn')) {
    post.likes++;
    savePosts(posts);
    updatePost(postId);
  } else if (btn.matches('.comment-toggle')) {
    toggleComments(postId);
  } else if (btn.matches('.delete-btn')) {
    if (confirm("Delete post?")) {
      deletePost(postId);
    }
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter' && e.target.matches('.comment-box input')) {
    const postId = parseInt(e.target.dataset.postId);
    const text = e.target.value.trim();
    if (text) {
      addComment(postId, text);
      e.target.value = '';
    }
  }
}

// Helper functions (legacy, will be removed later)
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.style.display === "none") {
    commentsSection.style.display = "block";
  } else {
    commentsSection.style.display = "none";
  }
}

function deletePost(postId) {
  let posts = getPosts();
  posts = posts.filter((p) => p.id !== postId);
  savePosts(posts);
  const postElement = document.querySelector(`[data-id="${postId}"]`).closest('.post');
  if (postElement) postElement.remove();
}

function updatePost(postId) {
  const postElement = document.querySelector(`.post[data-id="${postId}"]`);
  if (!postElement) return;
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const newElement = createPostElement(post);
  postElement.parentNode.replaceChild(newElement, postElement);
}

// Add comment to post
function addComment(postId, text) {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (post) {
    post.comments.push({
      id: generateId(),
      text: text,
      author: "User",
      timestamp: new Date().toISOString(),
    });
    savePosts(posts);
    updatePost(postId);

    // Keep comments section open after adding
    setTimeout(() => {
      const commentsSection = document.getElementById(`comments-${postId}`);
      if (commentsSection) {
        commentsSection.style.display = "block";
      }
    }, 100);
  }
}

// Handle delete
function handleDelete(e) {
  const postId = parseInt(e.target.dataset.id);
  let posts = getPosts();

  if (confirm("Are you sure you want to delete this post?")) {
    posts = posts.filter((p) => p.id !== postId);
    savePosts(posts);
    renderPosts();
  }
}

// Handle new post submission
function handleNewPost() {
  const textarea = document.querySelector(".post-box textarea");
  const postContent = textarea.value.trim();

  if (!postContent) {
    alert("Please write something before posting!");
    return;
  }

  // Create title from first line or use default
  const lines = postContent.split("\n");
  const title =
    lines[0].length > 60 ? lines[0].substring(0, 60) + "..." : lines[0];
  const content = lines.length > 1 ? lines.slice(1).join("\n") : "";

  const newPost = {
    id: generateId(),
    title: title,
    content: content || postContent,
    likes: 0,
    comments: [],
    timestamp: new Date().toISOString(),
    author: "User",
  };

  const posts = getPosts();
  posts.push(newPost);
  savePosts(posts);

  // Clear textarea
  textarea.value = "";

  // Re-render posts
  renderPosts();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the forum page
  if (document.querySelector(".forum-container")) {
    renderPosts();

    // Add click handler for post button
    const postBtn = document.querySelector(".post-box .btn");
    if (postBtn) {
      postBtn.addEventListener("click", handleNewPost);
    }
  }
});
