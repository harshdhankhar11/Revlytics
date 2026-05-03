# Product Preview - Troubleshooting Guide

## Issue: "Failed to fetch product"

This guide will help you solve the product preview fetching issue.

## Quick Checklist

- [ ] OMKAR_API_KEY is set in .env
- [ ] .env file is in the root directory
- [ ] Dev server has been restarted after adding API key
- [ ] Using a valid Amazon URL with correct ASIN format
- [ ] API key is valid and has remaining quota

## Step 1: Verify Environment Variable

### Check Your .env File

1. Open `.env` in the root directory of your project
2. Verify this line exists:
```bash
OMKAR_API_KEY=your_actual_api_key_here
```

### If Missing:
1. Add the line to .env
2. Get your API key from Omkar: https://www.omkar.cloud/
3. Copy the entire key (it should be a long string)
4. Restart your dev server

## Step 2: Restart Dev Server

After adding/updating the API key:

```bash
# Stop current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Step 3: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to Console tab
3. Test entering a URL
4. Look for any error messages

## Step 4: Check Server Logs

1. Look at your terminal where `pnpm dev` is running
2. You should see logs like:
```
Fetching product data for ASIN: B0CMPMY9ZZ
Calling Omkar API: https://amazon-scraper-api.omkar.cloud/amazon/search?query=B0CMPMY9ZZ&country_code=US
Omkar API response status: 200
Successfully fetched product: iPhone 15...
```

### If You See Errors:
- **"OMKAR_API_KEY is not configured"** → Add it to .env
- **"API returned status 401"** → API key is invalid
- **"API returned status 403"** → API key doesn't have permission
- **"API returned status 429"** → Rate limited (too many requests)

## Step 5: Test with Valid URL

Use these known-good formats:

```
https://www.amazon.com/dp/B0CMPMY9ZZ
https://www.amazon.com/gp/product/B0CMPMY9ZZ
https://amazon.com/dp/B0CMPMY9ZZ
```

NOT these formats (they won't work):
```
❌ https://www.amazon.com/s?k=iPhone
❌ https://www.amazon.com/Apple-iPhone/s
❌ Just the ASIN: B0CMPMY9ZZ
```

## Step 6: Common Issues & Solutions

### Issue: "Invalid URL"
**Cause**: ASIN not extracted properly
**Solution**: 
- Copy URL directly from Amazon product page
- Make sure it contains `/dp/` or `/gp/product/`
- URL should have 10-character ASIN like B0CMPMY9ZZ

### Issue: "Product not found"
**Cause**: Omkar API couldn't find the product
**Solution**:
- Verify product exists on Amazon.com
- Try a different product
- Check if ASIN is correct

### Issue: "Failed to fetch product data from external API"
**Cause**: Omkar API error (401, 403, 429, etc.)
**Solution**:
- Check API key is correct
- Verify API key has no typos
- Check you haven't exceeded quota
- Try later if rate limited

### Issue: Network timeout
**Cause**: Omkar API slow or unreachable
**Solution**:
- Check your internet connection
- Wait a moment and try again
- Check Omkar API status: https://www.omkar.cloud/

## Step 7: Full Diagnostic Checklist

Run these checks:

```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify API key in .env
grep OMKAR_API_KEY .env

# 3. Check if dev server is running
# (Should see "ready - started server on 0.0.0.0:3000" in terminal)

# 4. Test curl directly (replace YOUR_KEY and ASIN):
curl -X GET "https://amazon-scraper-api.omkar.cloud/amazon/search?query=B0CMPMY9ZZ&country_code=US" \
  -H "API-Key: YOUR_KEY"

# This should return JSON with product data
```

## Step 8: Still Not Working?

### Enable Debug Mode

Add this to your `.env`:
```bash
DEBUG=true
```

Then check server logs for detailed output.

### Test the API Directly

```javascript
// Run this in browser console on your page:
fetch('/api/products/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ asin: 'B0CMPMY9ZZ' })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e))
```

Check the response in console for specific errors.

## Omkar API Documentation

For more information:
- Website: https://www.omkar.cloud/
- Docs: https://www.omkar.cloud/documentation
- Support: Check their contact page

## If Nothing Works

1. **Verify API Key**: Log into Omkar dashboard, verify key is active
2. **Check Quota**: Omkar API has daily limits, check if exceeded
3. **Try Different ASIN**: Some products might not be scrapable
4. **Wait 24 Hours**: Rate limits reset daily
5. **Contact Omkar Support**: Their team can help troubleshoot

## Expected Behavior

### When Working:
1. User enters URL
2. Within 1-2 seconds, product card appears
3. Shows image, title, price, rating, reviews
4. "View on Amazon" button works

### When Not Working:
1. User enters URL
2. Spinner shows for 1 second
3. Error message appears
4. Check browser console for details

## Performance Notes

- 800ms debounce: Waits 0.8s after user stops typing before fetching
- First product in results is used
- Images load independently (won't break if missing)
- Caching: Each unique ASIN cached until page refresh

## FAQ

**Q: Do I need to restart the server after adding OMKAR_API_KEY?**
A: Yes! Environment variables are loaded at startup.

**Q: Can I use any Amazon ASIN?**
A: Most can be used. Some restricted products might not return data.

**Q: How often can I fetch products?**
A: Depends on Omkar API plan. Check your limits in dashboard.

**Q: Does it work offline?**
A: No, it requires internet and Omkar API access.

**Q: Can I cache results?**
A: Currently fetches each time. Caching can be added later.

## Still Stuck?

1. Check terminal logs for error messages
2. Check browser DevTools (F12) → Console tab
3. Share the exact error message
4. Verify .env file has API key
5. Try with a different product ASIN
6. Restart the dev server
