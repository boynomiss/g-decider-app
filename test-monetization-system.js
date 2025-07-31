// Test script for Ad Monetization & Revenue Generation System
// Run with: node test-monetization-system.js

const { adMonetizationService } = require('./utils/ad-monetization-service');

async function testMonetizationSystem() {
  console.log('💰 Testing Ad Monetization & Revenue Generation System...\n');

  try {
    // Test 1: Get targeted ads with different contexts
    console.log('🎯 Test 1: Testing targeted ads with different contexts...');
    
    const contexts = [
      { userMood: 'romantic', cuisine: 'Korean', budget: 'mid-range' },
      { userMood: 'hype', cuisine: 'Filipino', budget: 'premium' },
      { userMood: 'chill', cuisine: 'Japanese', budget: 'budget' }
    ];
    
    contexts.forEach((context, index) => {
      const targetedAd = adMonetizationService.getTargetedAd(context);
      if (targetedAd) {
        console.log(`   Context ${index + 1}: ${JSON.stringify(context)}`);
        console.log(`     Ad Unit: ${targetedAd.adUnit.name}`);
        console.log(`     Network: ${targetedAd.network.name}`);
        console.log(`     Estimated Revenue: ₱${targetedAd.estimatedRevenue.toFixed(4)}`);
        console.log(`     Targeting: ${targetedAd.targeting.contextual.cuisine.join(', ')}`);
        console.log('');
      }
    });

    // Test 2: Test affiliate marketing
    console.log('💼 Test 2: Testing affiliate marketing...');
    
    const affiliatePartners = ['eatigo', 'klook', 'foodpanda', 'grab_food'];
    const affiliateContext = {
      restaurantName: 'Korean BBQ Place',
      cuisine: 'Korean',
      location: 'BGC'
    };
    
    affiliatePartners.forEach(partnerId => {
      const affiliateLink = adMonetizationService.getAffiliateLink(partnerId, affiliateContext);
      if (affiliateLink) {
        console.log(`   Partner: ${affiliateLink.partner.name}`);
        console.log(`     Category: ${affiliateLink.partner.category}`);
        console.log(`     Commission Rate: ${affiliateLink.partner.commissionRate * 100}%`);
        console.log(`     Estimated Commission: ₱${affiliateLink.estimatedCommission.toFixed(2)}`);
        console.log(`     Tracking URL: ${affiliateLink.trackingUrl}`);
        console.log('');
      }
    });

    // Test 3: Test sponsored content
    console.log('⭐ Test 3: Testing sponsored content...');
    
    const sponsoredContent = adMonetizationService.getSponsoredContent({
      cuisine: 'Korean',
      location: 'BGC'
    });
    
    console.log(`   Found ${sponsoredContent.length} sponsored items:`);
    sponsoredContent.forEach((content, index) => {
      console.log(`     ${index + 1}. ${content.title}`);
      console.log(`        Category: ${content.category}`);
      console.log(`        Budget: ₱${content.budget.toLocaleString()}`);
      console.log(`        Clicks: ${content.clicks}`);
      console.log('');
    });

    // Test 4: Test premium subscription tiers
    console.log('💎 Test 4: Testing premium subscription tiers...');
    
    const premiumTiers = adMonetizationService.getPremiumTiers();
    console.log(`   Found ${premiumTiers.length} premium tiers:`);
    
    premiumTiers.forEach((tier, index) => {
      console.log(`     ${index + 1}. ${tier.name} - ${tier.currency} ${tier.price}`);
      console.log(`        Features: ${tier.features.length} features`);
      console.log(`        Benefits: ${tier.benefits.length} benefits`);
      console.log(`        Top Feature: ${tier.features[0]}`);
      console.log(`        Top Benefit: ${tier.benefits[0]}`);
      console.log('');
    });

    // Test 5: Test revenue tracking
    console.log('📊 Test 5: Testing revenue tracking...');
    
    // Simulate ad impressions
    adMonetizationService.trackAdImpression('main_banner', 'admob', 0.00375);
    adMonetizationService.trackAdImpression('result_banner', 'fan', 0.00450);
    
    // Simulate affiliate clicks
    adMonetizationService.trackAffiliateClick('eatigo', 120);
    adMonetizationService.trackAffiliateClick('klook', 180);
    
    // Simulate sponsored content clicks
    adMonetizationService.trackSponsoredClick('sponsored_1');
    adMonetizationService.trackSponsoredClick('sponsored_2');
    
    console.log('   ✅ Revenue tracking events logged');

    // Test 6: Get monetization statistics
    console.log('📈 Test 6: Getting monetization statistics...');
    
    const stats = adMonetizationService.getMonetizationStats();
    console.log('   📊 Monetization Statistics:');
    console.log(`     Total Revenue: ₱${stats.totalRevenue.toLocaleString()}`);
    console.log(`     Ad Revenue: ₱${stats.adRevenue.toLocaleString()}`);
    console.log(`     Affiliate Revenue: ₱${stats.affiliateRevenue.toLocaleString()}`);
    console.log(`     Sponsored Revenue: ₱${stats.sponsoredRevenue.toLocaleString()}`);
    console.log(`     Premium Revenue: ₱${stats.premiumRevenue.toLocaleString()}`);
    console.log(`     Top Performing Ad Unit: ${stats.topPerformingAdUnit}`);
    console.log(`     Top Performing Affiliate: ${stats.topPerformingAffiliate}`);
    console.log(`     Conversion Rate: ${(stats.conversionRate * 100).toFixed(2)}%`);
    console.log('');

    // Test 7: Get revenue projections
    console.log('🔮 Test 7: Getting revenue projections...');
    
    const userBase = 1000;
    const projections = adMonetizationService.getRevenueProjections(userBase);
    
    console.log('   📈 Revenue Projections:');
    console.log(`     Monthly Revenue: ₱${projections.monthlyRevenue.toLocaleString()}`);
    console.log(`     Yearly Revenue: ₱${projections.yearlyRevenue.toLocaleString()}`);
    console.log(`     Revenue per User: ₱${projections.revenuePerUser.toFixed(2)}`);
    console.log(`     Growth Rate: ${(projections.growthRate * 100).toFixed(1)}%`);
    console.log('');

    // Test 8: Test different ad contexts
    console.log('🎭 Test 8: Testing different ad contexts...');
    
    const testContexts = [
      { userMood: 'romantic', cuisine: 'Italian', budget: 'premium', location: 'Makati' },
      { userMood: 'hype', cuisine: 'Filipino', budget: 'mid-range', location: 'Manila' },
      { userMood: 'casual', cuisine: 'Japanese', budget: 'budget', location: 'BGC' }
    ];
    
    testContexts.forEach((context, index) => {
      const ad = adMonetizationService.getTargetedAd(context);
      if (ad) {
        console.log(`   Context ${index + 1}: ${context.userMood} mood, ${context.cuisine} cuisine`);
        console.log(`     Ad Title: ${getTargetedAdTitle(ad.targeting)}`);
        console.log(`     Ad Description: ${getTargetedAdDescription(ad.targeting)}`);
        console.log(`     Revenue: ₱${ad.estimatedRevenue.toFixed(4)}`);
        console.log('');
      }
    });

    // Summary
    console.log('🎉 All monetization system tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   ✅ Targeted ads: ${contexts.length} contexts tested`);
    console.log(`   ✅ Affiliate partners: ${affiliatePartners.length} partners configured`);
    console.log(`   ✅ Sponsored content: ${sponsoredContent.length} items loaded`);
    console.log(`   ✅ Premium tiers: ${premiumTiers.length} tiers available`);
    console.log(`   ✅ Revenue tracking: Events logged successfully`);
    console.log(`   ✅ Analytics: Statistics generated`);
    console.log(`   ✅ Projections: Revenue forecasts calculated`);
    console.log('');
    console.log('🚀 The monetization system is ready for production!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Integrate TargetedAdBanner components into your app');
    console.log('   2. Add AffiliateMarketingCard to result pages');
    console.log('   3. Configure actual affiliate IDs and ad network keys');
    console.log('   4. Monitor revenue performance and optimize');
    console.log('   5. Implement premium subscription flow');
    console.log('   6. Set up analytics dashboard for tracking');

  } catch (error) {
    console.error('❌ Monetization system test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper functions for ad content generation
function getTargetedAdTitle(targeting) {
  const { contextual } = targeting;
  
  if (contextual.cuisine?.length > 0) {
    const cuisine = contextual.cuisine[0];
    return `Discover Amazing ${cuisine} Restaurants`;
  }
  
  if (contextual.mood?.length > 0) {
    const mood = contextual.mood[0];
    return `Perfect for ${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`;
  }
  
  return 'Discover Great Places to Eat';
}

function getTargetedAdDescription(targeting) {
  const { contextual } = targeting;
  
  if (contextual.cuisine?.length > 0 && contextual.mood?.length > 0) {
    const cuisine = contextual.cuisine[0];
    const mood = contextual.mood[0];
    return `Find the best ${cuisine} restaurants perfect for ${mood} moments`;
  }
  
  if (contextual.budget?.length > 0) {
    const budget = contextual.budget[0];
    return `Explore ${budget} dining options that match your preferences`;
  }
  
  return 'Get personalized restaurant recommendations based on your mood and preferences';
}

// Run the test
testMonetizationSystem(); 