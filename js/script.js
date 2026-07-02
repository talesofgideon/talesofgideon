// Unregister any active service worker to solve browser caching/interception conflicts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Unregistered active service worker successfully.');
      });
    }
  }).catch(err => {
    console.error('Error unregistering service worker:', err);
  });
}

// Safe localStorage wrapper to prevent crashes in sandboxed iframes or systems restricting third-party storage
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage getItem blocked or unavailable:', e);
      return safeStorage.memoryStore[key] || null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage setItem blocked or unavailable:', e);
      safeStorage.memoryStore[key] = String(value);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage removeItem blocked or unavailable:', e);
      delete safeStorage.memoryStore[key];
    }
  },
  memoryStore: {}
};

// Dark Mode Toggle Logic
const initDarkMode = () => {
  const html = document.documentElement;
  
  const getStoredTheme = () => safeStorage.getItem('theme');
  const setStoredTheme = (theme) => safeStorage.setItem('theme', theme);
  
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      html.classList.add('dark-mode');
      html.classList.remove('light-mode');
    } else if (theme === 'light') {
      html.classList.add('light-mode');
      html.classList.remove('dark-mode');
    } else {
      html.classList.remove('dark-mode', 'light-mode');
    }
  };

  const toggleTheme = () => {
    const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 
                        (html.classList.contains('light-mode') ? 'light' : 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    setStoredTheme(newTheme);
    updateToggleIcons();

    // Close mobile menu if it's open
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('menu-toggle');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      if (menuToggle) {
        const icon = menuToggle.querySelector('svg');
        if (icon) {
          icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12" stroke-width="3"></line><line x1="3" y1="6" x2="21" y2="6" stroke-width="3"></line><line x1="3" y1="18" x2="21" y2="18" stroke-width="3"></line>';
        }
      }
    }
  };

  const updateToggleIcons = () => {
    // Icons are now handled by CSS classes on <html>
  };

  // Initial application
  const savedTheme = getStoredTheme();
  if (savedTheme) applyTheme(savedTheme);

  // Attach listeners to existing toggles
  document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  updateToggleIcons();
};

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('svg');
    if (mobileMenu.classList.contains('active')) {
      icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18" stroke-width="3"></line><line x1="6" y1="6" x2="18" y2="18" stroke-width="3"></line>';
    } else {
      icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12" stroke-width="3"></line><line x1="3" y1="6" x2="21" y2="6" stroke-width="3"></line><line x1="3" y1="18" x2="21" y2="18" stroke-width="3"></line>';
    }
  });

  // Close mobile menu on link click (only if it's an anchor on the same page)
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        mobileMenu.classList.remove('active');
        const icon = menuToggle.querySelector('svg');
        if (icon) {
          icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12" stroke-width="3"></line><line x1="3" y1="6" x2="21" y2="6" stroke-width="3"></line><line x1="3" y1="18" x2="21" y2="18" stroke-width="3"></line>';
        }
      }
      // For external/other page links, we let the browser navigate. 
      // Keeping the menu open until the new page loads prevents a "closing flicker".
    });
  });

  // Close mobile menu on window resize to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      const icon = menuToggle.querySelector('svg');
      if (icon) {
        icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12" stroke-width="3"></line><line x1="3" y1="6" x2="21" y2="6" stroke-width="3"></line><line x1="3" y1="18" x2="21" y2="18" stroke-width="3"></line>';
      }
    }
  });
}

// Scroll Top Button
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Newsletter Form Submission
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (email) {
      newsletterForm.innerHTML = '<p style="color: #000; font-weight: 500;">Thank you for subscribing!</p>';
    }
  });
}

// Fade-in on scroll
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Default Fallback Data Configurations
const defaultBooksData = {
  "Exodus": {
    "id": "1",
    "price": "$9.99",
    "desc": "EPUB & AUDIO",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 1,
    "image": "img/books/exodus_662x1000_72ppi.jpg",
    "subtitle": "New",
    "synopsis": "<p>Conner's best friend AJ and new friend quantum A.I George, help diagnose what's happening to Conner as his world begins to change.</p>\n<p>AJ's and George's realities change too as they join Conner on this adventure.</p>"
  },
  "Genesis": {
    "id": "2",
    "price": "$9.99",
    "desc": "EPUB & AUDIO",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 2,
    "image": "img/books/genesis_1600x2560_72ppi.jpg",
    "subtitle": "Coming Soon",
    "synopsis": "<p>Growing up in a military family, Conner is moved across the world to follow his fathers career, finally returning to California, a different person.</p>"
  },
  "Revelation": {
    "id": "3",
    "price": "$9.99",
    "desc": "EPUB & AUDIO",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 3,
    "image": "img/books/revelation_662x1000_72ppi.jpg",
    "subtitle": "Coming Soon",
    "synopsis": "<p>This story finds Conner investigating multiple realities, finding answers lost in time.</p>"
  }
};

