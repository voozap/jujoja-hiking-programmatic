// AI-generated pages storage (will be populated by n8n workflow)
let aiGeneratedPages = [];

// Load existing pages from localStorage or JSON file
async function loadAIPages() {
    try {
        const stored = localStorage.getItem('jujoja_ai_pages');
        
        if (stored) {
            aiGeneratedPages = JSON.parse(stored);
            renderPages();
            return;
        }
        
        // Try to fetch from server
        const response = await fetch('/pages.json');
        if (response.ok) {
            aiGeneratedPages = await response.json();
            localStorage.setItem('jujoja_ai_pages', JSON.stringify(aiGeneratedPages));
            renderPages();
        } else {
            // No pages yet, show welcome message
            document.getElementById('pageGrid').innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <h2 style="font-family: 'Montserrat', sans-serif; color: var(--primary);">
                        🏔️ AI Pages Coming Soon
                    </h2>
                    <p style="color: #64748b; max-width: 600px; margin: 1rem auto;">
                        Our n8n AI workflow is generating hiking trail content powered by local LLMs. 
                        Check back later for programmatic content about trails, camping tips, and outdoor adventures!
                    </p>
                    <a href="#searchSection" class="search-btn">Search Available Content</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading AI pages:', error);
        showErrorLoading();
    }
}

// Render AI-generated pages
function renderPages() {
    const grid = document.getElementById('pageGrid');
    
    if (aiGeneratedPages.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <h2 style="font-family: 'Montserrat', sans-serif; color: var(--primary);">
                    🏔️ AI Pages Coming Soon
                </h2>
                <p style="color: #64748b; max-width: 600px; margin: 1rem auto;">
                    Our n8n AI workflow is generating hiking trail content powered by local LLMs. 
                    Check back later for programmatic content about trails, camping tips, and outdoor adventures!
                </p>
                <a href="#searchSection" class="search-btn">Search Available Content</a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    aiGeneratedPages.forEach((page, index) => {
        const card = document.createElement('div');
        card.className = 'page-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Create page content
        card.innerHTML = `
            <div class="page-image">${getPageEmoji(page.trailName)}</div>
            <div class="page-content">
                <h3 class="page-title">${escapeHtml(page.title)}</h3>
                <p class="page-excerpt">${truncateText(page.content, 150)}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${getBadges(page.difficulty, page.location)}
                </div>
            </div>
        `;
        
        // Add click handler to view full page
        card.addEventListener('click', () => {
            viewFullPage(page);
        });
        
        grid.appendChild(card);
    });
}

// Get emoji based on trail name
function getPageEmoji(trailName) {
    const emojis = {
        'Yosemite': '🏔️',
        'Appalachian': '🥾',
        'Smoky Mountains': '🌲',
        'Camping': '⛺',
        'Hiking': '🧭',
        'Trail': '🗺️',
        'Adventure': '🎒',
        'Nature': '🌄'
    };
    
    const key = trailName.split(' ').pop().toLowerCase();
    return emojis[key] || '🏔️';
}

// Get badges for page metadata
function getBadges(difficulty, location) {
    let badges = [];
    
    // Difficulty badges
    if (difficulty) {
        const diffBadge = difficulty.toLowerCase().includes('easy') ? 'Easy 🟢' : 
                          difficulty.toLowerCase().includes('medium') ? 'Medium 🟡' : 
                          difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('difficult') ? 'Hard 🔴' : '';
        if (diffBadge) badges.push(diffBadge);
    }
    
    // Location badges
    if (location) {
        const locBadge = location.toLowerCase().includes('national park') ? 'National Park 🏞️' : 
                         location.toLowerCase().includes('mountain') ? 'Mountain Range ⛰️' : '';
        if (locBadge) badges.push(locBadge);
    }
    
    return badges.map(badge => `<span style="background: #e0f2fe; color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${badge}</span>`).join(' ');
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return escapeHtml(text);
    
    return escapeHtml(text.substring(0, maxLength)).trim() + '...';
}

// View full page modal (or redirect)
function viewFullPage(page) {
    // For now, open in new tab or show modal
    const url = `/page/${encodeURIComponent(page.id)}.html`;
    
    // Check if page exists
    fetch(url).then(response => {
        if (response.ok) {
            window.open(url, '_blank');
        } else {
            alert(`Page not found: ${page.title}. Our AI is still generating content!`);
        }
    }).catch(() => {
        alert('Page loading in progress. Check back later!');
    });
}

// Show error/loading message
function showErrorLoading() {
    document.getElementById('pageGrid').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
            <p style="color: #ef4444;">⚠️ Failed to load AI-generated pages</p>
            <p style="color: #64748b; margin-top: 0.5rem;">Please try refreshing the page.</p>
        </div>
    `;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', loadAIPages);

// Export for n8n integration
window.jujojaAPI = {
    addPage: (pageData) => {
        aiGeneratedPages.push(pageData);
        localStorage.setItem('jujoja_ai_pages', JSON.stringify(aiGeneratedPages));
        renderPages();
        
        // Notify other tabs/windows
        window.dispatchEvent(new CustomEvent('page-added', { detail: pageData }));
        
        return pageData;
    },
    
    getPages: () => aiGeneratedPages,
    
    searchPages: (query) => {
        if (!query) return [];
        
        const lowerQuery = query.toLowerCase();
        return aiGeneratedPages.filter(page => 
            page.title.toLowerCase().includes(lowerQuery) ||
            page.content.toLowerCase().includes(lowerQuery) ||
            page.location?.toLowerCase().includes(lowerQuery) ||
            page.trailName?.toLowerCase().includes(lowerQuery)
        );
    }
};

// Listen for page-added events from other tabs/windows
window.addEventListener('message', (event) => {
    if (event.data.type === 'page-added') {
        aiGeneratedPages.push(event.data.page);
        localStorage.setItem('jujoja_ai_pages', JSON.stringify(aiGeneratedPages));
        renderPages();
    }
});
