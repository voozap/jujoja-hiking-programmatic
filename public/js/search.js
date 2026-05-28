// public/js/search.js

let miniSearch = null;
const INDEX_URL = '/pages.json';
const ARTICLES = [];

// We return a Promise so the search page can wait for this to finish
async function initSearch() {
    console.log('🔍 Initializing search from:', INDEX_URL);
    
    try {
        const response = await fetch(INDEX_URL);
        if (!response.ok) throw new Error(`Failed to load index: ${response.status}`);
        
        const data = await response.json();
        
        // Populate the global ARTICLES array
        ARTICLES.length = 0; 
        ARTICLES.push(...(data.pages || []));
        
        if (window.MiniSearch) {
            miniSearch = new window.MiniSearch({
                // ADDED 'difficulty' below:
                fields: ['title', 'content', 'trailName', 'location', 'difficulty'],
                storeFields: ['id', 'title', 'content', 'trailName', 'location', 'difficulty', 'length'],
                searchOptions: { boost: { title: 2 } },
                idField: 'id' 
            });
            
            miniSearch.addAll(ARTICLES);
            console.log('✅ Search index initialized successfully');
        } else {
            console.error('❌ MiniSearch library not loaded!');
        }
    } catch (error) {
        console.error('❌ Error initializing search:', error);
    }
}

// Global Helper Functions for rendering
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightSearchTerms(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part) => 
        regex.test(part) 
            ? `<mark class="highlight">${escapeHtml(part)}</mark>` 
            : escapeHtml(part)
    ).join('');
}