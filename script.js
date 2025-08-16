// MOBILE REDIRECT
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

if (isMobile() && !window.location.pathname.includes('mobile.html')) {
    window.location.href = 'mobile.html';
}

// REACTIVE CONSTELLATION BACKGROUND - FIXED
const canvas = document.getElementById('constellation-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        particles = [];

        // Create particles
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 1.5 + 1
            });
        }
    }

    function drawCircle(x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,154,86,0.8)';
        ctx.fill();
    }

    function drawLine(x1, y1, x2, y2, opacity) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,154,86,${opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x > width || particle.x < 0) particle.vx *= -1;
            if (particle.y > height || particle.y < 0) particle.vy *= -1;

            drawCircle(particle.x, particle.y, particle.radius);
        });

        // Draw lines between particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    let opacity = 1 - dist / 130;
                    drawLine(particles[i].x, particles[i].y, particles[j].x, particles[j].y, opacity);
                }
            }

            // Draw lines to mouse cursor - THIS IS THE REACTIVE PART!
            if (mouse.x && mouse.y) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);

                if (distToMouse < 180) {
                    let opacity = 1 - distToMouse / 180;
                    drawLine(particles[i].x, particles[i].y, mouse.x, mouse.y, opacity);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Mouse tracking
    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        init();
    });

    // Initialize and start
    init();
    animate();
}

// WORKING YOUTUBE MUSIC PLAYER
document.addEventListener('DOMContentLoaded', function() {
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    const progressFill = document.querySelector('.progress-fill');
    const currentTime = document.querySelector('.current-time');
    const totalTime = document.querySelector('.total-time');
    const iframe = document.getElementById('youtube-player');
    
    if (!playBtn || !iframe) return;

    const VIDEO_ID = 'f02mOEt11OQ';
    
    iframe.src = `https://www.youtube.com/embed/${VIDEO_ID}?enablejsapi=1&autoplay=0&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`;
    iframe.style.display = 'none';
    
    let isPlaying = false;
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    let player;
    let playerReady = false;
    
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            videoId: VIDEO_ID,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'loop': 1,
                'playlist': VIDEO_ID
            },
            events: {
                'onReady': function(event) {
                    playerReady = true;
                    console.log('🎵 YouTube player ready!');
                    
                    const duration = player.getDuration();
                    if (totalTime && duration > 0) {
                        const minutes = Math.floor(duration / 60);
                        const seconds = Math.floor(duration % 60);
                        totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                    
                    setInterval(updateRealProgress, 1000);
                },
                'onStateChange': function(event) {
                    if (event.data == YT.PlayerState.PLAYING) {
                        isPlaying = true;
                        playIcon.classList.add('hidden');
                        pauseIcon.classList.remove('hidden');
                        console.log('🎵 Music playing!');
                    } else if (event.data == YT.PlayerState.PAUSED) {
                        isPlaying = false;
                        playIcon.classList.remove('hidden');
                        pauseIcon.classList.add('hidden');
                        console.log('⏸️ Music paused!');
                    }
                }
            }
        });
    };
    
    playBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Play button clicked!');
        
        if (!player || !playerReady) {
            console.log('⚠️ Player not ready yet');
            return;
        }
        
        try {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
                player.unMute();
            }
        } catch (error) {
            console.log('❌ Error:', error);
        }
    });
    
    function updateRealProgress() {
        if (!player || !playerReady) return;
        
        try {
            const currentTimeValue = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const progressPercent = (currentTimeValue / duration) * 100;
                if (progressFill) {
                    progressFill.style.width = progressPercent + '%';
                }
                
                if (currentTime) {
                    const minutes = Math.floor(currentTimeValue / 60);
                    const seconds = Math.floor(currentTimeValue % 60);
                    currentTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        } catch (error) {
            // Player not ready yet
        }
    }
});
