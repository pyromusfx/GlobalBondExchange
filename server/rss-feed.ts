import Parser from 'rss-parser';
import axios from 'axios';
import { storage } from './storage';

// BBC News Feed URL
const BBC_RSS_URL = 'http://feeds.bbci.co.uk/news/world/rss.xml';

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
    ],
  },
});

// Function to fetch and parse RSS feed
export async function fetchBBCNewsFeed() {
  try {
    // Use axios to fetch the RSS feed (helps with CORS issues)
    const response = await axios.get(BBC_RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      }
    });
    
    // Parse the RSS feed
    const feed = await parser.parseString(response.data);
    
    // Process the items
    for (const item of feed.items.slice(0, 15)) { // Limit to 15 items
      // Extract country code if available in title or content
      // This is a simple approach and might need refinement
      let countryCode = null;
      const countries = [
        { name: 'United States', code: 'US' },
        { name: 'China', code: 'CN' },
        { name: 'Russia', code: 'RU' },
        { name: 'United Kingdom', code: 'GB' },
        { name: 'France', code: 'FR' },
        { name: 'Germany', code: 'DE' },
        { name: 'Japan', code: 'JP' },
        { name: 'India', code: 'IN' },
        { name: 'Brazil', code: 'BR' },
        { name: 'Australia', code: 'AU' },
        { name: 'Canada', code: 'CA' },
        { name: 'Turkey', code: 'TR' },
        { name: 'Israel', code: 'IL' },
        { name: 'South Africa', code: 'ZA' },
      ];
      
      for (const country of countries) {
        if (item.title?.includes(country.name) || item.content?.includes(country.name)) {
          countryCode = country.code;
          break;
        }
      }
      
      // Add the news item to the database
      await storage.addNewsItem({
        title: item.title || 'BBC News Update',
        content: item.content || item.contentSnippet || item.title || '',
        countryCode: countryCode,
        source: 'BBC News'
      });
    }
    
    console.log('Successfully updated news feed from BBC');
    return true;
  } catch (error) {
    console.error('Error fetching BBC news feed:', error);
    return false;
  }
}

// Set up a scheduled task to refresh news feed (every 30 minutes)
export function scheduleNewsFeedUpdates() {
  // Initial fetch
  fetchBBCNewsFeed();
  
  // Set up interval for subsequent fetches
  setInterval(fetchBBCNewsFeed, 30 * 60 * 1000); // 30 minutes
}