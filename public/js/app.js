// public/js/app.js - FIXED VERSION

let aiGeneratedPages = [];

async function loadAIPages() {
    try {
        const stored = localStorage.getItem('jujoja_pages');
        
        if (stored) {
            // Parse and validate JSON
            const parsedData = JSON.parse(stored);
            
            // Ensure pages is an array
            aiGeneratedPages = Array.isArray(parsedData.pages) ? parsedData.pages : [];
            
            console.log('📄 Loaded from localStorage:', aiGeneratedPages.length, 'pages');
            renderPages();
            return;
        }
        
        // Try to fetch from server
        const response = await fetch('/pages.json');
        if (response.ok) {
            const data = await response.json();
            
            // Ensure pages is an array
            aiGeneratedPages = Array.isArray(data.pages) ? data.pages : [];
            
            localStorage.setItem('jujoja_pages', JSON.stringify({
                version: '1.0',
                lastUpdated: new Date().toISOString(),
                pages: aiGeneratedPages
            }));
            
            console.log('📄 Loaded from /pages.json:', aiGeneratedPages.length, 'pages');
            renderPages();
        } else {
            console.warn('⚠️ No pages found in pages.json');
            document.getElementById('pageGrid').innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <h2 style="font-family: 'Montserrat', sans-serif; color: var(--primary);">
                        🏔️ Trail Data Coming Soon
                    </h2>
                    <p style="color: #64748b; max-width: 600px; margin: 1rem auto;">
                        Our system is aggregating verified hiking trail data from official government sources.
                        Check back later for programmatic content about trails, camping tips, and outdoor adventures!
                    </p>
                    <a href="#searchSection" class="search-btn">Search Available Information</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading trail pages:', error);
        showErrorLoading();
    }
}

function renderPages() {
    const grid = document.getElementById('pageGrid');
    
    if (!grid) return;
    
    // Ensure aiGeneratedPages is an array
    if (!Array.isArray(aiGeneratedPages)) {
        console.error('❌ aiGeneratedPages is not an array:', typeof aiGeneratedPages);
        grid.innerHTML = '<p style="text-align: center;">Error loading pages</p>';
        return;
    }
    
    if (aiGeneratedPages.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <h2 style="font-family: 'Montserrat', sans-serif; color: var(--primary);">
                    🏔️ Trail Data Coming Soon
                </h2>
                <p style="color: #64748b; max-width: 600px; margin: 1rem auto;">
                    Our system is aggregating verified hiking trail data from official government sources.
                    Check back later for programmatic content about trails, camping tips, and outdoor adventures!
                </p>
                <a href="#searchSection" class="search-btn">Search Available Information</a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    aiGeneratedPages.forEach((page, index) => {
        const card = document.createElement('div');
        card.className = 'page-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Ensure page has required fields
        const safePage = {
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
        
        card.addEventListener('click', () => {
            viewFullPage(safePage);
        });
        
        grid.appendChild(card);
    });
}

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

function getBadges(difficulty, location) {
    let badges = [];
    
    if (difficulty) {
        const diffBadge = difficulty.toLowerCase().includes('easy') ? 'Easy 🟢' : 
                          difficulty.toLowerCase().includes('medium') ? 'Medium 🟡' : 
                          difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('difficult') ? 'Hard 🔴' : '';
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
    if (!text || text.length <= maxLength) return escapeHtml(text);
    
    return escapeHtml(text.substring(0, maxLength)).trim() + '...';
}

function viewFullPage(page) {
    // Pass the ID securely through the URL parameter
    window.location.href = `/article.html?id=${encodeURIComponent(page.id)}`;
}
    
    fetch(url).then(response => {
        if (response.ok) {
            window.open(url, '_blank');
        } else {
            alert(`Page not found: ${page.title}. Our AI is still generating content!`);
        }
    }).catch(() => {
        alert('Trail information loading in progress. Check back later!');
    });


function showErrorLoading() {
    const grid = document.getElementById('pageGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <p style="color: #64748b;">📊 Trail information loading...</p>
                <p style="color: #64748b; margin-top: 0.5rem;">More data is being aggregated from official sources.</p>
            </div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', loadAIPages);

window.jujojaAPI = {
    addPage: (pageData) => {
        aiGeneratedPages.push(pageData);
        localStorage.setItem('jujoja_pages', JSON.stringify({
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            pages: aiGeneratedPages
        }));
        renderPages();
        
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

window.addEventListener('message', (event) => {
    if (event.data.type === 'page-added') {
        aiGeneratedPages.push(event.data.page);
        localStorage.setItem('jujoja_pages', JSON.stringify({
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            pages: aiGeneratedPages
        }));
        renderPages();
    }
});
