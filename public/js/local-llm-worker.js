// public/js/local-llm-worker.js

class LocalLLMWorker {
    constructor(ollamaUrl = 'http://localhost:11434', model = 'llama3.2') {
        this.ollamaUrl = ollamaUrl;
        this.model = model;
        this.timeout = 60000; // 60 seconds timeout
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`Ollama connection failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to connect to Ollama:', error);
            return null;
        }
    }
    
    async generateContent(prompt, systemPrompt = 'You are an expert outdoor recreation content generator.') {
        const availableModels = await this.checkConnection();
        
        if (!availableModels) {
            throw new Error('Ollama not available. Please ensure Ollama is running locally.');
        }
    
        // Find the model or use default
        const modelToUse = this.model || (availableModels.models[0]?.name || 'llama3.2');
        
        try {
            const response = await fetch(`${this.ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelToUse,
                    prompt: prompt,
                    system: systemPrompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 1024
                    }
                }),
                signal: AbortSignal.timeout(this.timeout)
            });
    
            if (!response.ok) {
                throw new Error(`LLM generation failed: ${response.status}`);
            }
    
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('LLM generation error:', error);
            throw new Error('Failed to generate content with local AI');
        }
    }
    
    async generatePage(trailData) {
        const { trailName, location, length, difficulty, elevationGain, estimatedTime, amenities, regulations } = trailData;
        
        const prompt = `Create a comprehensive hiking trail guide for the following trail:

Trail Information:
- Trail Name: ${trailName}
- Location: ${location}
- Length: ${length} miles
- Difficulty Level: ${difficulty}
- Elevation Gain: ${elevationGain || 'N/A'} feet
- Estimated Completion Time: ${estimatedTime || 'N/A'}

Requirements:
1. Write 200-300 words of engaging, informative content
2. Include safety tips appropriate for the difficulty level
3. Mention seasonal considerations and best times to visit
4. Discuss any specific regulations or rules mentioned
5. Provide practical hiking tips (water sources, wildlife, navigation)
6. Use proper formatting with clear sections
7. Ensure factual accuracy based ONLY on the data provided

Output as plain text markdown format.`;
        
        return this.generateContent(prompt);
    }
    
    async validateModel() {
        const availableModels = await this.checkConnection();
        
        if (!availableModels) {
            return { valid: false, error: 'Ollama not running' };
        }
        
        // Check if we have a suitable model
        const hasLLM = availableModels.models.some(m => 
            m.name.includes('llama') || 
            m.name.includes('mistral') || 
            m.name.includes('gemma') ||
            m.name.includes('qwen')
        );
        
        return {
            valid: hasLLM,
            availableModels: availableModels.models.map(m => m.name),
            error: !hasLLM ? 'No suitable LLM models found' : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalLLMWorker;
} else {
    window.LocalLLMWorker = LocalLLMWorker;
}
