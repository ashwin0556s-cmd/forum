// Forum AR/VR Design Enhancements - TypeScript

interface Post {
  id: number;
  title: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  author: string;
}

interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}

// AR/VR Visual Effects Controller
class ARVREffects {
  private container: HTMLElement | null;
  private isVRMode: boolean = false;

  constructor() {
    this.container = document.querySelector('.forum-container');
    this.init();
  }

  private init(): void {
    this.addGlitchEffect();
    this.addParticleBackground();
    this.add3DCardEffects();
  }

  // Add glitch text effect to headings
  private addGlitchEffect(): void {
    const headings = document.querySelectorAll('.post h3, .post-box h2');
    headings.forEach((heading) => {
      heading.addEventListener('mouseenter', () => {
        this.triggerGlitch(heading as HTMLElement);
      });
    });
  }

  private triggerGlitch(element: HTMLElement): void {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'glitch 0.3s ease';
  }

  // Add floating particles background
  private addParticleBackground(): void {
    const style = document.createElement('style');
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
      
      @keyframes float {
        0%, 100% {
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
    `;
    document.head.appendChild(style);

    // Create particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'ar-particles';
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      
      if (Math.random() > 0.5) {
        particle.style.background = '#ff006e';
      }
      
      particleContainer.appendChild(particle);
    }
    
    document.body.appendChild(particleContainer);
  }

  // Add 3D card tilt effects
  private add3DCardEffects(): void {
    const posts = document.querySelectorAll('.post');
    posts.forEach((post) => {
      (post as HTMLElement).addEventListener('mousemove', (e: Event) => {
        this.handle3DTilt(post as HTMLElement, e);
      });
      (post as HTMLElement).addEventListener('mouseleave', () => {
        this.reset3D(post as HTMLElement);
      });
    });
  }

  private handle3DTilt(element: HTMLElement, event: Event): void {
    const rect = element.getBoundingClientRect();
    const mouseEvent = event as MouseEvent;
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  private reset3D(element: HTMLElement): void {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }

  // Toggle VR Mode
  public toggleVRMode(): void {
    this.isVRMode = !this.isVRMode;
    document.body.classList.toggle('vr-mode', this.isVRMode);
    
    if (this.isVRMode) {
      this.enterVRMode();
    } else {
      this.exitVRMode();
    }
  }

  private enterVRMode(): void {
    if (this.container) {
      this.container.style.perspective = '2000px';
    }
    document.body.style.overflow = 'hidden';
  }

  private exitVRMode(): void {
    if (this.container) {
      this.container.style.perspective = '1000px';
    }
    document.body.style.overflow = 'auto';
  }
}

// Cyberpunk Button Effects
class CyberButton {
  private button: HTMLElement;

  constructor(element: HTMLElement) {
    this.button = element;
    this.init();
  }

  private init(): void {
    this.addNeonGlow();
    this.addRippleEffect();
  }

  private addNeonGlow(): void {
    this.button.addEventListener('mouseenter', () => {
      this.button.style.boxShadow = '0 0 30px #00d4ff, 0 0 60px #00d4ff';
      this.button.style.textShadow = '0 0 10px #00d4ff';
    });

    this.button.addEventListener('mouseleave', () => {
      this.button.style.boxShadow = 'none';
      this.button.style.textShadow = 'none';
    });
  }

  private addRippleEffect(): void {
    this.button.addEventListener('click', (e: MouseEvent) => {
      const rect = this.button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
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
      `;
      
      this.button.style.position = 'relative';
      this.button.style.overflow = 'hidden';
      this.button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }
}

// Holographic Card Effect
class HolographicCard {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.init();
  }

  private init(): void {
    this.element.classList.add('holographic-card');
    this.addRainbowBorder();
  }

  private addRainbowBorder(): void {
    const style = document.createElement('style');
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

// Type-safe localStorage wrapper
class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public getPosts(): Post[] {
    const data = localStorage.getItem('forumPosts');
    if (data) {
      return JSON.parse(data) as Post[];
    }
    return [];
  }

  public savePosts(posts: Post[]): void {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
  }

  public generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
}

// Initialize effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AR/VR effects
  new ARVREffects();
  
  // Apply cyber effects to buttons
  const postButton = document.querySelector('.post-box .btn');
  if (postButton) {
    new CyberButton(postButton as HTMLElement);
  }
  
  // Apply holographic effect to posts
  const posts = document.querySelectorAll('.post');
  posts.forEach(post => {
    new HolographicCard(post as HTMLElement);
  });
  
  // Export for global use
  (window as any).ARVREffects = ARVREffects;
});

// Export classes for module use
export { ARVREffects, CyberButton, HolographicCard, StorageManager };
export type { Post, Comment };

