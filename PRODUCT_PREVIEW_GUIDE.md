# New Analysis Feature - Product Preview Enhancement

## Overview

The New Analysis page now includes a **real-time product preview sidebar** that shows product details as users enter Amazon URLs. This helps users verify they're analyzing the correct products before starting an analysis.

## Features

### 1. **Real-Time Product Preview**
When a user enters an Amazon product URL, the system:
- Extracts the ASIN (Amazon Standard Identification Number)
- Fetches product data using the Omkar API
- Displays product information in a card on the right sidebar

### 2. **Two-Column Responsive Layout**
- **Left Column (66%)**: Form inputs for product and competitor URLs
- **Right Column (33%)**: Live product previews (hidden on mobile)
- Sticky sidebar that stays visible while scrolling on desktop

### 3. **Product Information Displayed**
Each preview card shows:
- ✅ Product image
- ✅ Product title (links to Amazon)
- ✅ Price and original price
- ✅ Star rating (5-star display)
- ✅ Review count
- ✅ Badges (Amazon Choice, Best Seller)
- ✅ Direct link to product
- ✅ Loading states and error handling

### 4. **Smart URL Handling**
- Supports multiple Amazon URL formats:
  - `https://www.amazon.com/dp/ASIN`
  - `https://www.amazon.com/gp/product/ASIN`
- Automatically extracts ASIN from any valid format
- Validates URLs in real-time

### 5. **Debounced API Calls**
- 800ms debounce to avoid excessive API requests
- Only fetches when user stops typing

## File Structure

```
components/dashboard/NewAnalysis/
├── AnalyzeForm.tsx              # Main form with grid layout
├── ProductPreview.tsx           # Product card display
├── ProductPreviewSkeleton.tsx  # Loading state
├── UrlInput.tsx                # URL input field
└── AnalyzeFormSkeleton.tsx    # Form loading state

app/api/products/
└── preview/route.ts            # API endpoint for fetching product data

app/dashboard/new-analysis/
├── page.tsx                    # Main page
└── actions.ts                 # Server-side form actions
```

## How It Works

### User Flow
1. User lands on `/dashboard/new-analysis`
2. Enters main product URL
3. ProductPreview component fetches data via `/api/products/preview`
4. Product card displays on right sidebar with full details
5. User can compare with competitors by adding competitor URLs
6. Each competitor URL shows its own preview card
7. When ready, user clicks "Analyze My Market" to start analysis

### API Flow
1. ProductPreview extracts ASIN from URL
2. Sends POST request to `/api/products/preview`
3. API validates ASIN and fetches from Omkar API
4. Returns formatted product data
5. Component displays product card

## Environment Setup

Add to `.env` file:
```bash
OMKAR_API_KEY=your_api_key_here
```

## UI/UX Features

### Loading States
- Spinning loader icon while fetching
- "Fetching product..." text
- Smooth transitions

### Error Handling
- Displays error message if product not found
- Shows validation error for invalid URLs
- Graceful fallback if API fails

### Visual Design
- Professional card-based layout
- Consistent with Revlytics design system
- Hover effects on product titles and buttons
- Color-coded badges for special features
- Responsive design for mobile

## Responsive Behavior

### Desktop (lg screens and above)
- Two-column layout with sticky sidebar
- Form takes 66% of width
- Previews take 33% of width
- Sticky positioning for preview section

### Tablet & Mobile
- Single column layout
- Form takes full width
- Product previews shown inline or below form
- Touch-friendly interface

## Error Handling

The preview handles multiple error scenarios:
1. **Invalid ASIN**: Shows "Invalid URL" message
2. **Product Not Found**: Shows "Product not found" error
3. **API Key Missing**: Shows configuration error (admin only)
4. **Network Error**: Shows "Error fetching product" message
5. **Invalid URL Format**: Doesn't attempt fetch

## Performance Optimizations

1. **Debounced Fetching**: 800ms debounce reduces API calls
2. **Conditional Rendering**: Previews only show for non-empty URLs
3. **Efficient State Management**: Only updates when URL changes
4. **Skeleton Loading**: Visual feedback while loading
5. **Image Optimization**: Handles failed image loads gracefully

## Features to Add Later

1. **Product Comparison**
   - Side-by-side pricing comparison
   - Rating difference indicators
   
2. **Quick Stats**
   - Price difference from main product
   - Rating comparison
   - Review count difference

3. **Amazon Link Preview**
   - One-click verification on Amazon

## Troubleshooting

### Preview Not Showing
- Check that OMKAR_API_KEY is set in `.env`
- Verify URL format is correct (must include ASIN)
- Check browser console for errors

### API Errors
- Verify API key is valid
- Check rate limits on Omkar API
- Ensure product exists on Amazon

### Styling Issues
- Clear browser cache
- Rebuild Next.js project
- Check Tailwind CSS is properly configured

## Testing

To test the feature:

1. Navigate to `/dashboard/new-analysis`
2. Paste a valid Amazon URL: `https://www.amazon.com/dp/B0CMPMY9ZZ`
3. Wait 800ms for preview to load
4. Verify product details display correctly
5. Add competitor URLs and verify their previews
6. Test on mobile to verify responsive layout
