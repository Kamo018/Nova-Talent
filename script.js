function showPage(pageId) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => section.classList.remove('active'));

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  const targetSection = document.getElementById(pageId);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeLink = Array.from(navLinks).find(
    link => link.dataset.page === pageId
  );
  if (activeLink) activeLink.classList.add('active');

  // Auto-play the Our Work reel when that tab opens, pause it otherwise
  const workVideo = document.getElementById('workVideo');
  if (workVideo) {
    if (pageId === 'work') {
      workVideo.currentTime = 0;
      workVideo.play().catch(() => {}); // browser may block autoplay; controls still let them hit play
    } else {
      workVideo.pause();
    }
  }

  // Close mobile nav after navigating
  document.getElementById('siteNav').classList.remove('open');

  // Reflect page in the URL hash without adding history spam
  history.replaceState(null, '', `#${pageId}`);
}

function filterModels(category) {
  const groups = document.querySelectorAll('.model-category');
  groups.forEach(group => {
    const matches = category === 'all' || group.dataset.categoryGroup === category;
    group.classList.toggle('hidden', !matches);
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

function toggleNav() {
  document.getElementById('siteNav').classList.toggle('open');
}

/* ---------- Hero slideshow ---------- */
/* Pulls its images straight from the model cards, so it stays in sync
   automatically as models/photos are added. Each model-card can list
   multiple photos via data-images="img1.jpg, img2.jpg" — all of them
   get folded into the rotation. */

function buildHeroSlideshow() {
  const container = document.getElementById('heroSlideshow');
  if (!container) return;

  const cards = document.querySelectorAll('#models .model-card');
  const slides = [];

  cards.forEach(card => {
    const img = card.querySelector('.model-img');
    if (!img) return; // still a placeholder, nothing to show yet

    const name = card.dataset.name || card.querySelector('h3')?.textContent || '';
    const imagesAttr = card.dataset.images;
    const sources = imagesAttr
      ? imagesAttr.split(',').map(s => s.trim()).filter(Boolean)
      : [img.getAttribute('src')];

    sources.forEach(src => slides.push({ src, name }));
  });

  if (slides.length === 0) {
    container.remove();
    return;
  }

  container.innerHTML = slides.map((s, i) => `
    <figure class="slide${i === 0 ? ' active' : ''}">
      <img src="${s.src}" alt="${s.name}">
      ${s.name ? `<figcaption>${s.name}</figcaption>` : ''}
    </figure>
  `).join('');

  if (slides.length > 1) {
    let current = 0;
    setInterval(() => {
      const allSlides = container.querySelectorAll('.slide');
      allSlides[current].classList.remove('active');
      current = (current + 1) % allSlides.length;
      allSlides[current].classList.add('active');
    }, 5000); // time each slide stays fully visible before the next fade begins
  }
}

/* ---------- Model profile modal ---------- */

let modalSlideInterval = null;

function initModelCards() {
  document.querySelectorAll('.model-card').forEach(card => {
    if (card.querySelector('.model-img')) {
      card.classList.add('has-photo');
    }
  });
}

function openModelProfile(card) {
  const img = card.querySelector('.model-img');
  if (!img) return; // no photo added for this model yet

  const name = card.dataset.name || card.querySelector('h3')?.textContent || '';
  const category = card.dataset.category || '';
  const bio = card.dataset.bio || 'Bio coming soon.';
  const video = card.dataset.video || '';
  const instagram = card.dataset.instagram || '';
  const tiktok = card.dataset.tiktok || '';
  const website = card.dataset.website || '';
  const imagesAttr = card.dataset.images;
  const images = imagesAttr
    ? imagesAttr.split(',').map(s => s.trim()).filter(Boolean)
    : [img.getAttribute('src')];

  document.getElementById('modalName').textContent = name;
  document.getElementById('modalCategory').textContent = category;
  document.getElementById('modalBio').textContent = bio;

  // Photo gallery: one photo visible at a time, slowly cross-fading to the next
  const gallery = document.getElementById('modalGallery');
  gallery.innerHTML = images.map((src, i) => `
    <div class="modal-slide${i === 0 ? ' active' : ''}">
      <img src="${src}" alt="${name}">
    </div>
  `).join('');

  if (modalSlideInterval) clearInterval(modalSlideInterval);
  if (images.length > 1) {
    let current = 0;
    modalSlideInterval = setInterval(() => {
      const slides = gallery.querySelectorAll('.modal-slide');
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3500);
  }

  // Intro video, only shown if this model has one
  const videoWrap = document.getElementById('modalVideoWrap');
  videoWrap.innerHTML = video
    ? `<video class="modal-video" src="${video}" controls playsinline></video>`
    : '';

  // Social links, only shown for the platforms this model has provided
  const socials = [
    { url: instagram, label: 'Instagram' },
    { url: tiktok, label: 'TikTok' },
    { url: website, label: 'Portfolio' }
  ].filter(s => s.url);

  const socialsWrap = document.getElementById('modalSocials');
  socialsWrap.innerHTML = socials
    .map(s => `<a href="${s.url}" target="_blank" rel="noopener" class="social-link">${s.label}</a>`)
    .join('');

  document.getElementById('modelModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModelProfile() {
  document.getElementById('modelModal').classList.remove('open');
  document.body.style.overflow = '';
  if (modalSlideInterval) {
    clearInterval(modalSlideInterval);
    modalSlideInterval = null;
  }
}

function closeModelProfileOnOverlay(event) {
  if (event.target.id === 'modelModal') closeModelProfile();
}

/* ---------- Our Work photo lightbox ---------- */

function initWorkPhotos() {
  document.querySelectorAll('.work-photo').forEach(tile => {
    if (tile.querySelector('img')) {
      tile.classList.add('has-photo');
    }
  });
}

function openWorkPhoto(tile) {
  const img = tile.querySelector('img');
  if (!img) return; // still a placeholder, nothing to open yet

  const lightboxImg = document.getElementById('lightboxImg');
  lightboxImg.src = img.getAttribute('src');
  lightboxImg.alt = img.getAttribute('alt') || '';

  document.getElementById('workLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWorkLightbox() {
  document.getElementById('workLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function closeWorkLightboxOnOverlay(event) {
  if (event.target.id === 'workLightbox') closeWorkLightbox();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModelProfile();
    closeWorkLightbox();
  }
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function handleContact(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString()
  })
    .then(() => {
      showToast("Thanks for reaching out — we'll be in touch shortly.");
      form.reset();
    })
    .catch(() => {
      showToast("Something went wrong — please email us directly instead.");
    });
}

function handleApply(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form); // sent as-is (multipart) so photo uploads go through

  fetch('/', {
    method: 'POST',
    body: data
  })
    .then(() => {
      showToast("Application received — our scouting team will review it soon.");
      form.reset();
    })
    .catch(() => {
      showToast("Something went wrong — please email us directly instead.");
    });
}

// Load whichever page matches the URL hash on first visit (defaults to home)
document.addEventListener('DOMContentLoaded', () => {
  const initial = window.location.hash.replace('#', '');
  const valid = ['home', 'about', 'work', 'models', 'join', 'contact'];
  showPage(valid.includes(initial) ? initial : 'home');

  initModelCards();
  initWorkPhotos();
  buildHeroSlideshow();
});