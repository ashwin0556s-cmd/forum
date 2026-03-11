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

  // Add event listeners
  addEventListeners();
}

// Add event listeners to posts
function addEventListeners() {
  // Like buttons
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", handleLike);
  });

  // Comment toggle buttons
  document.querySelectorAll(".comment-toggle").forEach((btn) => {
    btn.addEventListener("click", handleCommentToggle);
  });

  // Comment submit buttons
  document.querySelectorAll(".comment-submit").forEach((btn) => {
    btn.addEventListener("click", handleCommentSubmit);
  });

  // Comment input enter key
  document.querySelectorAll(".comment-box input").forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const postId = parseInt(input.dataset.postId);
        handleCommentSubmitForPost(postId, input.value);
      }
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

// Handle like
function handleLike(e) {
  const postId = parseInt(e.target.dataset.id);
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (post) {
    post.likes++;
    savePosts(posts);
    renderPosts();
  }
}

// Handle comment toggle
function handleCommentToggle(e) {
  const postId = e.target.dataset.id;
  const commentsSection = document.getElementById(`comments-${postId}`);

  if (commentsSection.style.display === "none") {
    commentsSection.style.display = "block";
  } else {
    commentsSection.style.display = "none";
  }
}

// Handle comment submit (click)
function handleCommentSubmit(e) {
  const input = e.target.previousElementSibling;
  const postId = parseInt(input.dataset.postId);
  const commentText = input.value.trim();

  if (commentText) {
    addComment(postId, commentText);
    input.value = "";
  }
}

// Handle comment submit for enter key
function handleCommentSubmitForPost(postId, commentText) {
  if (commentText.trim()) {
    addComment(postId, commentText.trim());
    const input = document.querySelector(`input[data-post-id="${postId}"]`);
    if (input) input.value = "";
  }
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
    renderPosts();

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
