document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       1. INITIALIZE ICONS (Lucide)
       ========================================================================== */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       2. PRELOADER HANDLER (Stunning 6-Stage Splash Screen Engine)
       ========================================================================== */
    const loader = document.getElementById("loader");
    const body = document.body;
    const skipBtn = document.getElementById("skip-intro");
    const revealLightBurst = document.querySelector(".reveal-light-burst");
    
    // Stage elements
    const introBrand = document.querySelector(".intro-brand");
    const introLogo = document.querySelector(".intro-logo");
    const introTitles = document.querySelector(".intro-titles");
    const introTypingText = document.getElementById("intro-typing-text");
    const introSlogan = document.querySelector(".intro-slogan");
    const introSloganText = document.getElementById("intro-slogan-text");
    const introStats = document.querySelector(".intro-stats");
    const introStatNums = document.querySelectorAll(".intro-stat-num");

    // Lock scrolling on load
    body.classList.add("preloader-active");

    /* ==========================================================================
       SOUND EFFECTS / AUDIO PLAYER (Commented Placeholder)
       ==========================================================================
       To add ambient music or sound effects, follow these instructions:
       
       1. Prepare audio files (e.g., "intro-ambient.mp3" for background drone, 
          and "reveal-swoosh.mp3" for the Step 6 dramatic transition).
       2. Place them in your assets directory (e.g., in a folder named 'audio/').
       3. Browsers block autoplay unless the user has interacted with the document. 
          The Skip Button click or a window 'click' event serves as a user gesture.
       
       Example Code to initialize and trigger:
       
       const ambientAudio = new Audio('audio/intro-ambient.mp3');
       ambientAudio.volume = 0.35;
       ambientAudio.loop = true;
       
       const swooshAudio = new Audio('audio/reveal-swoosh.mp3');
       swooshAudio.volume = 0.45;
       
       // Play ambient music on first user gesture or when preloader starts:
       function startMusic() {
           ambientAudio.play().catch(err => {
               console.log("Autoplay blocked by browser. Music will start on user gesture.");
           });
           document.removeEventListener("click", startMusic);
       }
       document.addEventListener("click", startMusic);
       
       // Stop ambient and play swoosh during Step 6 Reveal:
       function playRevealSound() {
           try {
               ambientAudio.pause();
               swooshAudio.play();
           } catch(e) {
               console.log("Audio play failed:", e);
           }
       }
       ========================================================================== */

    /* --- 2.1. PRELOADER BACKGROUND CANVAS PARTICLES --- */
    const introCanvas = document.getElementById("intro-canvas");
    const introCtx = introCanvas.getContext("2d");
    let introParticlesArray = [];
    let introAnimationFrameId;
    let isTransitioningOut = false;

    const introMouse = {
        x: null,
        y: null,
        radius: 130
    };

    window.addEventListener("mousemove", (event) => {
        introMouse.x = event.clientX;
        introMouse.y = event.clientY;
    });

    window.addEventListener("mouseout", () => {
        introMouse.x = null;
        introMouse.y = null;
    });

    class IntroParticle {
        constructor() {
            this.x = Math.random() * introCanvas.width;
            this.y = Math.random() * introCanvas.height;
            this.size = Math.random() * 2.2 + 0.6;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.baseSize = this.size;
            // Mixed purple/blue theme colors
            this.color = Math.random() > 0.55 ? "rgba(124, 58, 237, " : "rgba(6, 182, 212, ";
            this.alpha = Math.random() * 0.5 + 0.25;
        }

        draw() {
            introCtx.fillStyle = this.color + this.alpha + ")";
            introCtx.beginPath();
            introCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            introCtx.fill();
        }

        update() {
            if (isTransitioningOut) {
                // Step 6 Zoom/Explosion outward movement
                const dx = this.x - introCanvas.width / 2;
                const dy = this.y - introCanvas.height / 2;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.x += (dx / dist) * 14;
                this.y += (dy / dist) * 14;
                this.size += 0.12;
                this.alpha -= 0.015;
                if (this.alpha < 0) this.alpha = 0;
            } else {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x < 0 || this.x > introCanvas.width) this.speedX = -this.speedX;
                if (this.y < 0 || this.y > introCanvas.height) this.speedY = -this.speedY;

                // Mouse avoidance
                if (introMouse.x !== null && introMouse.y !== null) {
                    const dx = introMouse.x - this.x;
                    const dy = introMouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < introMouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (introMouse.radius - distance) / introMouse.radius;
                        this.x -= forceDirectionX * force * 3;
                        this.y -= forceDirectionY * force * 3;
                    }
                }
            }
        }
    }

    function initIntroCanvas() {
        if (!introCanvas) return;
        introCanvas.width = window.innerWidth;
        introCanvas.height = window.innerHeight;
        introParticlesArray = [];
        const quantity = Math.min(Math.floor((introCanvas.width * introCanvas.height) / 11000), 100);
        for (let i = 0; i < quantity; i++) {
            introParticlesArray.push(new IntroParticle());
        }
    }

    function animateIntroCanvas() {
        if (!introCanvas) return;
        introCtx.clearRect(0, 0, introCanvas.width, introCanvas.height);
        
        for (let i = 0; i < introParticlesArray.length; i++) {
            introParticlesArray[i].update();
            introParticlesArray[i].draw();
        }
        
        // Connect lines (only if not transitioning out)
        if (!isTransitioningOut) {
            for (let a = 0; a < introParticlesArray.length; a++) {
                for (let b = a; b < introParticlesArray.length; b++) {
                    const dx = introParticlesArray[a].x - introParticlesArray[b].x;
                    const dy = introParticlesArray[a].y - introParticlesArray[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 110) {
                        const opacity = (1 - distance / 110) * 0.14;
                        introCtx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        introCtx.lineWidth = 0.55;
                        introCtx.beginPath();
                        introCtx.moveTo(introParticlesArray[a].x, introParticlesArray[a].y);
                        introCtx.lineTo(introParticlesArray[b].x, introParticlesArray[b].y);
                        introCtx.stroke();
                    }
                }
            }
        }

        introAnimationFrameId = requestAnimationFrame(animateIntroCanvas);
    }

    initIntroCanvas();
    animateIntroCanvas();

    window.addEventListener("resize", () => {
        if (introCanvas) {
            introCanvas.width = window.innerWidth;
            introCanvas.height = window.innerHeight;
            initIntroCanvas();
        }
    });

    /* --- 2.2. TIMELINE TIMING CONTROL --- */
    let hasSkipped = false;
    let preloaderTimeouts = [];

    function delay(ms) {
        return new Promise(resolve => {
            const id = setTimeout(resolve, ms);
            preloaderTimeouts.push(id);
        });
    }

    // Typewriter animations for titles (optimized for premium speed)
    function typeText(word) {
        return new Promise(resolve => {
            let i = 0;
            introTypingText.textContent = "";
            const interval = setInterval(() => {
                if (hasSkipped) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                introTypingText.textContent += word.charAt(i);
                i++;
                if (i >= word.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, 30); // 30ms per char
        });
    }

    function deleteText() {
        return new Promise(resolve => {
            let text = introTypingText.textContent;
            const interval = setInterval(() => {
                if (hasSkipped) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                text = text.substring(0, text.length - 1);
                introTypingText.textContent = text;
                if (text.length === 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 12); // 12ms per char
        });
    }

    // Smooth counter stats
    function animateCounter(element) {
        return new Promise(resolve => {
            const target = parseInt(element.getAttribute("data-target"), 10);
            const duration = 1200;
            const startTimestamp = performance.now();

            function step(now) {
                if (hasSkipped) {
                    element.textContent = target;
                    resolve();
                    return;
                }
                const progress = Math.min((now - startTimestamp) / duration, 1);
                // Ease out quad
                const ease = progress * (2 - progress);
                element.textContent = Math.floor(ease * target);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    element.textContent = target;
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    // The sequential execution loop
    async function runTimeline() {
        if (hasSkipped) return;

        // STEP 1: Logo Reveal (0.0s - 1.2s)
        introBrand.classList.add("active");
        
        await delay(800);
        if (hasSkipped) return;
        introLogo.classList.add("pulse-logo");

        // STEP 2: Name Reveal (1.2s - 2.4s)
        // Handled via CSS slide-up transition delay
        await delay(1200);
        if (hasSkipped) return;
        
        introBrand.classList.add("exit");
        await delay(600);
        if (hasSkipped) return;
        introBrand.classList.remove("active", "exit");

        // STEP 3: Titles typing (2.4s - 7.1s)
        introTitles.classList.add("active");
        const titles = [
            "Web Designer",
            "Frontend Developer",
            "Creative Problem Solver",
            "Digital Experience Creator"
        ];

        for (let i = 0; i < titles.length; i++) {
            if (hasSkipped) return;
            await typeText(titles[i]);
            await delay(500); //snappy word display
            if (hasSkipped) return;
            if (i < titles.length - 1) {
                await deleteText();
                await delay(100); //brief pause before typing next
            }
        }

        await delay(200);
        if (hasSkipped) return;
        introTitles.classList.add("exit");
        await delay(600);
        if (hasSkipped) return;
        introTitles.classList.remove("active", "exit");

        // STEP 4: Slogans Screen (7.1s - 8.9s)
        introSlogan.classList.add("active");
        const slogans = [
            "Turning Ideas Into Powerful Digital Experiences.",
            "Designing Tomorrow, One Website at a Time.",
            "Where Creativity Meets Technology.",
            "Building Modern Websites That Inspire.",
            "Transforming Visions Into Reality."
        ];
        
        // Use the primary visual brand slogan
        introSloganText.textContent = slogans[0];

        await delay(1200);
        if (hasSkipped) return;
        introSlogan.classList.add("exit");
        await delay(600);
        if (hasSkipped) return;
        introSlogan.classList.remove("active", "exit");

        // STEP 5: Stats Panels (8.9s - 11.4s)
        introStats.classList.add("active");
        await delay(300);
        if (hasSkipped) return;

        // Trigger all count-ups in parallel
        const counterAnimations = Array.from(introStatNums).map(el => animateCounter(el));
        await Promise.all(counterAnimations);

        await delay(1000);
        if (hasSkipped) return;

        // STEP 6: Reveal Animation
        executeReveal();
    }

    // Perform dramatic visual reveal transition
    function executeReveal() {
        if (isTransitioningOut) return;
        isTransitioningOut = true;

        // 1. Trigger light burst overlay
        if (revealLightBurst) {
            revealLightBurst.classList.add("active");
        }

        // 2. Swoosh sound placeholder trigger (if loaded)
        // if (typeof swooshAudio !== 'undefined') playRevealSound();

        setTimeout(() => {
            // 3. Zoom-out/Fade loader
            if (loader) {
                loader.classList.add("reveal-out");
            }

            setTimeout(() => {
                // 4. Cleanup elements
                if (loader) {
                    loader.style.display = "none";
                }
                body.classList.remove("preloader-active");
                cancelAnimationFrame(introAnimationFrameId);
                
                // Refresh Scroll Reveals on main page
                window.dispatchEvent(new Event('scroll'));
            }, 1200); // Wait for transition reveal-out
        }, 500); // Initial delay to show light burst
    }

    // Skip Intro Button handler
    if (skipBtn) {
        skipBtn.addEventListener("click", () => {
            hasSkipped = true;
            preloaderTimeouts.forEach(id => clearTimeout(id));
            executeReveal();
        });
    }

    // Run the intro on page parse
    runTimeline();

    /* ==========================================================================
       3. DARK / LIGHT THEME TOGGLER
       ========================================================================== */
    const themeToggleBtn = document.getElementById("theme-toggle");
    const htmlEl = document.documentElement;

    // Check localStorage or default system theme
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "light") {
        htmlEl.classList.remove("dark-theme");
        htmlEl.classList.add("light-theme");
    } else if (savedTheme === "dark") {
        htmlEl.classList.remove("light-theme");
        htmlEl.classList.add("dark-theme");
    } else {
        // Fallback to system preference
        if (systemPrefersDark) {
            htmlEl.classList.add("dark-theme");
            htmlEl.classList.remove("light-theme");
        } else {
            htmlEl.classList.add("light-theme");
            htmlEl.classList.remove("dark-theme");
        }
    }

    themeToggleBtn.addEventListener("click", () => {
        if (htmlEl.classList.contains("dark-theme")) {
            htmlEl.classList.remove("dark-theme");
            htmlEl.classList.add("light-theme");
            localStorage.setItem("theme", "light");
        } else {
            htmlEl.classList.remove("light-theme");
            htmlEl.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        }
    });

    /* ==========================================================================
       3.5. VIEWPORT TOGGLER (Desktop/Mobile)
       ========================================================================== */
    const viewportToggleBtn = document.getElementById("viewport-toggle");
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (viewportToggleBtn && viewportMeta) {
        const iconDesktop = viewportToggleBtn.querySelector(".icon-desktop");
        const iconMobile = viewportToggleBtn.querySelector(".icon-mobile");
        let isDesktopForced = false;

        viewportToggleBtn.addEventListener("click", () => {
            isDesktopForced = !isDesktopForced;
            if (isDesktopForced) {
                // Force desktop viewport
                viewportMeta.setAttribute("content", "width=1200");
                if (iconDesktop) iconDesktop.style.display = "none";
                if (iconMobile) iconMobile.style.display = "inline-block";
            } else {
                // Revert to responsive mobile viewport
                viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
                if (iconDesktop) iconDesktop.style.display = "inline-block";
                if (iconMobile) iconMobile.style.display = "none";
            }
        });
    }

    /* ==========================================================================
       4. MOBILE NAVIGATION MENU (Hamburger)
       ========================================================================== */
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        
        // Prevent body scroll when menu is active on mobile
        if (navMenu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
        });
    });

    /* ==========================================================================
       5. STICKY NAVBAR & NAVIGATION LINK HIGHLIGHTING
       ========================================================================== */
    const navbar = document.getElementById("navbar");
    const sections = document.querySelectorAll("section[id]");

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
        highlightActiveSection();
    }

    function highlightActiveSection() {
        let scrollY = window.scrollY;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Offset for sticky nav
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.add("active");
            } else {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.remove("active");
            }
        });
    }

    window.addEventListener("scroll", handleNavbarScroll);
    handleNavbarScroll(); // Trigger on init

    /* ==========================================================================
       6. HERO TYPING TEXT ANIMATION
       ========================================================================== */
    const typingText = document.getElementById("typing-text");
    const words = ["Web Designer", "Frontend Developer", "Creative Developer", "UI/UX Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
            typeSpeed = 50; // Deleting is faster
        } else {
            charIndex++;
            typeSpeed = 100;
        }

        typingText.textContent = currentWord.substring(0, charIndex);

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 1500; // Pause at full word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Small pause before next word
        }

        setTimeout(type, typeSpeed);
    }
    
    if (typingText) {
        setTimeout(type, 1000); // Start typing animation
    }

    /* ==========================================================================
       7. INTERACTIVE CANVAS PARTICLE SYSTEM
       ========================================================================== */
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    
    let particlesArray = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 90; // Adjust for performance
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.speedY = Math.random() * 0.8 - 0.4;
            this.baseSize = this.size;
        }

        draw() {
            // Particle color responsive to current theme
            const isDark = htmlEl.classList.contains("dark-theme");
            ctx.fillStyle = isDark ? "rgba(124, 58, 237, 0.45)" : "rgba(37, 99, 235, 0.3)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

            // Mouse interaction (gravity avoidance)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * 3;
                    let directionY = forceDirectionY * force * 3;
                    this.x -= directionX;
                    this.y -= directionY;
                    this.size = this.baseSize * 1.5;
                } else {
                    if (this.size > this.baseSize) this.size -= 0.05;
                }
            } else {
                if (this.size > this.baseSize) this.size -= 0.05;
            }
        }
    }

    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    function connectParticles() {
        let opacityValue = 1;
        const isDark = htmlEl.classList.contains("dark-theme");
        const maxDistance = 110;
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    opacityValue = 1 - (distance / maxDistance);
                    ctx.strokeStyle = isDark 
                        ? `rgba(139, 92, 246, ${opacityValue * 0.15})` 
                        : `rgba(37, 99, 235, ${opacityValue * 0.12})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Initialize and run Canvas
    initParticles();
    animateParticles();

    // Canvas resize adjustments
    window.addEventListener("resize", () => {
        initParticles();
    });

    /* ==========================================================================
       8. SCROLL REVEAL (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll(
        ".reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-zoom"
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Optional: Stop observing after reveal if static appearance is preferred
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.10, // Triggers when 10% of element is in view
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       9. STATS COUNT-UP ANIMATION
       ========================================================================== */
    const counters = document.querySelectorAll(".counter-num, .stat-num");
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const limit = parseInt(target.getAttribute("data-target"), 10);
                let count = 0;
                const speed = limit / 60; // Steps to reach limit in ~1s
                
                function updateCounter() {
                    count += speed;
                    if (count < limit) {
                        target.textContent = Math.ceil(count);
                        setTimeout(updateCounter, 16); // ~60fps
                    } else {
                        target.textContent = limit;
                    }
                }
                
                updateCounter();
                observer.unobserve(target); // Only count once
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(c => counterObserver.observe(c));

    /* ==========================================================================
       10. PROJECTS FILTERING
       ========================================================================== */
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from buttons, add to clicked
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            projectCards.forEach(card => {
                const cardCat = card.getAttribute("data-category");
                
                if (filterValue === "all" || cardCat === filterValue) {
                    card.style.display = "block";
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.9)";
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 300);
                }
            });
        });
    });

    /* ==========================================================================
       11. TESTIMONIALS SLIDER
       ========================================================================== */
    const sliderContainer = document.getElementById("slider-container");
    const slides = document.querySelectorAll(".testimonial-slide");
    const dotsContainer = document.getElementById("slider-dots");
    
    let currentSlide = 0;
    let slideInterval;

    if (sliderContainer && slides.length > 0) {
        // Create dots dynamically
        slides.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.classList.add("slider-dot");
            if (idx === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                goToSlide(idx);
                resetSlideTimer();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll(".slider-dot");

        function goToSlide(n) {
            currentSlide = n;
            sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Highlight active dot
            dots.forEach(d => d.classList.remove("active"));
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add("active");
            }
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }

        function startSlideTimer() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function resetSlideTimer() {
            clearInterval(slideInterval);
            startSlideTimer();
        }

        startSlideTimer();
    }

    /* ==========================================================================
       12. BACK TO TOP BUTTON
       ========================================================================== */
    const backToTopBtn = document.getElementById("back-to-top");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 600) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    /* ==========================================================================
       13. CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const form = document.getElementById("contact-form");
    const successFeedback = document.getElementById("form-success");
    const errorFeedback = document.getElementById("form-error");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        const inputs = form.querySelectorAll("input[required], textarea[required]");

        inputs.forEach(input => {
            const group = input.parentElement;
            
            // Simple validation check
            if (!input.value.trim()) {
                group.classList.add("invalid");
                isFormValid = false;
            } else if (input.type === "email") {
                // Regex for email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    group.classList.add("invalid");
                    isFormValid = false;
                } else {
                    group.classList.remove("invalid");
                }
            } else {
                group.classList.remove("invalid");
            }

            // Remove invalid class on typing
            input.addEventListener("input", () => {
                group.classList.remove("invalid");
            });
        });

        if (isFormValid) {
            const submitBtn = form.querySelector(".btn-submit");
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Show sending spinner / disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Sending... <i data-lucide="loader" class="loader-rotate" style="animation: rotate 1s linear infinite"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons(); // refresh icons inside button
            
            // Simulate API Request
            setTimeout(() => {
                successFeedback.style.display = "flex";
                errorFeedback.style.display = "none";
                form.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                
                // Hide feedback after 5 seconds
                setTimeout(() => {
                    successFeedback.style.display = "none";
                }, 5000);

            }, 1800);
        } else {
            errorFeedback.style.display = "flex";
            successFeedback.style.display = "none";
            
            setTimeout(() => {
                errorFeedback.style.display = "none";
            }, 5000);
        }
    });

    /* ==========================================================================
       14. MOUSE GLOW DECORATIVE EFFECT
       ========================================================================== */
    // Smoothly update CSS variables matching mouse movement for Aurora backgrounds
    const auroraGlows = document.querySelectorAll(".aurora-glow");
    
    window.addEventListener("mousemove", (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        // Slightly displace aurora backgrounds on cursor position for subtle 3D effect
        auroraGlows.forEach((glow, idx) => {
            const offset = (idx + 1) * 12;
            const displaceX = (x - window.innerWidth / 2) / offset;
            const displaceY = (y - window.innerHeight / 2) / offset;
            glow.style.transform = `translate(${displaceX}px, ${displaceY}px)`;
        });
    });
});
