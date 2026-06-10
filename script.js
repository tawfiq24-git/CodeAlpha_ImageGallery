document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // DOM ELEMENTS
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');

    // ==========================================================================
    // THEME CONTROLLER (DARK / LIGHT MODE)
    // ==========================================================================
    const getSavedTheme = () => localStorage.getItem('theme');
    const saveTheme = (theme) => localStorage.setItem('theme', theme);
    
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    // Initialize Theme
    const savedTheme = getSavedTheme();
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // System preference default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Toggle Theme
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            applyTheme('dark');
            saveTheme('dark');
        } else {
            applyTheme('light');
            saveTheme('light');
        }
    });

    // ==========================================================================
    // FILTERING CONTROLLER
    // ==========================================================================
    let currentFilter = 'all';
    
    // Helper to get active (visible) cards after filtering
    const getActiveCards = () => {
        return Array.from(galleryCards).filter(card => !card.classList.contains('hidden'));
    };

    const filterGallery = (filterValue) => {
        currentFilter = filterValue;
        
        galleryCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (filterValue === 'all' || cardCategory === filterValue) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Re-index only visible cards for clean lightbox traversal
        updateVisibleCardsIndices();
    };

    // Dynamically update data-index attribute of visible cards so they cycle correctly
    const updateVisibleCardsIndices = () => {
        const activeCards = getActiveCards();
        activeCards.forEach((card, idx) => {
            card.setAttribute('data-active-index', idx);
        });
    };

    // Initialize indices
    updateVisibleCardsIndices();

    // Filter Buttons Event Binds
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update Active Button State
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Execute Filter
            const filterValue = btn.getAttribute('data-filter');
            filterGallery(filterValue);
        });
    });

    // ==========================================================================
    // LIGHTBOX CONTROLLER
    // ==========================================================================
    let currentActiveIndex = 0;

    const openLightbox = (activeIndex) => {
        currentActiveIndex = parseInt(activeIndex, 10);
        updateLightboxContent();
        
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.focus();
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.classList.remove('loaded');
        
        // Enable background scrolling
        document.body.style.overflow = '';
    };

    const updateLightboxContent = () => {
        const activeCards = getActiveCards();
        if (activeCards.length === 0) return;
        
        // Ensure index wraps around safely
        if (currentActiveIndex >= activeCards.length) currentActiveIndex = 0;
        if (currentActiveIndex < 0) currentActiveIndex = activeCards.length - 1;
        
        const selectedCard = activeCards[currentActiveIndex];
        
        // Extract card info
        const imgSrc = selectedCard.querySelector('.gallery-img').src;
        const imgAlt = selectedCard.querySelector('.gallery-img').alt;
        const category = selectedCard.querySelector('.card-category').textContent;
        const title = selectedCard.querySelector('.card-title').textContent;
        const desc = selectedCard.querySelector('.card-desc').textContent;
        
        // Reset load state
        lightboxImg.classList.remove('loaded');
        
        // Load new image
        lightboxImg.src = imgSrc;
        lightboxImg.alt = imgAlt;
        
        // Smooth transition trigger when image is fully downloaded
        lightboxImg.onload = () => {
            lightboxImg.classList.add('loaded');
        };
        
        // Fallback in case of caching speed or dynamic loads
        if (lightboxImg.complete) {
            lightboxImg.classList.add('loaded');
        }

        // Apply metadata updates
        lightboxCategory.textContent = category;
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;
        lightboxCounter.textContent = `${currentActiveIndex + 1} / ${activeCards.length}`;
    };

    const showNext = () => {
        currentActiveIndex++;
        updateLightboxContent();
    };

    const showPrev = () => {
        currentActiveIndex--;
        updateLightboxContent();
    };

    // Card Clicks - Open Lightbox
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            // If card is hidden, do nothing
            if (card.classList.contains('hidden')) return;
            
            const activeIndex = card.getAttribute('data-active-index');
            openLightbox(activeIndex);
        });
    });

    // Control Event Binds
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });

    // Close on clicking overlay (but not elements inside content box)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard Navigation Binds
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                showNext();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
        }
    });
});
