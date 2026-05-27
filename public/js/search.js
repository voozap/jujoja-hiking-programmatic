// public/js/search.js - COMPLETELY FIXED VERSION

let miniSearch;
const INDEX_URL = '/pages.json'; // ✅ CORRECT PATH for Vercel outputDirectory "public"
const ARTICLES = [];

async function initSearch() {
    console.log('🔍 Initializing search from:', INDEX_URL);
    
    try {
        const response = await fetch(INDEX_URL);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            throw new Error(`Failed to load index: ${response.status}`);
        }
        
        // Check if we got HTML (404 error) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Wrong content type:', contentType);
            throw new Error('pages.json is not a valid JSON file');
        }
        
        const data = await response.json();
        
        console.log('📄 Loaded pages.json successfully');
        console.log('📊 Total pages:', data.pages?.length || 0);
        console.log('📋 Data structure:', Object.keys(data));
        
        // Check if pages exist in the data
        const pages = data.pages || [];
        
        if (pages.length === 0) {
            console.warn('⚠️ No pages found in pages.json');
            showNoPagesMessage();
            return;
        }
        
        // Convert pages to articles format for MiniSearch
        ARTICLES.push(...pages.map((page, index) => ({
            id: page.id || `page-${index}`,
            title: page.title || 'Untitled',
            content: page.content || '',
            trailName: page.trailName || '',
            location: page.location || '',
            difficulty: page.difficulty || 'Unknown',
            length: page.length || ''
        })));
        
        console.log('📝 Articles prepared for indexing:', ARTICLES.length);
        
        // Initialize MiniSearch with field boosting
        miniSearch = window.MiniSearch({
            fields: ['title', 'content', 'trailName', 'location'],
            storeFields: ['title', 'content', 'trailName', 'location', 'difficulty', 'length'],
            searchOptions: {
                boost: { title: 2, content: 1 }
            },
            idField: 'id'
        });
        
        // Index all articles
        await miniSearch.addAll(ARTICLES);
        
        console.log('✅ Search index initialized successfully');
        console.log('🔍 Ready to search!');
        
    } catch (error) {
        console.error('❌ Error initializing search:', error);
        showError(`Failed to load search data: ${error.message}`);
    }
}

// Perform search
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    console.log('🔍 Searching for:', query);
    
    // Show loading state
    const loadingState = document.getElementById('loadingState');
    const resultsDiv = document.getElementById('searchResults');
    
    if (loadingState) loadingState.style.display = 'block';
    if (resultsDiv) {
        resultsDiv.innerHTML = '';
        resultsDiv.style.display = 'block';
    }
    
    try {
        const results = await miniSearch.search(query, {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 2 }
        });
        
        console.log('📊 Search results:', results.length);
        
        if (resultsDiv) displayResults(results);
    } catch (error) {
        console.error('❌ Search error:', error);
        if (resultsDiv) showError('Search failed. Please try again.');
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Display search results with highlighting
function displayResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) {
        console.error('❌ Results container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No results found for "' + escapeHtml(document.getElementById('searchInput').value) + '". Try different keywords.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    results.forEach((result, index) => {
        const article = ARTICLES[result.id];
        if (!article) return;
        
        // Create result card
        const card = document.createElement('div');
        card.className = 'result-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Highlight search terms in content
        const highlightedContent = highlightSearchTerms(article.content, query);
        
        card.innerHTML = `
            <h3 class="result-title">${escapeHtml(article.title)}</h3>
            <p class="result-excerpt">${highlightedContent}</p>
            <div class="result-meta">
                <span>📍 ${escapeHtml(article.location || 'Unknown')}</span> | 
                <span>🥾 ${escapeHtml(article.difficulty || 'N/A')}</span> | 
                <span>📏 ${escapeHtml(article.length || 'Unknown')} miles</span>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

// Highlight search terms in text
function highlightSearchTerms(text, query) {
    if (!query) return escapeHtml(text);
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
        regex.test(part) 
            ? `<mark style="background: #fef3c7; padding: 0 2px;">${escapeHtml(part)}</mark>` 
            : escapeHtml(part)
    ).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escape special characters for regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Show error message
function showError(message) {
    const container = document.getElementById('searchResults');
    if (container) {
        container.innerHTML = `<p style="text-align: center; color: #ef4444;">${escapeHtml(message)}</p>`;
    }
}

// Show no pages message
function showNoPagesMessage() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3 style="color: var(--primary);">🏔️ Trail Data Loading</h3>
                <p style="color: #64748b;">Our system is currently aggregating verified trail information from official government sources.</p>
                <p style="margin-top: 1rem; color: #94a3b8;">Check back later for more hiking trails and outdoor adventures!</p>
            </div>
        `;
    }
}

// Real-time search as user types (debounced)
let searchTimeout;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 300); // 300ms debounce
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initSearch);
