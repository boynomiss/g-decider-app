// Description Generator
// Creates engaging, concise descriptions from reviews and blog posts

import { Review } from '../../types/app';

// Helper: Convert budget level to readable text
const getBudgetText = (budget: 'P' | 'PP' | 'PPP'): string => {
  const budgetTexts = {
    'P': 'budget-friendly',
    'PP': 'mid-range',
    'PPP': 'premium'
  };
  return budgetTexts[budget];
};

// Helper: Extract key themes from reviews
const extractReviewThemes = (reviews: Review[]): string[] => {
  const themes: { [key: string]: number } = {};
  
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    // Food-related themes
    if (text.includes('delicious') || text.includes('tasty') || text.includes('amazing food')) themes['delicious food'] = (themes['delicious food'] || 0) + 1;
    if (text.includes('authentic') || text.includes('traditional')) themes['authentic'] = (themes['authentic'] || 0) + 1;
    if (text.includes('fresh') || text.includes('quality ingredients')) themes['fresh ingredients'] = (themes['fresh ingredients'] || 1) + 1;
    if (text.includes('atmosphere') || text.includes('ambiance') || text.includes('vibe')) themes['great atmosphere'] = (themes['great atmosphere'] || 0) + 1;
    if (text.includes('service') || text.includes('staff') || text.includes('friendly')) themes['excellent service'] = (themes['excellent service'] || 0) + 1;
    if (text.includes('cozy') || text.includes('comfortable') || text.includes('relaxing')) themes['cozy'] = (themes['cozy'] || 0) + 1;
    if (text.includes('romantic') || text.includes('date night')) themes['romantic'] = (themes['romantic'] || 0) + 1;
    if (text.includes('family') || text.includes('kids')) themes['family-friendly'] = (themes['family-friendly'] || 0) + 1;
    
    // Activity-related themes
    if (text.includes('fun') || text.includes('exciting') || text.includes('thrilling')) themes['fun experience'] = (themes['fun experience'] || 0) + 1;
    if (text.includes('adventure') || text.includes('explore')) themes['adventure'] = (themes['adventure'] || 0) + 1;
    if (text.includes('relaxing') || text.includes('peaceful') || text.includes('calm')) themes['relaxing'] = (themes['relaxing'] || 0) + 1;
    if (text.includes('educational') || text.includes('learn') || text.includes('culture')) themes['educational'] = (themes['educational'] || 0) + 1;
    if (text.includes('scenic') || text.includes('beautiful') || text.includes('view')) themes['scenic'] = (themes['scenic'] || 0) + 1;
    if (text.includes('unique') || text.includes('different') || text.includes('special')) themes['unique'] = (themes['unique'] || 0) + 1;
  });
  
  // Return top 3 themes
  return Object.entries(themes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme);
};

// Helper: Generate description from reviews
const generateDescriptionFromReviews = (reviews: Review[], category: string, placeName: string, budget?: 'P' | 'PP' | 'PPP'): string => {
  if (!reviews || reviews.length === 0) {
    return generateFallbackDescription(category, placeName, budget);
  }
  
  const themes = extractReviewThemes(reviews);
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  // Get positive review snippets
  const positiveReviews = reviews
    .filter(review => review.rating >= 4)
    .slice(0, 3)
    .map(review => review.text.split('.').slice(0, 2).join('.').trim())
    .filter(text => text.length > 20 && text.length < 100);
  
  if (themes.length > 0 && positiveReviews.length > 0) {
    const themeText = themes.slice(0, 2).join(' and ');
    const reviewSnippet = positiveReviews[0];
    const budgetText = budget ? ` (${getBudgetText(budget)})` : '';
    
    if (category === 'food') {
      return `${placeName} is known for its ${themeText}${budgetText}. "${reviewSnippet}" - a must-visit for food lovers.`;
    } else {
      return `${placeName} offers ${themeText}${budgetText}. "${reviewSnippet}" - perfect for ${category === 'activity' ? 'adventure seekers' : 'new experiences'}.`;
    }
  } else if (themes.length > 0) {
    const themeText = themes.slice(0, 2).join(' and ');
    const budgetText = budget ? ` (${getBudgetText(budget)})` : '';
    return `${placeName} is celebrated for its ${themeText}${budgetText}. With a ${avgRating.toFixed(1)}-star rating, it's a local favorite.`;
  } else if (positiveReviews.length > 0) {
    const reviewSnippet = positiveReviews[0];
    const budgetText = budget ? ` (${getBudgetText(budget)})` : '';
    return `${placeName} receives rave reviews${budgetText}. "${reviewSnippet}" - discover why visitors love this place.`;
  }
  
  return generateFallbackDescription(category, placeName);
};