const defaultMusicData = {
  "Exodus": {
    "id": "1",
    "price": "$9.99",
    "desc": "ALBUM & ART",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 1,
    "image": "img/music/album_cover_exodus_500x500_72ppi.jpg",
    "composer": "Score by Thomas Gideon",
    "description": "Captures the bittersweet essence of Exodus, a story of change rather than choice, family, and finding one's place in the world. The music is characterized by its gentle melodies, evoking the emotional journey of Conner Gideon."
  },
  "Genesis": {
    "id": "2",
    "price": "$9.99",
    "desc": "ALBUM & ART",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 2,
    "image": "img/music/album_cover_genesis_500x500_72ppi.jpg",
    "composer": "Score by Thomas Gideon",
    "description": "Documenting a story of growing up, independence, freedom of thought, characterized by different sometimes convergent melodies, and themes."
  },
  "Revelation": {
    "id": "3",
    "price": "$9.99",
    "desc": "ALBUM & ART",
    "status": "COMING SOON",
    "payment_url": "",
    "order": 3,
    "image": "img/music/album_cover_revelation_500x500_72ppi.jpg",
    "composer": "Score by Thomas Gideon",
    "description": "Exploring the emotional depth of Conner Gideons extraordinary life. Classical sensibilities with a modern influence, reflecting the novel's eventual conclusion."
  }
};

const defaultContent = {
  /*
  "logoText": "Thomas Gideon",
  "logoFont": "'DM Serif Display', serif",
  "logoFontSize": "33px",
  "heroQuote": "“ ... ”",
  "heroBg": "img/default/queen-esther-hero.jpg",
  "artistBio": "<h3>About the Artist</h3>\n<div class=\"separator\"></div>\n<p>THOMAS GIDEON ... </p>",
  "comingSoon": "<h3>About the Artist</h3>\n<div class=\"separator\"></div>\n<p>THOMAS GIDEON ... </p>",
  "sidebarBookImg": "img/default/queen-esther-cover.jpg",
  "sidebarBookAlt": "Exodus",
  "newBookTitle": "Exodus",
  "newBookSubtitle": "New",
  "newBookSynopsis": "<p><i>Exodus</i> is a historical novel that follows Conner Gideon ...</p>",
  "effects": {
    "snowAmount": 0,
    "snowSpeed": 1,
    "hailAmount": 0,
    "hailSpeed": 5,
    "rainAmount": 100,
    "rainSpeed": 10,
    "sandAmount": 0,
    "sandSpeed": 20,
    "starsAmount": 0,
    "starsSpeed": 0.05,
    "shootingStars": 0
  },
  "microBlog": [
    {
      "date": "2025-11-04",
      "text": "Exodus is finally out! Thank you to everyone who has supported this journey."
    },
    {
      "date": "2025-10-15",
      "text": "Just finished a wonderful interview with The Globe and Mail about the themes of alternative families in my work."
    }
  ]
  */
};

// Global Data (Loaded from server or localStorage, initialized with fallback defaults)
let booksData = { ...defaultBooksData };
let musicData = { ...defaultMusicData };
let lastPopulatedData = null;

// Helper to update elements only if content changed
const updateElement = (id, content, isHTML = false) => {
  const el = document.getElementById(id);
  if (!el || content === undefined || content === null) return;
  const current = isHTML ? el.innerHTML : el.innerText;
  if (current !== content) {
    if (isHTML) el.innerHTML = content;
    else el.innerText = content;
  }
};

// Update "NEW" nav link based on h1 on new.html and persist it
const updateNewNavLink = () => {
  const storedTitle = safeStorage.getItem('newBookTitle');
  const navLinks = document.querySelectorAll('.nav-links a[href="new.html"], .mobile-menu a[href="new.html"]');
  
  if (window.location.pathname.includes('new.html')) {
    const h1 = document.querySelector('.book-info h1');
    if (h1) {
      const newTitle = h1.innerText.toUpperCase();
      safeStorage.setItem('newBookTitle', newTitle);
      navLinks.forEach(link => {
        link.innerText = `NEW: ${newTitle}`;
      });
    }
  } else if (storedTitle) {
    navLinks.forEach(link => {
      link.innerText = `NEW: ${storedTitle}`;
    });
  }
};

