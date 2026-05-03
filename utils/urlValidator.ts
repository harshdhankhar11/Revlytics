export function extractAsinFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (!hostname.includes('amazon.')) {
            return null;
        }

        let asin: string | null = null;

        if (urlObj.pathname.includes('/dp/')) {
            const dpMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/);
            asin = dpMatch ? dpMatch[1] : null;
        } else if (urlObj.pathname.includes('/gp/product/')) {
            const gpMatch = urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
            asin = gpMatch ? gpMatch[1] : null;
        }

        return asin;
    } catch {
        return null;
    }
}

export function isValidAmazonUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (!hostname.includes('amazon.')) {
            return false;
        }

        return /\/dp\/[A-Z0-9]{10}|\/gp\/product\/[A-Z0-9]{10}/.test(urlObj.pathname);
    } catch {
        return false;
    }
}

export function normalizeUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const asin = extractAsinFromUrl(url);
        if (!asin) return url;
        return `https://www.amazon.com/dp/${asin}`;
    } catch {
        return url;
    }
}
