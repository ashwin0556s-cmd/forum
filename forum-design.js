// Forum AR/VR Design Enhancements - JavaScript (Converted from TypeScript)

// AR/VR Visual Effects Controller
class ARVREffects {
  constructor() {
    this.container = document.querySelector(".forum-container");
    this.isVRMode = false;
    this.init();
  }

  init() {
    this.addGlitchEffect();
    this.addParticleBackground();
    this.add3DCardEffects();
    this.addVRButton();
  }

  // Add glitch text effect to headings
  addGlitchEffect() {
    const headings = document.querySelectorAll(".post h3, .post-box h2");
    headings.forEach((heading) => {
      heading.addEventListener("mouseenter", () => {
        this.triggerGlitch(heading);
      });
    });
  }

  triggerGlitch(element) {
    element.style.animation = "none";
    element.offsetHeight; // Trigger reflow
    element.style.animation = "glitch 0.3s ease";
  }

  // Add floating particles background
  addParticleBackground() {
    // Check if already added
    if (document.querySelector(".ar-particles")) return;

    const style = document.createElement("style");
    style.textContent = `
      .ar-particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      }
      
      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00d4ff;
        border-radius: 50%;
        opacity: 0.6;
        animation: float 15s infinite;
      }
      
      .particle.secondary {
        background: #ff006e;
      }
      
      @keyframes float {
        0% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }
      
      .vr-toggle {
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        background: linear-gradient(90deg, #00d4ff, #0099cc);
        border: none;
        border-radius: 50px;
        color: #0a0a0f;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .vr-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.8);
      }
      
      .vr-toggle.active {
        background: linear-gradient(90deg, #ff006e, #cc0058);
      }
    `;
    document.head.appendChild(style);

    // Create particles
    const particleContainer = document.createElement("div");
    particleContainer.className = "ar-particles";

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;

      if (Math.random() > 0.5) {
        particle.classList.add("secondary");
      }

      particleContainer.appendChild(particle);
    }

    document.body.appendChild(particleContainer);
  }

  // Add VR Mode Toggle Button
  addVRButton() {
    if (document.querySelector(".vr-toggle")) return;

    const vrButton = document.createElement("button");
    vrButton.className = "vr-toggle";
    vrButton.textContent = "🎮 VR Mode";
    vrButton.addEventListener("click", () => this.toggleVRMode());
    document.body.appendChild(vrButton);
  }

  // Add 3D card tilt effects
  add3DCardEffects() {
    const posts = document.querySelectorAll(".post");
    posts.forEach((post) => {
      post.addEventListener("mousemove", (e) => {
        this.handle3DTilt(post, e);
      });
      post.addEventListener("mouseleave", () => {
        this.reset3D(post);
      });
    });
  }

  handle3DTilt(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  reset3D(element) {
    element.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  }

  // Toggle VR Mode
  toggleVRMode() {
    this.isVRMode = !this.isVRMode;
    document.body.classList.toggle("vr-mode", this.isVRMode);

    const vrButton = document.querySelector(".vr-toggle");

    if (this.isVRMode) {
      this.enterVRMode();
      if (vrButton) {
        vrButton.classList.add("active");
        vrButton.textContent = "🔴 Exit VR";
      }
    } else {
      this.exitVRMode();
      if (vrButton) {
        vrButton.classList.remove("active");
        vrButton.textContent = "🎮 VR Mode";
      }
    }
  }

  enterVRMode() {
    if (this.container) {
      this.container.style.perspective = "2000px";
    }
    document.body.style.overflow = "hidden";

    // Add VR-specific styles
    const vrStyle = document.createElement("style");
    vrStyle.id = "vr-style";
    vrStyle.textContent = `
      body.vr-mode .post, 
      body.vr-mode .post-box {
        transform-style: preserve-3d;
        animation: vr-pulse 2s ease-in-out infinite;
      }
      
      @keyframes vr-pulse {
        0%, 100% { 
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }
        50% { 
          box-shadow: 0 0 60px rgba(0, 212, 255, 0.6);
        }
      }
    `;
    document.head.appendChild(vrStyle);
  }

  exitVRMode() {
    if (this.container) {
      this.container.style.perspective = "1000px";
    }
    document.body.style.overflow = "auto";

    const vrStyle = document.getElementById("vr-style");
    if (vrStyle) vrStyle.remove();
  }
}