// Populate UI with data
const populateUI = (data) => {
  console.log('populateUI called with:', data ? Object.keys(data) : null);
  if (!data) return;

  // Check if data is identical to last population to avoid flicker
  const dataString = JSON.stringify(data);
  if (lastPopulatedData === dataString) {
    console.log('Skipping populateUI because data is identical');
    return;
  }
  lastPopulatedData = dataString;

  // Update global data references
  if (data.booksData && Object.keys(data.booksData).length > 0) {
    booksData = data.booksData;
  } else if (!booksData || Object.keys(booksData).length === 0) {
    booksData = { ...defaultBooksData };
  }

  if (data.musicData && Object.keys(data.musicData).length > 0) {
    musicData = data.musicData;
  } else if (!musicData || Object.keys(musicData).length === 0) {
    musicData = { ...defaultMusicData };
  }

  console.log('Loaded booksData keys:', Object.keys(booksData));
  console.log('Loaded musicData keys:', Object.keys(musicData));

  // Logo & Branding
  const logoElements = document.querySelectorAll('.logo');
  if (logoElements.length > 0) {
    logoElements.forEach(el => {
      if (data.logoText && el.innerText !== data.logoText) {
        el.innerText = data.logoText;
      }
      if (data.logoFont) {
        el.style.fontFamily = data.logoFont;
      }
      if (data.logoFontSize) {
        el.style.fontSize = data.logoFontSize;
      }
    });
  }

  // Handle Book Detail Page (if on that page)
  const bookDetailContent = document.getElementById('book-detail-content');
  if (bookDetailContent) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bookTitle = urlParams.get('title');
      let bookId = urlParams.get('id');

      if (bookTitle) {
        const book = booksData[bookTitle] || {
          subtitle: "A novel by Thomas Gideon",
          image: `img/books/placeholder-book_622x1000.jpg`,
          synopsis: `<p>This is a placeholder synopsis for <i>${bookTitle}</i>. Thomas Gideon's novels are known for their intricate plots, memorable characters, and exploration of complex human relationships.</p>`
        };

        // Determine the book ID
        if (!bookId) {
          if (book.id) {
            bookId = book.id;
          } else if (bookTitle === "") {
            bookId = "1";
          } else if (bookTitle === "") {
            bookId = "2";
          } else if (bookTitle === "") {
            bookId = "3";
          } else {
            bookId = "1";
          }
        }

        const cleanedBookId = String(bookId).replace(/^0+/, "") || "1";

        // Build the purchase button URL
        const ebookUrl = book.ebookLink || `https://example.com/purchase?id=${cleanedBookId}&format=ebook`;

        let labelText = "COMING SOON";
        let buttonHref = "coming.html";
        let purchaseTarget = "";

        if (book.status === "PURCHASE") {
          const priceStr = book.price !== undefined ? book.price : "$9.99";
          const descStr = book.desc !== undefined ? book.desc : "EPUB & AUDIO";
          labelText = `Buy ${priceStr} ${descStr}`;
          buttonHref = book.payment_url || ebookUrl;
          purchaseTarget = 'target="_blank"';
        }

        document.title = `${bookTitle} - Thomas Gideon`;

        const newHTML = `
          <!-- Left Column: Book Cover -->
          <div class="fade-in active">
            <img src="${book.image}" alt="${bookTitle}" class="detail-book-img" referrerPolicy="no-referrer">
            
            <div class="book-purchase-links">
              <h4>Purchase</h4>
              <div class="book-purchase-grid">
                <a href="${buttonHref}" class="purchase-btn" ${purchaseTarget}>${labelText}</a>
              </div>
            </div>
          </div>

          <!-- Right Column: Book Info -->
          <div class="book-info fade-in active">
            <h1 id="book-detail-title">${bookTitle}</h1>
            <h3 class="subtitle">${book.subtitle}</h3>
            <div class="separator"></div>
            
            <div class="synopsis">
              ${book.synopsis}
            </div>
          </div>
        `;
        if (bookDetailContent.innerHTML !== newHTML) {
          bookDetailContent.innerHTML = newHTML;
        }
      } else {
        updateElement('book-detail-content', '<p>Book not found. <a href="books.html">Return to library</a>.</p>', true);
      }
    } catch (err) {
      console.error("Error populating book detail page:", err);
      bookDetailContent.innerHTML = `<p style="color: red; padding: 20px;">Error loading book details: ${err.message}</p>`;
    }
  }

  // Handle Music Detail Page (if on that page)
  const musicDetailContent = document.getElementById('music-detail-content');
  if (musicDetailContent) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const musicTitle = urlParams.get('title');
      let musicId = urlParams.get('id');

      let resolvedTitle = musicTitle;
      if (!resolvedTitle && musicId) {
        const entry = Object.entries(musicData).find(([, item]) => String(item.id || '').replace(/^0+/, "") === String(musicId).replace(/^0+/, ""));
        if (entry) {
          resolvedTitle = entry[0];
        }
      }

      if (resolvedTitle) {
        const music = musicData[resolvedTitle] || {
          composer: "Original Soundtrack",
          image: `img/music/placeholder-music_500x500_72ppi.jpg`,
          description: `This is a placeholder description for the soundtrack of <i>${resolvedTitle}</i>. Thomas Gideon's works have inspired many beautiful and evocative musical scores.`
        };

        document.title = `${resolvedTitle} - Music - Thomas Gideon`;

        // Match corresponding book for purchase links
        // replace <h1 class="italic">${resolvedTitle}</h1>
        // with    <h1 id="music-detail-title">${resolvedTitle}</h1>
        const assocBook = booksData[resolvedTitle] || (resolvedTitle === "In On Person" ? booksData["In One Person"] : null) || {};
        const actualMusicId = music.id || musicId || assocBook.id || "1";
        const cleanedMusicId = String(actualMusicId).replace(/^0+/, "") || "1";
        const audioUrl = music.audioLink || assocBook.audioLink || `https://example.com/purchase?id=${cleanedMusicId}&format=music`;

        let labelText = "COMING SOON";
        let buttonHref = "coming.html";
        let purchaseTarget = "";

        if (music.status === "PURCHASE") {
          const priceStr = music.price !== undefined ? music.price : "$9.99";
          const descStr = music.desc !== undefined ? music.desc : "ALBUM & ART";
          labelText = `Buy ${priceStr} ${descStr}`;
          buttonHref = music.payment_url || audioUrl;
          purchaseTarget = 'target="_blank"';
        }

        const newHTML = `
          <div class="music-detail-wrap fade-in active">
            <div class="music-detail-img">
              <img src="${music.image}" alt="${resolvedTitle}" referrerPolicy="no-referrer">
              
              <div class="music-purchase-links">
                <h4>Purchase</h4>
                <div class="music-purchase-grid">
                  <a href="${buttonHref}" class="purchase-btn" ${purchaseTarget}>${labelText}</a>
                </div>
              </div>
            </div>
            <div class="music-detail-info">
              <h1 id="music-detail-title">${resolvedTitle}</h1>
              <p class="composer">${music.composer}</p>
              <div class="separator"></div>
              <p class="description">${music.description}</p>
            </div>
          </div>
        `;
        if (musicDetailContent.innerHTML !== newHTML) {
          musicDetailContent.innerHTML = newHTML;
        }
      } else {
        updateElement('music-detail-content', '<p>Music details not found. <a href="music.html">Return to music page</a>.</p>', true);
      }
    } catch (err) {
      console.error("Error populating music detail page:", err);
      musicDetailContent.innerHTML = `<p style="color: red; padding: 20px;">Error loading music details: ${err.message}</p>`;
    }
  }

  // Handle Blog Detail Page (if on that page)
  const blogPostContent = document.getElementById('blog-post-content');
  if (blogPostContent && data.microBlog) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId !== null && data.microBlog[postId]) {
      const post = data.microBlog[postId];
      document.title = `Blog - ${post.date} - Thomas Gideon`;

      const newHTML = `
        <article class="blog-post-full fade-in active">
          <span class="date">${post.date}</span>
          <div class="content">
            ${post.fullContent || post.text}
          </div>
        </article>
      `;
      if (blogPostContent.innerHTML !== newHTML) {
        blogPostContent.innerHTML = newHTML;
      }
    } else {
      updateElement('blog-post-content', '<p>Blog post not found. <a href="index.html">Return to home</a>.</p>', true);
    }
  }

  // Homepage Hero
  updateElement('hero-quote', data.heroQuote);
  
  const heroBg = document.getElementById('hero-bg');
  if (heroBg && data.heroBg) {
    const newBg = `url('${data.heroBg}')`;
    if (heroBg.style.backgroundImage !== newBg) {
      heroBg.style.backgroundImage = newBg;
    }
  }
  
  // Homepage Bio
  const microBlogContainer = document.getElementById('micro-blog-container');
  if (microBlogContainer && data.microBlog) {
    const newHTML = data.microBlog.map((post, index) => `
      <div class="micro-blog-post">
        <span class="micro-blog-date">${post.date}</span>
        <div class="micro-blog-text">
          ${post.text}
          ${post.fullContent ? `...<a href="blog.html?id=${index}" class="more-link">more</a>` : ''}
        </div>
      </div>
    `).join('');
    if (microBlogContainer.innerHTML !== newHTML) {
      microBlogContainer.innerHTML = newHTML;
    }
  } else {
    updateElement('blog-content', data.bioContent, true);
  }
  
  const bioImg = document.getElementById('bio-img');
  if (bioImg && data.bioImg && bioImg.src !== data.bioImg) {
    bioImg.src = data.bioImg;
  }
  
  updateElement('bio-photo-credit', data.bioPhotoCredit);
  
  // Artist Page
  updateElement('artist-bio-content', data.artistBio, true);
  
  // Coming Soon Page
  updateElement('coming-soon-content', data.comingSoon, true);
  
  // Sidebar Widget (Artist, Index, and New Pages)
  let sidebarTitle = "";
  let sidebarBook = {};
  
  if (booksData && Object.keys(booksData).length > 0) {
    const entryByOrder = Object.entries(booksData).find(([title, b]) => Number(b.order) === 1);
    if (entryByOrder) {
      sidebarTitle = entryByOrder[0];
      sidebarBook = entryByOrder[1];
    } else {
      const entryById = Object.entries(booksData).find(([title, b]) => String(b.id) === "1");
      if (entryById) {
        sidebarTitle = entryById[0];
        sidebarBook = entryById[1];
      } else {
        const entries = Object.entries(booksData);
        if (entries.length > 0) {
          sidebarTitle = entries[0][0];
          sidebarBook = entries[0][1];
        }
      }
    }
  }

  const sidebarBookImg = document.getElementById('sidebar-book-img');
  if (sidebarBookImg) {

    /*const imgUrl = data.sidebarBookImg || sidebarBook.image || "img/default/placeholder.jpg";*/
    const imgUrl = data.sidebarBookImg || sidebarBook.image || "";

    if (sidebarBookImg.src !== imgUrl) {
      sidebarBookImg.src = imgUrl;
    }

    /*const imgAlt = data.sidebarBookAlt || sidebarBook.title || "Example Tile";*/
    const imgAlt = data.sidebarBookAlt || sidebarTitle || "";

    if (sidebarBookImg.alt !== imgAlt) {
      sidebarBookImg.alt = imgAlt;
    }
  }

  // Sidebar Purchase Link (Single Buy Button)
  const sidebarEbook = document.getElementById('sidebar-ebook-link');
  if (sidebarEbook) {
    const bookId = String(sidebarBook.id || "1").replace(/^0+/, "") || "1";
    let finalUrl = "coming.html";
    let label = "COMING SOON";
    
    if (sidebarBook.status === "PURCHASE") {
      const priceStr = sidebarBook.price !== undefined ? sidebarBook.price : "$9.99";
      const descStr = sidebarBook.desc !== undefined ? sidebarBook.desc : "EPUB & AUDIO";
      label = `Buy ${priceStr} ${descStr}`;
      finalUrl = sidebarBook.payment_url || data.sidebarEbookLink || sidebarBook.ebookLink || `https://example.com/purchase?id=${bookId}&format=ebook`;
      if (!sidebarEbook.getAttribute('target')) {
        sidebarEbook.setAttribute('target', '_blank');
      }
    } else {
      if (sidebarEbook.getAttribute('target') === '_blank') {
        sidebarEbook.removeAttribute('target');
      }
    }
    
    if (sidebarEbook.href !== finalUrl) sidebarEbook.href = finalUrl;
    if (sidebarEbook.innerText !== label) {
      sidebarEbook.innerText = label;
    }
  }
  
  // New Book Page & Homepage Hero Title
  const newBookTitles = document.querySelectorAll('#new-book-title');
  if (newBookTitles.length > 0 && data.newBookTitle) {
    newBookTitles.forEach(el => {
      if (el.innerText !== data.newBookTitle) {
        el.innerText = data.newBookTitle;
      }
    });
  }
  
  updateElement('new-book-subtitle', data.newBookSubtitle);
  updateElement('new-book-synopsis', data.newBookSynopsis, true);
  
  // Background Effects
  if (data.effects) {
    initHeroEffects(data.effects);
  }
  
  // Books Page
  const booksPageGrid = document.getElementById('books-page-grid');
  if (booksPageGrid) {
    if (Object.keys(booksData).length > 0) {
      const sortedBooks = Object.entries(booksData).sort((a, b) => {
        const orderA = a[1].order || 999;
        const orderB = b[1].order || 999;
        if (orderA !== orderB) return orderA - orderB;
        return a[0].localeCompare(b[0]);
      });

      const newHTML = sortedBooks.map(([title, book]) => {
        const bookId = String(book.id || (title === "" ? "1" : title === "" ? "2" : "3")).replace(/^0+/, "") || "1";
        return `
          <a href="book-detail.html?id=${bookId}&title=${encodeURIComponent(title)}" class="book-card fade-in active">
            <div class="book-img-wrap">
              <img src="${book.image}" alt="${title}" referrerPolicy="no-referrer">
            </div>
            <h4 class="book-title">${title}</h4>
          </a>
        `;
      }).join('');
      if (booksPageGrid.innerHTML !== newHTML) {
        booksPageGrid.innerHTML = newHTML;
      }
    } else if (data.booksGrid && booksPageGrid.innerHTML !== data.booksGrid) {
      booksPageGrid.innerHTML = data.booksGrid;
    }
  }

  // Books Carousel
  const carouselTrack = document.getElementById('carousel-track');
  if (carouselTrack && Object.keys(booksData).length > 0) {
    const sortedBooks = Object.entries(booksData).sort((a, b) => {
      const orderA = a[1].order || 999;
      const orderB = b[1].order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a[0].localeCompare(b[0]);
    });

    const newHTML = sortedBooks.map(([title, book]) => {
      const bookId = String(book.id || (title === "" ? "1" : title === "" ? "2" : "3")).replace(/^0+/, "") || "1";
      return `
        <div class="carousel-item">
          <a href="book-detail.html?id=${bookId}&title=${encodeURIComponent(title)}">
            <img src="${book.image}" alt="${title}" referrerPolicy="no-referrer">
          </a>
        </div>
      `;
    }).join('');
    if (carouselTrack.innerHTML !== newHTML) {
      carouselTrack.innerHTML = newHTML;
    }
  }

  // Music Carousel
  const musicCarouselTrack = document.getElementById('music-carousel-track');
  if (musicCarouselTrack && Object.keys(musicData).length > 0) {
    const sortedMusic = Object.entries(musicData).sort((a, b) => {
      const orderA = a[1].order || 999;
      const orderB = b[1].order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a[0].localeCompare(b[0]);
    });

    const newHTML = sortedMusic.map(([title, music]) => {
      const musicId = String(music.id || (title === "" ? "1" : title === "" ? "2" : "3")).replace(/^0+/, "") || "1";
      return `
        <div class="carousel-item">
          <a href="music-detail.html?id=${musicId}&title=${encodeURIComponent(title)}">
            <img src="${music.image}" alt="${title}" referrerPolicy="no-referrer">
          </a>
        </div>
      `;
    }).join('');
    if (musicCarouselTrack.innerHTML !== newHTML) {
      musicCarouselTrack.innerHTML = newHTML;
    }
  }
  
  // Music Page

  // Change <h3 class="italic">${title}</h3>
  // for <h4 class="music-title">${title}</h4>

  const musicPageGrid = document.getElementById('music-page-grid');
  if (musicPageGrid) {
    if (Object.keys(musicData).length > 0) {
      const sortedMusic = Object.entries(musicData).sort((a, b) => {
        const orderA = a[1].order || 999;
        const orderB = b[1].order || 999;
        if (orderA !== orderB) return orderA - orderB;
        return a[0].localeCompare(b[0]);
      });

      const newHTML = sortedMusic.map(([title, music]) => {
        const musicId = String(music.id || (title === "" ? "1" : title === "" ? "2" : "3")).replace(/^0+/, "") || "1";
        return `
          <a href="music-detail.html?id=${musicId}&title=${encodeURIComponent(title)}" class="music-item fade-in active">
            <div class="music-img-wrap">
              <img src="${music.image}" alt="${title}" referrerPolicy="no-referrer">
            </div>
            <div class="music-info">
              <h4 class="music-title">${title}</h4>
              <p class="composer">${music.composer || ''}</p>
            </div>
          </a>
        `;
      }).join('');
      if (musicPageGrid.innerHTML !== newHTML) {
        musicPageGrid.innerHTML = newHTML;
      }
    } else if (data.musicGrid && musicPageGrid.innerHTML !== data.musicGrid) {
      musicPageGrid.innerHTML = data.musicGrid;
    }
  }

  // Trigger dynamic nav update if on new.html
  if (window.location.pathname.includes('new.html')) {
    updateNewNavLink();
  }
};

