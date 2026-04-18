// ============================================================
// SOAP GALLERY LIGHTBOX
// ============================================================

// All soap images available in the gallery
const SOAP_GALLERY_IMAGES = (typeof SOAPS !== 'undefined' && SOAPS.length > 0)
  ? SOAPS.filter(s => s.illustration).map(s => ({
      src: s.illustration,
      caption: s.name + ' — ' + (s.desc || 'Handcrafted Artisan Soap').substring(0, 60),
      alt: s.name
    }))
  : [
  { src: 'images/soap-rose-clay.png', caption: "Gaia's Rose Collection — Handcrafted Artisan Soaps", alt: "Rose collection soaps" },
  { src: 'images/soap-rose-clay.png', caption: 'Rose Petal & Pink Clay — Luxurious botanical bar', alt: 'Rose petal clay soap' },
  { src: 'images/soap-charcoal-mint.png', caption: 'Activated Charcoal & Peppermint — Deep cleansing ritual', alt: 'Charcoal mint soap' },
  { src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-hibiscus_6042e55f.jpg', caption: 'Hibiscus & Rose — Antioxidant-rich botanical beauty', alt: 'Hibiscus rose soap' },
  { src: 'images/soap-frankincense-myrrh.png', caption: 'Frankincense & Myrrh — Sacred ritual bar', alt: 'Frankincense myrrh soap' },
  { src: 'images/soap-turmeric-glow.png', caption: 'Turmeric Glow — Brightening Ayurvedic bar', alt: 'Turmeric glow soap' },
  { src: 'images/soap-cedar-sage.png', caption: 'Cedarwood & White Sage — Forest grounding ritual', alt: 'Cedar sage soap' },
  { src: 'images/soap-lavender-honey.png', caption: "Amber's Apothecary — Full Artisan Soap Collection", alt: 'Soap collection' },
];

let galleryState = {
  currentIndex: 0,
  isOpen: false
};

function openSoapGallery(startIndex = 0) {
  galleryState.currentIndex = startIndex;
  galleryState.isOpen = true;

  const existing = document.getElementById('soap-gallery-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'soap-gallery-modal';
  modal.className = 'soap-gallery-overlay';
  modal.innerHTML = `
    <div class="soap-gallery-container">
      <button class="soap-gallery-close" onclick="closeSoapGallery()">✕</button>
      <button class="soap-gallery-nav soap-gallery-prev" onclick="soapGalleryPrev()">‹</button>
      <button class="soap-gallery-nav soap-gallery-next" onclick="soapGalleryNext()">›</button>

      <div class="soap-gallery-main">
        <img id="soap-gallery-img" src="${SOAP_GALLERY_IMAGES[startIndex].src}"
          alt="${SOAP_GALLERY_IMAGES[startIndex].alt}"
          class="soap-gallery-main-img"
          onerror="this.style.opacity='0.3'">
        <p id="soap-gallery-caption" class="soap-gallery-caption">
          ${SOAP_GALLERY_IMAGES[startIndex].caption}
        </p>
        <p class="soap-gallery-counter">
          <span id="soap-gallery-count">${startIndex + 1}</span> / ${SOAP_GALLERY_IMAGES.length}
        </p>
      </div>

      <div class="soap-gallery-thumbnails">
        ${SOAP_GALLERY_IMAGES.map((img, i) => `
          <button class="soap-gallery-thumb ${i === startIndex ? 'active' : ''}"
            onclick="soapGalleryGoTo(${i})"
            data-index="${i}">
            <img src="${img.src}" alt="${img.alt}" onerror="this.style.opacity='0.3'">
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSoapGallery();
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleGalleryKeydown);
  modal.style.animation = 'galleryFadeIn 0.3s ease';
}

function closeSoapGallery() {
  galleryState.isOpen = false;
  const modal = document.getElementById('soap-gallery-modal');
  if (modal) {
    modal.style.animation = 'galleryFadeOut 0.3s ease forwards';
    setTimeout(() => modal.remove(), 300);
  }
  document.removeEventListener('keydown', handleGalleryKeydown);
}

function soapGalleryGoTo(index) {
  galleryState.currentIndex = index;
  const img = document.getElementById('soap-gallery-img');
  const caption = document.getElementById('soap-gallery-caption');
  const count = document.getElementById('soap-gallery-count');
  const thumbs = document.querySelectorAll('.soap-gallery-thumb');

  if (img) {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.95)';
    setTimeout(() => {
      img.src = SOAP_GALLERY_IMAGES[index].src;
      img.alt = SOAP_GALLERY_IMAGES[index].alt;
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }, 150);
  }
  if (caption) caption.textContent = SOAP_GALLERY_IMAGES[index].caption;
  if (count) count.textContent = index + 1;

  thumbs.forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });
}

function soapGalleryNext() {
  const next = (galleryState.currentIndex + 1) % SOAP_GALLERY_IMAGES.length;
  soapGalleryGoTo(next);
}

function soapGalleryPrev() {
  const prev = (galleryState.currentIndex - 1 + SOAP_GALLERY_IMAGES.length) % SOAP_GALLERY_IMAGES.length;
  soapGalleryGoTo(prev);
}

function handleGalleryKeydown(e) {
  if (!galleryState.isOpen) return;
  if (e.key === 'ArrowRight') soapGalleryNext();
  if (e.key === 'ArrowLeft') soapGalleryPrev();
  if (e.key === 'Escape') closeSoapGallery();
}

// Make soap images clickable when rendered
function initSoapGallery() {
  // Add click handlers to all soap card images
  document.querySelectorAll('.soap-card-img, .soap-img, [data-soap-gallery]').forEach((img, index) => {
    img.style.cursor = 'zoom-in';
    img.title = 'Click to view gallery';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      // Find the closest matching gallery image by src
      const src = img.src || img.getAttribute('src') || '';
      const matchIndex = SOAP_GALLERY_IMAGES.findIndex(g => g.src === src);
      openSoapGallery(matchIndex >= 0 ? matchIndex : 0);
    });
  });

  // Also add a "View All Soaps" button to the soaps section if it exists
  const soapsSection = document.getElementById('soaps') || document.querySelector('[data-section="soaps"]');
  if (soapsSection && !soapsSection.querySelector('.soap-gallery-btn')) {
    const btn = document.createElement('button');
    btn.className = 'soap-gallery-btn';
    btn.innerHTML = '📸 View All Soap Photos';
    btn.onclick = () => openSoapGallery(0);
    const header = soapsSection.querySelector('.section-header, h2, .section-title');
    if (header) header.after(btn);
  }
}

// Initialize when DOM is ready and re-init after dynamic renders
document.addEventListener('DOMContentLoaded', () => setTimeout(initSoapGallery, 500));
