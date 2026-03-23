// 1. Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// 2. Intersection Observer for scroll animations (Slide up / Fade UI)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Stop observing once animated
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);


// 3. Typewriter Effect Logic
const roles = ['Data Analyst', 'Full Stack Developer', 'Power BI Specialist', 'Python Developer'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (!typewriterElement) return;

    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Faster when deleting
    } else {
        typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500; // Pause before typing new word
    }

    setTimeout(typeWriter, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    // Start observer
    const hiddenElements = document.querySelectorAll('.timeline-item, .project-card, .skills-container, .contact-container');
    hiddenElements.forEach((el) => observer.observe(el));
    
    // Start Typewriter
    setTimeout(typeWriter, 1500); // Slight delay to match hero fade in

    // 4. Navbar & Scroll Progress Bar
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        // Navbar glass effect
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 8, 20, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(5, 8, 20, 0.6)';
            navbar.style.boxShadow = 'none';
        }

        // Scroll Progress
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        if(scrollProgress) scrollProgress.style.width = scrollPercent + '%';
    });

    // 5. Universe Space Canvas & Interactive Stars
    const canvas = document.getElementById('space-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let stars = [];
        let mouse = { x: null, y: null };
        const maxStars = 300; // Number of stars
        const connectionDistance = 120; // Distance for interaction

        // Adjust canvas on resize
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        });

        // Track mouse position
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Clear mouse on leave
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Star Class defining individual star properties and behaviors
        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
                this.vx = (Math.random() - 0.5) * 0.5; // Natural drift
                this.vy = (Math.random() - 0.5) * 0.5;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Natural slow movement
                this.x += this.vx;
                this.y += this.vy;

                // Loop edges
                if (this.x > width || this.x < 0) this.vx *= -1;
                if (this.y > height || this.y < 0) this.vy *= -1;

                // Mouse interaction physics
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Repel effect based on distance
                    if (distance < connectionDistance) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = connectionDistance;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * this.density * 0.6;
                        const directionY = forceDirectionY * force * this.density * 0.6;

                        this.x -= directionX;
                        this.y -= directionY;
                        
                        // Temporary glow when interacted
                        this.color = `rgba(168, 85, 247, ${Math.random() * 0.5 + 0.5})`; // Primary color tint
                    } else {
                        // Return to white/gradient color when untouched
                        this.color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
                        
                        // Slowly return to base anchor pos (optional structural feel)
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / 100;
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / 100;
                        }
                    }
                }
            }
        }

        // Initialize Star Array
        function initStars() {
            stars = [];
            let particleCount = window.innerWidth < 768 ? maxStars / 2 : maxStars; // Less stars on mobile
            for (let i = 0; i < particleCount; i++) {
                stars.push(new Star());
            }
        }

        // Draw connecting lines between close stars (Constellation effect)
        function connectStars() {
            let opacityValue = 1;
            for (let a = 0; a < stars.length; a++) {
                for (let b = a; b < stars.length; b++) {
                    let distance = ((stars[a].x - stars[b].x) * (stars[a].x - stars[b].x))
                                 + ((stars[a].y - stars[b].y) * (stars[a].y - stars[b].y));
                    
                    if (distance < (canvas.width/10) * (canvas.height/10)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(168, 85, 247, ${opacityValue * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(stars[a].x, stars[a].y);
                        ctx.lineTo(stars[b].x, stars[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Main Animation Loop
        function animateCanvas() {
            requestAnimationFrame(animateCanvas);
            // Deep background clear with slight trail effect
            ctx.fillStyle = 'rgba(3, 5, 12, 0.2)'; // Fades out previous frames
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
                stars[i].draw();
            }
            
            // Optional: Draw subtle connecting lines (can disable if too visually noisy)
            // connectStars(); 
        }

        initStars();
        animateCanvas();
    }
});
