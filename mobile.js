// Mobile YouTube Music Player

class MobileYouTubePlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 3620; // 1:00:20 in seconds
        this.playBtn = document.getElementById('mobilePlayBtn');
        this.progressFill = document.querySelector('.progress-fill-mobile');
        this.currentTimeDisplay = document.querySelector('.current-time-mobile');
        this.totalTimeDisplay = document.querySelector('.total-time-mobile');
        this.youtubePlayer = document.getElementById('youtube-player-mobile');
        this.visualizer = document.querySelector('.music-visualizer');
        this.videoId = 'f02mOEt11OQ';
        this.youtubeEmbedUrl = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${this.videoId}&controls=0&mute=0`;
        this.progressTimer = null;
        this.init();
    }

    init() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.loadYouTubePlayer();
        this.updateTimeDisplays();
        // Add touch feedback
        this.playBtn.addEventListener('touchstart', () => {
            this.playBtn.style.transform = 'scale(0.9)';
        });
        this.playBtn.addEventListener('touchend', () => {
            this.playBtn.style.transform = 'scale(1)';
        });
    }

    loadYouTubePlayer() {
        this.youtubePlayer.src = this.youtubeEmbedUrl;
        console.log('🎵 Loading mobile YouTube player');
    }

    togglePlay() {
        const playIcon = this.playBtn.querySelector('.play-icon-mobile');
        const pauseIcon = this.playBtn.querySelector('.pause-icon-mobile');
        if (this.isPlaying) {
            this.pause();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            this.visualizer.classList.remove('playing');
        } else {
            this.play();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            this.visualizer.classList.add('playing');
        }
        this.isPlaying = !this.isPlaying;
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    play() {
        if (this.youtubePlayer && this.youtubePlayer.contentWindow) {
            try {
                this.youtubePlayer.contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    '*'
                );
            } catch (e) {
                console.log('YouTube play command failed:', e);
            }
        }
        this.startProgressTimer();
        console.log('▶️ Mobile music started');
    }

    pause() {
        if (this.youtubePlayer && this.youtubePlayer.contentWindow) {
            try {
                this.youtubePlayer.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    '*'
                );
            } catch (e) {
                console.log('YouTube pause command failed:', e);
            }
        }
        this.stopProgressTimer();
        console.log('⏸️ Mobile music paused');
    }

    startProgressTimer() {
        this.stopProgressTimer();
        this.progressTimer = setInterval(() => {
            if (this.isPlaying) {
                this.currentTime += 1;
                if (this.currentTime >= this.duration) {
                    this.currentTime = 0;
                }
                this.updateProgress();
                this.updateTimeDisplays();
            }
        }, 1000);
    }

    stopProgressTimer() {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
    }

    updateProgress() {
        const percentage = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        this.progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }

    updateTimeDisplays() {
        this.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        this.totalTimeDisplay.textContent = this.formatTime(this.duration);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
}

// Mobile Navigation Handler
class MobileNavigation {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentPanels = document.querySelectorAll('.content-panel');
        this.currentActive = 'about-content';
        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavClick(e));
            // Touch feedback
            item.addEventListener('touchstart', () => {
                item.style.transform = 'scale(0.95)';
            });
            item.addEventListener('touchend', () => {
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 100);
            });
        });
        // Swipe gestures
        this.setupSwipeGestures();
    }

    handleNavClick(e) {
        const clickedItem = e.currentTarget;
        const targetContent = clickedItem.getAttribute('data-content');
        if (targetContent === this.currentActive) return;
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        // Update navigation
        this.navItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');
        // Update content with smooth transition
        this.switchContent(targetContent);
        this.currentActive = targetContent;
    }

    switchContent(targetContent) {
        // Hide current content
        this.contentPanels.forEach(panel => {
            if (panel.classList.contains('active')) {
                panel.style.transform = 'translateX(-100px)';
                panel.style.opacity = '0';
                setTimeout(() => {
                    panel.classList.remove('active');
                }, 200);
            }
        });
        // Show new content
        setTimeout(() => {
            const targetPanel = document.getElementById(targetContent);
            if (targetPanel) {
                targetPanel.style.transform = 'translateX(100px)';
                targetPanel.style.opacity = '0';
                targetPanel.classList.add('active');
                setTimeout(() => {
                    targetPanel.style.transform = 'translateX(0)';
                    targetPanel.style.opacity = '1';
                }, 50);
            }
        }, 200);
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isScrolling = false;
        const contentArea = document.querySelector('.content-area');
        
        contentArea.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches.clientY;
            isScrolling = false;
        }, { passive: true });

        contentArea.addEventListener('touchmove', (e) => {
            if (!isScrolling) {
                const deltaX = e.touches.clientX - startX;
                const deltaY = e.touches.clientY - startY;
                
                // Determine if this is vertical scrolling or horizontal swiping
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    // Vertical scroll - allow it
                    isScrolling = true;
                } else if (Math.abs(deltaX) > 10) {
                    // Horizontal swipe - prevent scrolling
                    e.preventDefault();
                }
            }
        }, { passive: false });

        contentArea.addEventListener('touchend', (e) => {
            if (!isScrolling) {
                const endX = e.changedTouches[0].clientX;
                const deltaX = endX - startX;
                
                // Only process horizontal swipes
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.swipeRight();
                    } else {
                        this.swipeLeft();
                    }
                }
            }
        }, { passive: true });
    }

    swipeLeft() {
        const panels = ['about-content', 'music-content', 'social-content'];
        const currentIndex = panels.indexOf(this.currentActive);
        const nextIndex = (currentIndex + 1) % panels.length;
        const nextNavItem = document.querySelector(`[data-content="${panels[nextIndex]}"]`);
        nextNavItem.click();
    }

    swipeRight() {
        const panels = ['about-content', 'music-content', 'social-content'];
        const currentIndex = panels.indexOf(this.currentActive);
        const prevIndex = (currentIndex - 1 + panels.length) % panels.length;
        const prevNavItem = document.querySelector(`[data-content="${panels[prevIndex]}"]`);
        prevNavItem.click();
    }
}

// Enhanced Mobile Interactions
class MobileEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupTouchEffects();
        this.setupOrientationChange();
        this.preventZoom();
    }

    setupTouchEffects() {
        // Add touch ripple effect to social links
        const socialLinks = document.querySelectorAll('.social-link-mobile');
        socialLinks.forEach(link => {
            link.addEventListener('touchstart', (e) => {
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            });
        });
        // Add touch effects to skill tags
        const skillTags = document.querySelectorAll('.skill-tag-mobile');
        skillTags.forEach(tag => {
            tag.addEventListener('touchstart', () => {
                tag.style.transform = 'scale(0.95)';
                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }
            });
            tag.addEventListener('touchend', () => {
                setTimeout(() => {
                    tag.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Recalculate heights and positions
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }, 100);
        });
        // Initial calculation
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    preventZoom() {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        // Prevent pinch zoom
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Initializing Kifyie\'s Tavern Mobile...');
    new MobileYouTubePlayer();
    new MobileNavigation();
    new MobileEnhancements();
    console.log('✨ Mobile Kifyie\'s Tavern loaded successfully!');
    // Smooth entrance animation
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.querySelector('.mobile-title').style.animation = 'titleGlow 2s ease-in-out infinite alternate';
    }, 100);
});

// Handle visibility change for better performance
document.addEventListener('visibilitychange', () => {
    const musicPlayer = window.mobileYouTubePlayer;
    if (document.visibilityState === 'hidden' && musicPlayer && musicPlayer.isPlaying) {
        // Optionally pause music when tab becomes hidden
        // musicPlayer.pause();
    }
});

// Detect when scrolling starts and ends to show/hide fade overlays
document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.querySelector('.content-area');
    let scrollTimeout;
    if (contentArea) {
        contentArea.addEventListener('scroll', function() {
            // Add scrolling class when scrolling
            contentArea.classList.add('scrolling');
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            // Remove scrolling class after scrolling stops
            scrollTimeout = setTimeout(function() {
                contentArea.classList.remove('scrolling');
            }, 150);
        });
    }
});
