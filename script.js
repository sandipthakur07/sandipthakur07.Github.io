document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('#mainNav .nav-list a[href^="#"]');
    const goTopBtn = document.getElementById('goTopBtn');
    const footerYearSpan = document.getElementById('footer-year');
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const sections = document.querySelectorAll('main section[id]');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Dark mode toggle button

    // --- Dark Mode Logic ---
    function applyInitialDarkMode() {
        const storedPreference = localStorage.getItem('darkMode');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedPreference === 'enabled' || (!storedPreference && systemPrefersDark)) {
            document.body.classList.add('dark-mode');
            if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('dark-mode'); // Ensure it's removed if disabled or no preference and system is light
            if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
        }
        updateToggleIconAndText();
    }

    function updateToggleIconAndText() {
        if (!darkModeToggle) return;
        const icon = darkModeToggle.querySelector('i');
        // const textSpan = darkModeToggle.querySelector('.toggle-text'); // Text is now sr-only

        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            darkModeToggle.title = "Switch to Light Mode";
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            darkModeToggle.title = "Switch to Dark Mode";
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.setAttribute('aria-pressed', isDarkMode.toString());
            updateToggleIconAndText();
        });
    }
    // Apply dark mode on initial load
    applyInitialDarkMode();

    // Listen for changes in system preference (optional, but good UX)
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only change if no user preference is stored
            if (!localStorage.getItem('darkMode')) {
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                    if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
                } else {
                    document.body.classList.remove('dark-mode');
                    if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
                }
                updateToggleIconAndText();
            }
        });
    }


    // --- Mobile Menu Toggle ---
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');

            const icon = menuToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Smooth Scroll & Close Mobile Menu on Link Click ---
    if (navLinks.length > 0 && mainNav) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const navHeight = mainNav.offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 15; // 15px offset

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }

                if (navList && navList.classList.contains('active')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- Close Mobile Menu on Click Outside ---
    if (menuToggle && navList && mainNav) {
        document.addEventListener('click', (e) => {
            // Check if click is outside mainNav AND menu is active AND not on menu toggle itself
            if (!mainNav.contains(e.target) && navList.classList.contains('active') && !menuToggle.contains(e.target) ) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Active Navigation Link Highlighting on Scroll ---
    const activateNavLink = () => {
        if (!mainNav || sections.length === 0 || navLinks.length === 0) return;

        let currentSectionId = '';
        const scrollPosition = window.pageYOffset;
        const navHeight = mainNav.offsetHeight;
        // Adjust offset: section is active when its top is within a certain range from viewport top, considering nav height
        const offsetThreshold = navHeight + (window.innerHeight * 0.3);


        sections.forEach(section => {
            const sectionTop = section.offsetTop - offsetThreshold; // When section top passes this point
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = sectionId;
            }
        });
        
        // Handle edge case: if scrolled to the very bottom, highlight the last section
        if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight -2 ) { // -2 for robustness
             if (sections.length > 0) {
                currentSectionId = sections[sections.length - 1].getAttribute('id');
            }
        }
        // Handle edge case: if scrolled to the very top (above first section content), no section is active
        // Use a slightly larger offset for deactivation to prevent flickering
        if (sections.length > 0 && scrollPosition < (sections[0].offsetTop - navHeight - 30)) {
             currentSectionId = '';
        }


        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active-link');
            }
        });
    };

    if (sections.length > 0) {
        window.addEventListener('scroll', activateNavLink, { passive: true });
        activateNavLink(); // Initial call to set active link on page load
    }


    // --- Go Top Button Logic ---
    if (goTopBtn) {
        const showGoTopButton = () => {
            const triggerHeight = window.innerHeight * 0.5; // Show button after scrolling half the viewport height
            if (window.pageYOffset > triggerHeight) {
                goTopBtn.classList.add('show');
            } else {
                goTopBtn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', showGoTopButton, { passive: true });
        goTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        showGoTopButton(); // Initial check
    }


    // --- Scroll Animations using Intersection Observer ---
    if ('IntersectionObserver' in window && elementsToAnimate.length > 0) {
        const observerOptions = {
            root: null, // relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        elementsToAnimate.forEach(el => observer.observe(el));

    } else {
        // Fallback for older browsers or if IntersectionObserver is not supported
        elementsToAnimate.forEach(el => el.classList.add('animated'));
    }


    // --- Update Footer Year ---
    if (footerYearSpan) {
        footerYearSpan.textContent = new Date().getFullYear();
    }

    console.log("Sandip Thakur Portfolio Script with Dark Mode Loaded Successfully.");

}); // End of DOMContentLoaded