// public/js/app.js - COMPLETELY FIXED VERSION

let aiGeneratedPages = [];

async function loadAIPages() {
    try {
        const stored = localStorage.getItem('jujoja_pages');
        
        if (stored) {
            const parsedData = JSON.parse(stored);
            aiGeneratedPages = Array.isArray(parsedData.pages) ? parsedData.pages : [];
            console.log('📄 Loaded from localStorage:', aiGeneratedPages.length, 'pages');
            renderPages();
            return;
        }
        
        const response = await fetch('/pages.json');
        if (response.ok) {
            const data = await response.json();
            aiGeneratedPages = Array.isArray(data.pages) ? data.pages : [];
            
            localStorage.setItem('jujoja_pages', JSON.stringify({
                version: '1.0',
                lastUpdated: new Date().toISOString(),
                pages: aiGeneratedPages
            }));
            
            console.log('📄 Loaded from /pages.json:', aiGeneratedPages.length, 'pages');
            renderPages();
        } else {
            showErrorLoading();
        }
    } catch (error) {
        console.error('❌ Error loading trail pages:', error);
        showErrorLoading();
    }
}

function renderPages() {
    const grid = document.getElementById('pageGrid');
    if (!grid) return;
    
    if (!Array.isArray(aiGeneratedPages) || aiGeneratedPages.length === 0) {
        showErrorLoading();
        return;
    }
    
    grid.innerHTML = '';
    
    aiGeneratedPages.forEach((page, index) => {
        const card = document.createElement('div');
        card.className = 'page-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.cursor = 'pointer'; // Makes it look clickable
        
        const safePage = {
            id: page.id,
            title: page.title || 'Untitled Trail',
            content: page.content || '',
            trailName: page.trailName || 'Trail',
            location: page.location || 'Unknown Location',
            difficulty: page.difficulty || 'Unknown',
            length: page.length || 'Unknown'
        };
        
        card.innerHTML = `
            <div class="page-image">${getPageEmoji(safePage.trailName)}</div>
            <div class="page-content">
                <h3 class="page-title">${escapeHtml(safePage.title)}</h3>
                <p class="page-excerpt">${truncateText(safePage.content, 150)}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${getBadges(safePage.difficulty, safePage.location)}
                </div>
            </div>
        `;
        
        // The click event that opens the article
        card.addEventListener('click', () => {
            viewFullPage(safePage);
        });
        
        grid.appendChild(card);
    });
}

// Routes the user to your new dynamic template
function viewFullPage(page) {
    window.location.href = `/article.html?id=${encodeURIComponent(page.id)}`;
}

function getPageEmoji(trailName) {
    const emojis = {
        'Yosemite': '🏔️', 'Appalachian': '🥾', 'Smoky Mountains': '🌲',
        'Camping': '⛺', 'Hiking': '🧭', 'Trail': '🗺️', 'Adventure': '🎒', 'Nature': '🌄'
    };
    const key = trailName.split(' ').pop().toLowerCase();
    return emojis[key] || '🏔️';
}

function getBadges(difficulty, location) {
    let badges = [];
    if (difficulty) {
        const diffBadge = difficulty.toLowerCase().includes('easy') ? 'Easy 🟢' : 
                          difficulty.toLowerCase().includes('medium') ? 'Medium 🟡' : 
                          difficulty.toLowerCase().includes('hard') ? 'Hard 🔴' : '';
        if (diffBadge) badges.push(diffBadge);
    }
    if (location) {
        const locBadge = location.toLowerCase().includes('national park') ? 'National Park 🏞️' : 
                         location.toLowerCase().includes('mountain') ? 'Mountain Range ⛰️' : '';
        if (locBadge) badges.push(locBadge);
    }
    return badges.map(badge => `<span style="background: #e0f2fe; color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${badge}</span>`).join(' ');
}

function truncateText(text, maxLength) {
    if (!text) return '';
    
    // 1. Strip out all HTML tags (<h1>, <p>, etc.) so they don't show on the cards
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    
    // 2. Decode any weird HTML entities (like &amp;)
    const div = document.createElement('div');
    div.innerHTML = cleanText;
    const pureText = div.textContent || div.innerText || "";
    
    // 3. Truncate the clean text
    if (pureText.length <= maxLength) return pureText;
    return pureText.substring(0, maxLength).trim() + '...';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorLoading() {
    const grid = document.getElementById('pageGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <h2 style="font-family: 'Montserrat', sans-serif; color: var(--primary);">
                    🏔️ Trail Data Coming Soon
                </h2>
                <p style="color: #64748b; max-width: 600px; margin: 1rem auto;">
                    Our system is aggregating verified hiking trail data from official government sources.
                    Check back later for programmatic content about trails, camping tips, and outdoor adventures!
                </p>
                <a href="/search.html" class="search-btn" style="text-decoration:none; display:inline-block; margin-top:1rem;">Search Available Information</a>
            </div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', loadAIPages);