// Cyberpunk Button Effects
class CyberButton {
  constructor(element) {
    this.button = element;
    this.init();
  }

  init() {
    this.addNeonGlow();
    this.addRippleEffect();
  }

  addNeonGlow() {
    this.button.addEventListener("mouseenter", () => {
      this.button.style.boxShadow = "0 0 30px #00d4ff, 0 0 60px #00d4ff";
      this.button.style.textShadow = "0 0 10px #00d4ff";
    });

    this.button.addEventListener("mouseleave", () => {
      this.button.style.boxShadow = "none";
      this.button.style.textShadow = "none";
    });
  }

  addRippleEffect() {
    this.button.addEventListener("click", (e) => {
      const rect = this.button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        background: rgba(0, 212, 255, 0.4);
        transform: translate(-50%, -50%);
        border-radius: 50%;
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
      `;

      this.button.style.position = "relative";
      this.button.style.overflow = "hidden";
      this.button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }
}

// Add ripple animation
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
  @keyframes ripple {
    0% { width: 0; height: 0; opacity: 1; }
    100% { width: 300px; height: 300px; opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

// Holographic Card Effect
class HolographicCard {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    if (this.element.classList.contains("holographic-card")) return;

    this.element.classList.add("holographic-card");
    this.addRainbowBorder();
  }

  addRainbowBorder() {
    const style = document.createElement("style");
    style.textContent = `
      .holographic-card {
        position: relative;
        overflow: hidden;
      }
      
      .holographic-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent 30%,
          rgba(0, 212, 255, 0.3) 40%,
          rgba(255, 0, 110, 0.3) 50%,
          rgba(0, 212, 255, 0.3) 60%,
          transparent 70%
        );
        animation: holo-shine 3s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes holo-shine {
        0% { transform: translateX(-100%) rotate(45deg); }
        100% { transform: translateX(100%) rotate(45deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Sound Effects
class AudioEffects {
  constructor() {
    this.audioContext = null;
  }

  init() {
    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  playClick() {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playHover() {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.05,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
}

// Initialize effects when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AR/VR effects
  const arvrEffects = new ARVREffects();

  // Apply cyber effects to buttons
  const postButton = document.querySelector(".post-box .btn");
  if (postButton) {
    new CyberButton(postButton);

    // Add hover sound effect
    const audio = new AudioEffects();
    postButton.addEventListener("mouseenter", () => audio.playHover());
    postButton.addEventListener("click", () => audio.playClick());
  }

  // Apply holographic effect to posts
  const posts = document.querySelectorAll(".post");
  posts.forEach((post) => {
    new HolographicCard(post);
  });

  // Add sound to like buttons
  const likeButtons = document.querySelectorAll(".like-btn");
  likeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const audio = new AudioEffects();
      audio.playClick();
    });
  });

  // Re-apply effects when new posts are added
  const originalRender = window.renderPosts;
  if (originalRender) {
    window.renderPosts = function () {
      originalRender();

      // Re-apply effects to new posts
      setTimeout(() => {
        const newPosts = document.querySelectorAll(
          ".post:not(.effects-applied)",
        );
        newPosts.forEach((post) => {
          post.classList.add("effects-applied");
          new HolographicCard(post);

          // Add 3D tilt effect
          post.addEventListener("mousemove", (e) => {
            arvrEffects.handle3DTilt(post, e);
          });
          post.addEventListener("mouseleave", () => {
            arvrEffects.reset3D(post);
          });
        });
      }, 100);
    };
  }

  // Export for global use
  window.ARVREffects = ARVREffects;
});

// Auto-initialize if DOM is already loaded
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  document.dispatchEvent(new Event("DOMContentLoaded"));
}
