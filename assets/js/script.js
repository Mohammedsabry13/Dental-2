// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
  navbarScrollThreshold: 100,
  animationDuration: 600,
  sliderAutoPlayInterval: 5000,
  intersectionThreshold: 0.1,
  intersectionRootMargin: "0px 0px -50px 0px",
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// =====================================================
// NAVBAR FUNCTIONALITY
// =====================================================

/**
 * Handle navbar scroll effects and active states
 */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  if (!navbar) return;

  // Navbar scroll shadow effect
  window.addEventListener(
    "scroll",
    debounce(function () {
      const currentScroll = window.pageYOffset;

      if (currentScroll > CONFIG.navbarScrollThreshold) {
        navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
      } else {
        navbar.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      }
    }, 10)
  );

  // Active state on scroll
  window.addEventListener(
    "scroll",
    debounce(function () {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
            }
          });
        }
      });
    }, 10)
  );

  // Smooth scrolling for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href && href.startsWith("#") && href !== "#navbarNav") {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const navbarHeight = navbar.offsetHeight;
          const targetPosition = target.offsetTop - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          // Close mobile menu if open
          const navbarCollapse = document.querySelector(".navbar-collapse");
          if (navbarCollapse && navbarCollapse.classList.contains("show")) {
            navbarCollapse.classList.remove("show");
          }

          // Update active state
          navLinks.forEach((l) => l.classList.remove("active"));
          this.classList.add("active");
        }
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (event) {
    const navbarCollapse = document.querySelector(".navbar-collapse");
    const navbarToggler = document.querySelector(".navbar-toggler");

    if (
      navbarCollapse &&
      navbarCollapse.classList.contains("show") &&
      !navbar.contains(event.target) &&
      (!navbarToggler || !navbarToggler.contains(event.target))
    ) {
      navbarCollapse.classList.remove("show");
    }
  });
}

// =====================================================
// HERO SLIDER FUNCTIONALITY
// =====================================================

/**
 * Initialize hero slider with Swiper
 */
function initHeroSlider() {
  const heroSwiper = new Swiper(".heroSwiper", {
    loop: true,
    autoplay: {
      delay: CONFIG.sliderAutoPlayInterval || 5000,
      disableOnInteraction: false,
    },
    speed: 800,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

// =====================================================
// BEFORE/AFTER COMPARISON SLIDER
// =====================================================

/**
 * Initialize before/after comparison slider
 */
function initComparisonSlider() {
  const slider = document.getElementById("comparisonHandle");
  const afterImage = document.getElementById("afterImage");
  const container = document.getElementById("comparisonSlider");

  if (!slider || !afterImage || !container) return;

  let isDragging = false;
  let hasInteracted = false;

  // Update slider position
  const updateSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let position = ((clientX - rect.left) / rect.width) * 100;
    position = Math.max(0, Math.min(100, position));

    slider.style.left = `${position}%`;
    afterImage.style.clipPath = `inset(0 0 0 ${position}%)`;
  };

  // Mark as interacted
  const markAsInteracted = () => {
    if (!hasInteracted) {
      hasInteracted = true;
      container.classList.add("interacted");
    }
  };

  // Start dragging
  const startDragging = (e) => {
    isDragging = true;
    slider.classList.add("dragging");
    markAsInteracted();
    if (e.type === "mousedown") e.preventDefault();
  };

  // Stop dragging
  const stopDragging = () => {
    isDragging = false;
    slider.classList.remove("dragging");
  };

  // Handle move
  const onMove = (e) => {
    if (!isDragging) return;
    const x = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    updateSlider(x);
  };

  // Mouse events
  slider.addEventListener("mousedown", startDragging);
  document.addEventListener("mouseup", stopDragging);
  document.addEventListener("mousemove", onMove);

  // Touch events
  slider.addEventListener("touchstart", startDragging);
  document.addEventListener("touchend", stopDragging);
  document.addEventListener("touchmove", onMove, { passive: false });

  // Click on container
  container.addEventListener("click", (e) => {
    if (e.target !== slider && !slider.contains(e.target)) {
      updateSlider(e.clientX);
      markAsInteracted();
    }
  });

  // Initialize slider
  const initSlider = () => {
    updateSlider(
      container.getBoundingClientRect().left + container.offsetWidth / 2
    );
    setTimeout(runHintAnimation, 1000);
  };

  // Hint animation
  const runHintAnimation = () => {
    let position = 50;
    let direction = 1;
    let cycles = 0;

    const autoSlide = setInterval(() => {
      if (hasInteracted || cycles >= 4) {
        clearInterval(autoSlide);
        updateSlider(
          container.getBoundingClientRect().left + container.offsetWidth / 2
        );
        return;
      }

      position += direction * 1.5;
      if (position >= 65 || position <= 35) {
        direction *= -1;
        cycles++;
      }

      slider.style.left = `${position}%`;
      afterImage.style.clipPath = `inset(0 0 0 ${position}%)`;
    }, 20);
  };

  window.addEventListener("load", initSlider);
}


// =====================================================
// BUTTON RIPPLE EFFECT
// =====================================================

/**
 * Add ripple effect to all buttons
 */
function initButtonRippleEffect() {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.position = "absolute";
      ripple.style.borderRadius = "50%";
      ripple.style.backgroundColor = "rgba(255,255,255,0.5)";
      ripple.style.pointerEvents = "none";
      ripple.style.animation = "ripple 0.6s ease-out";

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple animation CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      from {
        transform: scale(0);
        opacity: 1;
      }
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// =====================================================
// FORM VALIDATION
// =====================================================

/**
 * Initialize form validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add("was-validated");
    });
  });
}

// =====================================================
// LUCIDE ICONS INITIALIZATION
// =====================================================

/**
 * Initialize Lucide icons
 */
function initLucideIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// =====================================================
// MAIN INITIALIZATION
// =====================================================

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all modules
  initNavbar();
  initHeroSlider();
  initComparisonSlider();
  initScrollAnimations();
  initCardHoverEffects();
  initButtonRippleEffect();
  initFormValidation();
  initLucideIcons();

  // Console welcome message
  console.log(
    "%c🦷 Dentexa Dental Care",
    "color: #00a19a; font-size: 20px; font-weight: bold;"
  );
  console.log(
    "%cWebsite loaded successfully!",
    "color: #1a2c4e; font-size: 14px;"
  );
});

// =====================================================
// WINDOW LOAD EVENT
// =====================================================

/**
 * Additional initialization after full page load
 */
window.addEventListener("load", function () {
  // Re-initialize icons after dynamic content
  initLucideIcons();
});

function initScrollAnimations() {
  const observerOptions = {
    threshold: CONFIG.intersectionThreshold,
    rootMargin: CONFIG.intersectionRootMargin,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".dentexa-about-text-content, .dentexa-about-image-container"
  );

  animateElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = `opacity ${CONFIG.animationDuration}ms ease-out, transform ${CONFIG.animationDuration}ms ease-out`;
    observer.observe(el);
  });
}