// Load site content from static JSON files (for GitHub Pages/Static Hosting)
const loadSiteContent = async () => {
  // Add no-transition class to body to prevent flickering during initial load
  document.body.classList.add('no-transition');

  // 1. Try to load from localStorage first for immediate UI update
  let localData = {};
  try {
    const cached = safeStorage.getItem('siteContent');
    if (cached && cached !== 'undefined' && cached !== 'null') {
      localData = JSON.parse(cached) || {};
    }
  } catch (err) {
    console.error('Error parsing siteContent from localStorage:', err);
  }
  
  if (localData && Object.keys(localData).length > 0) {
    console.log('Loading content from localStorage...');
    populateUI(localData);
  } else {
    console.log('No local storage data found. Doing initial populate with default fallback content.');
    populateUI({
      ...defaultContent,
      booksData: defaultBooksData,
      musicData: defaultMusicData
    });
  }

  try {
    console.log('Fetching fresh site content from server...');
    
    // Fetch all three data files in parallel
    const [contentRes, booksRes, musicRes] = await Promise.all([
      fetch('data/content.json').catch(() => ({ ok: false })),
      fetch('data/booksData.json').catch(() => ({ ok: false })),
      fetch('data/musicData.json').catch(() => ({ ok: false }))
    ]);

    let content = {};
    let booksDataServer = {};
    let musicDataServer = {};

    try {
      if (contentRes.ok) content = await contentRes.json();
    } catch (e) {
      console.error('Error parsing content.json response:', e);
    }

    try {
      if (booksRes.ok) booksDataServer = await booksRes.json();
    } catch (e) {
      console.error('Error parsing booksData.json response:', e);
    }

    try {
      if (musicRes.ok) musicDataServer = await musicRes.json();
    } catch (e) {
      console.error('Error parsing musicData.json response:', e);
    }
    
    // Only update if we actually got some data from server
    if (Object.keys(content).length > 0 || Object.keys(booksDataServer).length > 0 || Object.keys(musicDataServer).length > 0) {
      let freshLocalData = {};
      try {
        const localDataStr = safeStorage.getItem('siteContent');
        if (localDataStr && localDataStr !== 'undefined' && localDataStr !== 'null') {
          freshLocalData = JSON.parse(localDataStr) || {};
        }
      } catch (err) {
        console.error('Error parsing siteContent string during server merge:', err);
      }

      if (!freshLocalData) freshLocalData = {};

      // Destructure to separate booksData and musicData from other local settings
      const { booksData: localBooks, musicData: localMusic, ...otherLocalData } = freshLocalData;

      // Deep merge: fallback/default keys, then server keys, then local updates
      const baseBooks = (booksDataServer && Object.keys(booksDataServer).length > 0) ? booksDataServer : defaultBooksData;
      const mergedBooks = { ...defaultBooksData, ...baseBooks };
      if (localBooks) {
        Object.entries(localBooks).forEach(([title, book]) => {
          mergedBooks[title] = { ...(mergedBooks[title] || {}), ...book };
        });
      }

      const baseMusic = (musicDataServer && Object.keys(musicDataServer).length > 0) ? musicDataServer : defaultMusicData;
      const mergedMusic = { ...defaultMusicData, ...baseMusic };
      if (localMusic) {
        Object.entries(localMusic).forEach(([title, music]) => {
          mergedMusic[title] = { ...(mergedMusic[title] || {}), ...music };
        });
      }

      const mergedData = { 
        ...defaultContent,
        ...content, 
        ...otherLocalData,
        booksData: mergedBooks, 
        musicData: mergedMusic
      };

      console.log('Site content parsed and merged with local edits');
      populateUI(mergedData);
    }
  } catch (error) {
    console.error('Error loading site content:', error);
  } finally {
    // Remove no-transition class after a short delay to allow layout to stabilize
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 100);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  loadSiteContent();
  
  // Add loaded class to trigger fade-in
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });

  // Handle page transitions for all internal links
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const isInternal = href && 
                        !href.startsWith('#') && 
                        !href.startsWith('http') && 
                        !href.startsWith('mailto:') && 
                        !href.startsWith('tel:') &&
                        !link.target &&
                        !e.metaKey && 
                        !e.ctrlKey;

      if (isInternal) {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });

  // Handle sidebar-book-img clicks to transition/navigate to new.html
  document.querySelectorAll('.sidebar-book-img').forEach(img => {
    img.addEventListener('click', (e) => {
      const path = window.location.pathname;
      if (path.endsWith('/new.html') || path.endsWith('/new')) {
        return;
      }
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = 'new.html';
      }, 300);
    });
  });
});

