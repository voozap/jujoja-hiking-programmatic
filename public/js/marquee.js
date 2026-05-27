// public/js/marquee.js - FIXED VERSION

class MarqueeAnimation {
    constructor() {
        this.marquees = [];
        this.init();
    }
    
    init() {
        const container = document.getElementById('marqueeContainer');
        if (!container) return;
        
        // Load marquee library from CDN first
        let scriptLoaded = false;
        
        try {
            // Check if Marquee is already loaded (from CDN or local)
            if (typeof Marquee !== 'undefined') {
                scriptLoaded = true;
            } else {
                // Load from CDN
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@joycostudio/marquee/dist/core.min.mjs';
                script.onload = () => {
                    console.log('✅ Marquee library loaded from CDN');
                    this.loadMarquee();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Marquee library');
                    // Fallback: use CSS animation
                    this.useCSSFallback();
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error loading marquee:', error);
            this.useCSSFallback();
        }
        
        if (scriptLoaded) {
            this.loadMarquee();
        }
    }
    
    loadMarquee() {
        const container = document.getElementById('marqueeContainer');
        if (!container) return;
        
        console.log('🎪 Initializing marquee animation...');
        
        try {
            // Initialize marquee with Web Animations API
            this.marqueeInstance = new Marquee(container, {
                speed: 80,           // px/s
                direction: 1,        // 1 = left to right
                speedFactor: 1,      // Multiplier
                play: true,          // Start playing
                repeat: 2,           // Times to duplicate content
                gap: 16              // Gap between repeated content
            });
            
            this.marqueeInstance.initialize(container.children[0]);
            
            console.log('✅ Marquee animation started');
            
            // Add pause on hover functionality
            container.addEventListener('mouseenter', () => {
                if (!this.marqueeInstance.paused) {
                    this.marqueeInstance.pause();
                }
            });
            
            container.addEventListener('mouseleave', () => {
                if (this.marqueeInstance.paused) {
                    this.marqueeInstance.play();
                }
            });
            
            // Add keyboard control
            document.addEventListener('keydown', (e) => {
                if (e.key === ' ') {
                    e.preventDefault();
                    this.togglePlayPause();
                }
            });
            
        } catch (error) {
            console.error('❌ Marquee initialization error:', error);
            this.useCSSFallback();
        }
    }
    
    useCSSFallback() {
        const container = document.getElementById('marqueeContainer');
        if (!container) return;
        
        // Add CSS animation fallback
        const style = document.createElement('style');
        style.textContent = `
            .marquee-container {
                display: flex;
                width: fit-content;
                overflow: hidden;
                animation: scroll 30s linear infinite;
            }
            
            @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
        `;
        document.head.appendChild(style);
        
        console.log('🎪 Using CSS fallback for marquee animation');
    }
    
    togglePlayPause() {
        if (!this.marqueeInstance) return;
        
        if (this.marqueeInstance.paused) {
            this.marqueeInstance.play();
            console.log('Marquee resumed');
        } else {
            this.marqueeInstance.pause();
            console.log('Marquee paused');
        }
    }
    
    setSpeed(speed) {
        if (!this.marqueeInstance) return;
        this.marqueeInstance.setSpeed(speed);
    }
    
    reverse() {
        if (!this.marqueeInstance) return;
        this.marqueeInstance.reverse();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    new MarqueeAnimation();
});
