// Initialize MiniSearch index from JSON file
let miniSearch;
const INDEX_URL = '/search-index.json';

async function initSearch() {
    try {
        const response = await fetch(INDEX_URL);
        if (!response.ok) throw new Error('Failed to load search index');
        
        const articles = await response.json();
        console.log(`Loaded ${articles.length} articles for indexing`);
        
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
        await miniSearch.addAll(articles);
        console.log('Search index initialized successfully');
        
    } catch (error) {
        console.error('Error initializing search:', error);
        showError('Failed to load search index. Please try again later.');
    }
}

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    // Show loading state
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchResults').style.display = 'block';
    
    try {
        const results = await miniSearch.search(query, {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 2 }
        });
        
        displayResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showError('Search failed. Please try again.');
    } finally {
        document.getElementById('loadingState').style.display = 'none';
    }
}

// Display search results with highlighting
function displayResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No results found. Try different keywords.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    results.forEach((result, index) => {
        const article = articles[result.id];
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
    container.innerHTML = `<p style="text-align: center; color: #ef4444;">${escapeHtml(message)}</p>`;
}

// Real-time search as user types (debounced)
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 300); // 300ms debounce
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initSearch);
