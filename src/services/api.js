// API Integration Services for BitMind Smart Invoice Platform
// Integrates with external public APIs: CoinGecko, IPFS, GitHub
/**
 * Fetch cryptocurrency prices from CoinGecko public API
 * No API key required for basic usage
 */
export const fetchCoinGeckoPrice = async (coinIds = ['bitcoin', 'stacks']) => {
    try {
        const ids = coinIds.join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching CoinGecko price:', error);
        // Return fallback data
        return {
            bitcoin: { usd: 45000, usd_24h_change: 2.5 },
            stacks: { usd: 0.85, usd_24h_change: -1.2 },
        };
    }
};
/**
 * Upload data to IPFS via public gateway
 * Note: For production, use services like Pinata or Web3.Storage
 */
export const uploadToIPFS = async (data) => {
    try {
        // For demo purposes, we'll simulate IPFS upload
        // In production, integrate with Pinata, Web3.Storage, or similar
        console.log('Uploading to IPFS:', data);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Return mock IPFS hash
        const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
        return mockHash;
    }
    catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};
/**
 * Retrieve data from IPFS via public gateway
 */
export const fetchFromIPFS = async (cid) => {
    try {
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
        if (!response.ok) {
            throw new Error(`IPFS fetch error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw error;
    }
};
/**
 * Fetch GitHub repository information
 * Uses GitHub public API (no auth required for public repos)
 */
export const fetchGitHubRepoInfo = async (owner, repo) => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            name: data.name,
            description: data.description,
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            language: data.language,
            updated_at: data.updated_at,
        };
    }
    catch (error) {
        console.error('Error fetching GitHub repo info:', error);
        throw error;
    }
};
/**
 * AI-powered invoice parsing (mock implementation)
 * In production, integrate with OpenAI GPT-4 or Anthropic Claude
 */
export const parseInvoiceWithAI = async (naturalLanguageInput) => {
    try {
        // For demo purposes, this is a mock implementation
        // In production, call OpenAI API or Claude API
        console.log('Parsing invoice with AI:', naturalLanguageInput);
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Extract key information using simple pattern matching
        // In production, use GPT-4/Claude for sophisticated parsing
        const amountMatch = naturalLanguageInput.match(/\$?(\d+,?\d*)/);
        const totalAmount = amountMatch ? parseInt(amountMatch[1].replace(',', '')) : 5000;
        const milestoneCount = (naturalLanguageInput.match(/milestone/gi) || []).length || 3;
        // Return structured data
        return {
            client: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
            arbitrator: 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159',
            totalAmount,
            milestones: Array.from({ length: milestoneCount }, (_, i) => ({
                id: i + 1,
                description: `Milestone ${i + 1}`,
                amount: Math.floor(totalAmount / milestoneCount),
            })),
            description: naturalLanguageInput,
        };
    }
    catch (error) {
        console.error('Error parsing invoice with AI:', error);
        throw error;
    }
};
/**
 * Convert USD to STX using live price data
 */
export const convertUSDtoSTX = async (usdAmount) => {
    try {
        const prices = await fetchCoinGeckoPrice(['stacks']);
        const stxPrice = prices.stacks?.usd || 0.85;
        return usdAmount / stxPrice;
    }
    catch (error) {
        console.error('Error converting USD to STX:', error);
        // Fallback conversion rate
        return usdAmount / 0.85;
    }
};
/**
 * Convert STX to USD using live price data
 */
export const convertSTXtoUSD = async (stxAmount) => {
    try {
        const prices = await fetchCoinGeckoPrice(['stacks']);
        const stxPrice = prices.stacks?.usd || 0.85;
        return stxAmount * stxPrice;
    }
    catch (error) {
        console.error('Error converting STX to USD:', error);
        // Fallback conversion rate
        return stxAmount * 0.85;
    }
};
/**
 * Get current market data for display
 */
export const getMarketData = async () => {
    try {
        const prices = await fetchCoinGeckoPrice(['bitcoin', 'stacks']);
        return {
            btc: {
                price: prices.bitcoin?.usd || 45000,
                change24h: prices.bitcoin?.usd_24h_change || 0,
            },
            stx: {
                price: prices.stacks?.usd || 0.85,
                change24h: prices.stacks?.usd_24h_change || 0,
            },
        };
    }
    catch (error) {
        console.error('Error fetching market data:', error);
        return {
            btc: { price: 45000, change24h: 0 },
            stx: { price: 0.85, change24h: 0 },
        };
    }
};
export default {
    fetchCoinGeckoPrice,
    uploadToIPFS,
    fetchFromIPFS,
    fetchGitHubRepoInfo,
    parseInvoiceWithAI,
    convertUSDtoSTX,
    convertSTXtoUSD,
    getMarketData,
};
