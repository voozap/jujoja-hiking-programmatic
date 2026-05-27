class MarqueeAnimation {
    constructor() {
        this.marquees = [];
        this.init();
    }
    
    init() {
        const container = document.getElementById('marqueeContainer');
        if (!container) return;
        
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