// Handle back/forward cache (bfcache) to ensure content repopulates
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    loadSiteContent();
    updateNewNavLink();
  }
});

// Background Effects System
let heroEffectsInstance = null;

function initHeroEffects(config) {
  const canvas = document.getElementById('hero-effects-canvas');
  if (!canvas) return;

  if (heroEffectsInstance) {
    heroEffectsInstance.updateConfig(config);
    return;
  }

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let shootingStars = [];

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
    createParticles(); // Re-create particles on resize to fit new dimensions
  }

  class Particle {
    constructor(type) {
      this.type = type;
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.size = 1;
      this.color = '#fff';
      this.opacity = Math.random();
      this.twinkleDir = Math.random() > 0.5 ? 1 : -1;

      switch(this.type) {
        case 'snow':
          this.y = Math.random() * -height;
          this.vx = (Math.random() - 0.5) * 1;
          this.vy = (Math.random() * 1 + 1) * (config.snowSpeed || 1);
          this.size = Math.random() * 3 + 1;
          break;
        case 'hail':
          this.y = Math.random() * -height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() * 5 + 5) * (config.hailSpeed || 5) / 5;
          this.size = Math.random() * 2 + 2;
          break;
        case 'rain':
          this.y = Math.random() * -height;
          this.vx = -1;
          this.vy = (Math.random() * 10 + 10) * (config.rainSpeed || 10) / 10;
          this.size = Math.random() * 1 + 1;
          this.color = 'rgba(174, 194, 224, 0.5)';
          break;
        case 'sand':
          this.x = width + Math.random() * width;
          this.y = Math.random() * height;
          this.vx = -(Math.random() * 10 + 10) * (config.sandSpeed || 20) / 20;
          this.vy = (Math.random() - 0.5) * 2;
          this.size = Math.random() * 2 + 0.5;
          this.color = 'rgba(194, 178, 128, 0.6)';
          break;
        case 'star':
          this.opacity = Math.random();
          this.size = Math.random() * 1.5 + 0.5;
          break;
      }
    }

    update() {
      if (this.type === 'star') {
        this.opacity += (config.starsSpeed || 0.05) * this.twinkleDir;
        if (this.opacity > 1) { this.opacity = 1; this.twinkleDir = -1; }
        if (this.opacity < 0.1) { this.opacity = 0.1; this.twinkleDir = 1; }
        return;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.y > height || this.x < -20 || this.x > width + 20) {
        this.init();
        if (this.type === 'snow' || this.type === 'hail' || this.type === 'rain') this.y = -10;
        if (this.type === 'sand') this.x = width + 10;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      if (this.type === 'rain') {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx, this.y + this.vy * 2);
        ctx.stroke();
      } else if (this.type === 'sand') {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  class ShootingStar {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * 0.5;
      this.length = Math.random() * 80 + 50;
      this.speed = Math.random() * 10 + 10;
      this.vx = -this.speed;
      this.vy = this.speed * 0.5;
      this.opacity = 1;
      this.active = true;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.opacity -= 0.02;
      if (this.opacity <= 0) this.active = false;
    }

    draw() {
      if (!this.active) return;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
      ctx.stroke();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < (config.snowAmount || 0); i++) particles.push(new Particle('snow'));
    for (let i = 0; i < (config.hailAmount || 0); i++) particles.push(new Particle('hail'));
    for (let i = 0; i < (config.rainAmount || 0); i++) particles.push(new Particle('rain'));
    for (let i = 0; i < (config.sandAmount || 0); i++) particles.push(new Particle('sand'));
    for (let i = 0; i < (config.starsAmount || 0); i++) particles.push(new Particle('star'));
  }

  window.addEventListener('resize', resize);
  resize();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (config.shootingStars > 0 && Math.random() < (config.shootingStars / 1000)) {
      shootingStars.push(new ShootingStar());
    }

    shootingStars = shootingStars.filter(s => s.active);
    shootingStars.forEach(s => {
      s.update();
      s.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  heroEffectsInstance = {
    updateConfig: (newConfig) => {
      config = newConfig;
      createParticles();
    }
  };
}