// Helper: Generate fallback description
const generateFallbackDescription = (category: string, placeName: string, budget?: 'P' | 'PP' | 'PPP'): string => {
  const descriptions = {
    food: [
      `${placeName} offers a delightful dining experience with carefully crafted dishes and warm hospitality.`,
      `${placeName} serves up authentic flavors in a welcoming atmosphere perfect for any occasion.`,
      `${placeName} is a culinary gem where traditional meets modern in every delicious bite.`
    ],
    activity: [
      `${placeName} provides an exciting adventure with unique experiences that create lasting memories.`,
      `${placeName} offers engaging activities perfect for exploring and discovering new passions.`,
      `${placeName} is the perfect destination for those seeking fun, adventure, and unforgettable moments.`
    ],
    'something-new': [
      `${placeName} offers a fresh perspective and unique experiences that will surprise and delight.`,
      `${placeName} is perfect for trying something different and creating new memories.`,
      `${placeName} provides an opportunity to step out of your comfort zone and discover something amazing.`
    ]
  };
  
  const categoryDescriptions = descriptions[category as keyof typeof descriptions] || descriptions.food;
  const baseDescription = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)] || 'A great place to visit.';
  
  // Add budget information if available
  if (budget) {
    const budgetText = getBudgetText(budget);
    return baseDescription.replace('.', ` (${budgetText}).`);
  }
  
  return baseDescription;
};

// Helper: Generate blog-style description
const generateBlogStyleDescription = (placeName: string, category: string, themes: string[]): string => {
  const blogTemplates = {
    food: [
      `"${placeName} is a hidden gem that locals can't stop talking about. With its ${themes.join(' and ')}, this spot has become a must-visit destination for food enthusiasts."`,
      `"Discover why ${placeName} is trending among foodies. From its ${themes[0]} to the ${themes[1] || 'amazing atmosphere'}, every visit feels like a culinary adventure."`,
      `"${placeName} isn't just a restaurant—it's an experience. The ${themes.join(' and ')} make it the perfect spot for memorable dining moments."`
    ],
    activity: [
      `"Looking for something exciting? ${placeName} delivers with its ${themes.join(' and ')}. It's the perfect place to create unforgettable memories."`,
      `"Adventure seekers, this is for you! ${placeName} offers ${themes.join(' and ')} that will keep you coming back for more."`,
      `"${placeName} is where fun meets adventure. With its ${themes.join(' and ')}, it's the ideal destination for those seeking new experiences."`
    ],
    'something-new': [
      `"Ready to try something different? ${placeName} offers ${themes.join(' and ')} that will surprise and delight even the most experienced explorers."`,
      `"Step out of your comfort zone at ${placeName}. The ${themes.join(' and ')} make it the perfect place to discover something truly unique."`,
      `"${placeName} is not your typical destination. With its ${themes.join(' and ')}, it's the perfect spot for those seeking fresh experiences."`
    ]
  };
  
  const templates = blogTemplates[category as keyof typeof blogTemplates] || blogTemplates.food;
  return templates[Math.floor(Math.random() * templates.length)] || templates[0] || 'A great place to visit.';
};

// Main function: Generate comprehensive description
export const generateComprehensiveDescription = (
  placeName: string,
  category: string,
  reviews: Review[],
  rating?: number,
  reviewCount?: number,
  budget?: 'P' | 'PP' | 'PPP'
): string => {
  // Try to generate from reviews first
  if (reviews && reviews.length > 0) {
    const reviewDescription = generateDescriptionFromReviews(reviews, category, placeName, budget);
    if (reviewDescription.length <= 120) { // Keep it concise
      return reviewDescription;
    }
  }
  
  // Fallback to blog-style description
  const themes = reviews ? extractReviewThemes(reviews) : [];
  const blogDescription = generateBlogStyleDescription(placeName, category, themes);
  
  if (blogDescription.length <= 120) {
    return blogDescription;
  }
  
  // Final fallback
  return generateFallbackDescription(category, placeName, budget);
};

// Helper: Generate short description for cards
export const generateShortDescription = (
  placeName: string,
  category: string,
  rating?: number
): string => {
  const shortTemplates = {
    food: [
      `${placeName} - where every meal becomes a memorable experience.`,
      `${placeName} - serving up delicious moments since day one.`,
      `${placeName} - a culinary journey worth taking.`
    ],
    activity: [
      `${placeName} - where adventure meets excitement.`,
      `${placeName} - creating unforgettable experiences.`,
      `${placeName} - your next great adventure awaits.`
    ],
    'something-new': [
      `${placeName} - discover something amazing.`,
      `${placeName} - where new experiences begin.`,
      `${placeName} - try something different today.`
    ]
  };
  
  const templates = shortTemplates[category as keyof typeof shortTemplates] || shortTemplates.food;
  return templates[Math.floor(Math.random() * templates.length)] || templates[0] || 'A great place to visit.';
}; 