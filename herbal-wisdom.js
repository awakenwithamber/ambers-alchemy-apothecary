// ============================================================
// HERBAL WISDOM LIBRARY — Article Toggle, Filtering & Enhanced Products
// ============================================================
(function() {

  // ---- ARTICLE ACCORDION ----
  document.querySelectorAll('.hw-article-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var article = this.closest('.hw-article');
      article.classList.toggle('open');
    });
  });

  // Open first article by default
  var firstArticle = document.querySelector('.hw-article');
  if (firstArticle) firstArticle.classList.add('open');

  // ---- CATEGORY FILTER ----
  document.querySelectorAll('.hw-nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cat = this.dataset.hwcat;

      document.querySelectorAll('.hw-nav-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');

      document.querySelectorAll('.hw-article').forEach(function(article) {
        if (cat === 'all' || article.dataset.hwcat === cat) {
          article.style.display = '';
        } else {
          article.style.display = 'none';
        }
      });
    });
  });

  // ---- ENHANCED PRODUCT RENDERING ----
  // Extend the renderProductCard function to include more detail
  var PRODUCT_DETAILS = {
    'beauty-balm': {
      hook: 'Turn Back the Clock with Nature\'s Most Powerful Botanicals',
      benefits: ['Visibly firms and tightens skin texture', 'Deep botanical hydration without chemicals', 'Restores natural radiance and glow', 'Reduces the appearance of fine lines'],
      howItWorks: 'Our proprietary blend of rose hip, frankincense, sea buckthorn, and neroli work synergistically to deliver antioxidants deep into the skin. These botanicals stimulate collagen-supportive pathways while protecting against environmental damage.',
      isThisForYou: 'This balm is perfect for anyone experiencing dull skin, fine lines, dryness, or loss of firmness — especially if you want results without synthetic chemicals.',
      objections: ['100% Natural Ingredients', 'No Synthetic Fillers', 'Small-Batch Handcrafted', 'Visible Results in 2-4 Weeks'],
      upsells: ['pain-balm', 'hair-serum'],
      faq: [
        { q: 'How long before I see results?', a: 'Most customers notice softer, more hydrated skin within the first week. Visible firming and glow typically appear within 2-4 weeks of consistent use.' },
        { q: 'Can I use this with other skincare?', a: 'Yes! Apply as the last step in your routine. It works beautifully over serums and under makeup.' }
      ]
    },
    'pain-balm': {
      hook: 'Deep, Natural Relief That Your Body Has Been Craving',
      benefits: ['Penetrating relief for sore muscles and joints', 'Warming botanical formula increases circulation', 'No synthetic painkillers or chemicals', 'Fast-acting comfort that lasts for hours'],
      howItWorks: 'Arnica, cayenne, wintergreen, and comfrey create a powerful synergy — warming the area to increase blood flow while delivering anti-inflammatory plant compounds directly to the source of discomfort.',
      isThisForYou: 'Ideal for chronic pain sufferers, athletes, active people, or anyone dealing with muscle tension, joint stiffness, or inflammation who wants natural relief.',
      objections: ['Lab-Free Formula', 'Handcrafted with Care', 'Used by Hundreds', 'No Side Effects'],
      upsells: ['beauty-balm', 'vital-vitality'],
      faq: [
        { q: 'How often can I apply it?', a: 'Apply 2-3 times daily to affected areas. For best results, massage gently and allow the warming sensation to develop.' },
        { q: 'Is the warming sensation strong?', a: 'It\'s a gentle, therapeutic warmth — not overwhelming. The cayenne increases circulation to promote natural healing.' }
      ]
    },
    'vital-vitality': {
      hook: 'Wake Up Energized Without the Crash or Jitters',
      benefits: ['Sustained all-day energy from adaptogens', 'Enhanced mental clarity and focus', 'No caffeine crashes or dependency', 'Supports adrenal health long-term'],
      howItWorks: 'Ashwagandha, rhodiola, eleuthero, and maca work together to regulate cortisol, support mitochondrial energy production, and nourish the adrenal glands — giving you clean, sustained energy.',
      isThisForYou: 'Perfect for anyone tired of coffee crashes, afternoon slumps, or brain fog. If you need energy that lasts without side effects, this is your formula.',
      objections: ['Adaptogen-Powered', 'No Caffeine Crash', 'Builds Over Time', 'Pure Botanical Formula'],
      upsells: ['dreamease', 'immune-at-ease'],
      faq: [
        { q: 'When should I take it?', a: 'Take in the morning with food. Effects build over 1-2 weeks of consistent use as adaptogens restore adrenal balance.' },
        { q: 'Can I take it with coffee?', a: 'Yes, but many customers find they naturally reduce coffee intake as the adaptogenic energy builds.' }
      ]
    }
  };

  // Store for use by app.js product rendering
  window.PRODUCT_DETAILS = PRODUCT_DETAILS;

  // Function to generate enhanced product detail HTML
  window.getEnhancedProductHTML = function(productId) {
    var details = PRODUCT_DETAILS[productId];
    if (!details) return '';

    var html = '';

    // Emotional hook
    html += '<div class="product-detail-section"><p style="font-family:Cinzel,serif;color:var(--brass-lt,#B8945A);font-size:1.1rem;font-style:italic;text-align:center;margin-bottom:0">"' + details.hook + '"</p></div>';

    // Benefits
    html += '<div class="product-detail-section"><h4>Key Benefits</h4><ul class="product-benefits-list">';
    details.benefits.forEach(function(b) { html += '<li>' + b + '</li>'; });
    html += '</ul></div>';

    // How it works
    html += '<div class="product-detail-section"><h4>How It Works</h4><p style="font-family:Lora,serif;color:rgba(243,235,221,0.85);font-size:0.92rem;line-height:1.7">' + details.howItWorks + '</p></div>';

    // Is this for you?
    html += '<div class="product-detail-section"><h4>Is This For You?</h4><p style="font-family:Lora,serif;color:rgba(243,235,221,0.85);font-size:0.92rem;line-height:1.7">' + details.isThisForYou + '</p></div>';

    // Objection killers
    html += '<div class="product-detail-section"><h4>Why Choose This Formula</h4><div class="product-objection-killers">';
    details.objections.forEach(function(o) { html += '<div class="product-objection-item"><span style="color:var(--brass,#8C6A3B)">✦</span> ' + o + '</div>'; });
    html += '</div></div>';

    // FAQ
    if (details.faq && details.faq.length) {
      html += '<div class="product-detail-section"><h4>Common Questions</h4>';
      details.faq.forEach(function(f) {
        html += '<div class="product-faq-item"><div class="product-faq-q">' + f.q + '</div><div class="product-faq-a">' + f.a + '</div></div>';
      });
      html += '</div>';
    }

    // Related reading links
    html += '<div class="hw-internal-links"><p><strong>Learn More:</strong> ';
    html += '<a href="#" data-section="herbal-wisdom">Articles &amp; Guides</a> | ';
    html += '<a href="#" data-section="herb-index">Explore the Grimoire</a> | ';
    html += '<a href="#" data-section="custom-formula">Build a Custom Formula</a>';
    html += '</p></div>';

    return html;
  };

})();
