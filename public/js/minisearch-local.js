// public/js/minisearch-local.js - MiniSearch loaded directly

let MiniSearch = null;

async function loadMiniSearch() {
    try {
        // Load MiniSearch from CDN (this will work if CSP allows it)
        const response = await fetch('https://cdn.jsdelivr.net/npm/minisearch@7.2.0/dist/umd/index.min.js');
        
        if (!response.ok) {
            throw new Error('Failed to load MiniSearch');
        }
        
        const data = await response.text();
        
        // Extract the MiniSearch function from the script
        const match = data.match(/window\.MiniSearch\s*=\s*(\{[\s\S]*?\n\}\);/);
        
        if (match) {
            // Create a Function constructor to execute the code
            const func = new Function(`return (${match[1]})`);
            MiniSearch = func();
            
            console.log('✅ MiniSearch loaded successfully');
            return true;
        } else {
            throw new Error('Could not parse MiniSearch library');
        }
    } catch (error) {
        console.error('❌ Failed to load MiniSearch:', error);
        
        // Fallback: Use simple search without MiniSearch
        console.log('⚠️ Using fallback simple search');
        return false;
    }
}

window.loadMiniSearch = loadMiniSearch;
