import Parser from 'rss-parser';
import axios from 'axios';
import { storage } from './storage';
import { processNewsAndUpdateCountries } from './news-analyzer';

// RSS Feed URLs
const RSS_FEEDS = [
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
  { url: 'http://rss.cnn.com/rss/edition_world.rss', source: 'CNN' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://www.reuters.com/world/rss.xml', source: 'Reuters' }
];

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['media:content', 'media'],
      ['dc:creator', 'creator'],
      ['dc:date', 'dcdate'],
    ],
  },
});

// Country mapping for detecting news relevance
const countryMapping = [
  { name: 'United States', aliases: ['USA', 'U.S.', 'U.S.A.', 'America', 'Washington'], code: 'US' },
  { name: 'China', aliases: ['Chinese', 'Beijing', 'Shanghai', 'PRC'], code: 'CN' },
  { name: 'Russia', aliases: ['Russian', 'Moscow', 'Putin', 'Kremlin'], code: 'RU' },
  { name: 'United Kingdom', aliases: ['UK', 'Britain', 'England', 'London', 'British'], code: 'GB' },
  { name: 'France', aliases: ['French', 'Paris', 'Macron'], code: 'FR' },
  { name: 'Germany', aliases: ['German', 'Berlin', 'Scholz'], code: 'DE' },
  { name: 'Japan', aliases: ['Japanese', 'Tokyo'], code: 'JP' },
  { name: 'India', aliases: ['Indian', 'New Delhi', 'Mumbai', 'Modi'], code: 'IN' },
  { name: 'Brazil', aliases: ['Brazilian', 'Brasilia', 'Rio', 'Sao Paulo'], code: 'BR' },
  { name: 'Australia', aliases: ['Australian', 'Sydney', 'Canberra', 'Melbourne'], code: 'AU' },
  { name: 'Canada', aliases: ['Canadian', 'Ottawa', 'Toronto', 'Vancouver'], code: 'CA' },
  { name: 'Turkey', aliases: ['Turkish', 'Ankara', 'Istanbul', 'Erdogan'], code: 'TR' },
  { name: 'Israel', aliases: ['Israeli', 'Jerusalem', 'Tel Aviv', 'Netanyahu'], code: 'IL' },
  { name: 'South Africa', aliases: ['South African', 'Johannesburg', 'Cape Town', 'Pretoria'], code: 'ZA' },
  { name: 'Spain', aliases: ['Spanish', 'Madrid', 'Barcelona'], code: 'ES' },
  { name: 'Italy', aliases: ['Italian', 'Rome', 'Milan'], code: 'IT' },
  { name: 'Saudi Arabia', aliases: ['Saudi', 'Riyadh'], code: 'SA' },
  { name: 'Argentina', aliases: ['Argentine', 'Buenos Aires'], code: 'AR' },
  { name: 'Greece', aliases: ['Greek', 'Athens'], code: 'GR' },
  { name: 'Thailand', aliases: ['Thai', 'Bangkok'], code: 'TH' },
];

// Detect country from news content
function detectCountry(title: string, content?: string): string | null {
  const combinedText = (title + ' ' + (content || '')).toLowerCase();
  
  for (const country of countryMapping) {
    // Check country name
    if (combinedText.includes(country.name.toLowerCase())) {
      return country.code;
    }
    
    // Check aliases
    for (const alias of country.aliases) {
      if (combinedText.includes(alias.toLowerCase())) {
        return country.code;
      }
    }
  }
  
  return null;
}

// Function to fetch and parse a single RSS feed
async function fetchRSSFeed(feedInfo: {url: string, source: string}) {
  try {
    // Use axios to fetch the RSS feed (helps with CORS issues)
    const response = await axios.get(feedInfo.url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      }
    });
    
    // Parse the RSS feed
    const feed = await parser.parseString(response.data);
    const newsItems = [];
    
    // Process the items
    for (const item of feed.items.slice(0, 10)) { // Limit to 10 items per feed
      const countryCode = detectCountry(item.title || '', item.content || item.contentSnippet || '');
      
      // Add the news item to the database
      const newsItem = await storage.addNewsItem({
        title: item.title || `${feedInfo.source} Update`,
        content: item.content || item.contentSnippet || item.title || '',
        countryCode: countryCode,
        source: feedInfo.source
      });
      
      newsItems.push(newsItem);
    }
    
    // Process news and update country values
    const updatedCountries = await processNewsAndUpdateCountries(newsItems);
    
    if (updatedCountries.length > 0) {
      console.log(`Updated ${updatedCountries.length} countries based on news from ${feedInfo.source}`);
    }
    
    return newsItems;
  } catch (error) {
    console.error(`Error fetching ${feedInfo.source} feed:`, error);
    return [];
  }
}

// Function to fetch all configured RSS feeds
export async function fetchAllNewsFeeds() {
  try {
    const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed));
    const results = await Promise.allSettled(feedPromises);
    
    let successCount = 0;
    let failCount = 0;
    let totalNewsItems = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        totalNewsItems += result.value.length;
      } else {
        failCount++;
        console.error(`Failed to fetch ${RSS_FEEDS[index].source}:`, result.reason);
      }
    });
    
    console.log(`Successfully updated news feeds: ${successCount} sources, ${failCount} failures, ${totalNewsItems} total items`);
    return true;
  } catch (error) {
    console.error('Error in fetchAllNewsFeeds:', error);
    return false;
  }
}

// Legacy function to maintain compatibility
export async function fetchBBCNewsFeed() {
  const bbcFeed = RSS_FEEDS.find(feed => feed.source === 'BBC News');
  if (bbcFeed) {
    await fetchRSSFeed(bbcFeed);
    return true;
  }
  return false;
}

// Set up a scheduled task to refresh news feed and update country values
export function scheduleNewsFeedUpdates() {
  // Initial fetch
  fetchAllNewsFeeds();
  
  // Set up interval for subsequent fetches (her 2 dakikada bir - daha sık güncelleme)
  setInterval(fetchAllNewsFeeds, 2 * 60 * 1000);

  // Her 30 saniyede bir haberleri tekrar işle ve ülke fiyatlarını daha sık güncelle
  // Bu, mevcut haberleri yeniden analiz ederek daha fazla fiyat hareketliliği yaratır
  setInterval(async () => {
    try {
      const storage = (await import('./storage')).storage;
      const newsAnalyzer = await import('./news-analyzer');
      
      // Mevcut haberleri al
      const latestNews = await storage.getLatestNews();
      if (latestNews.length > 0) {
        // Rastgele 1-3 haber seç
        const randomCount = Math.floor(Math.random() * 3) + 1;
        const randomIndices = Array.from({length: randomCount}, () => 
          Math.floor(Math.random() * latestNews.length));
        
        const selectedNews = randomIndices.map(index => latestNews[index]);
        
        // Seçilen haberleri yeniden analiz et ve ülke değerlerini güncelle
        await newsAnalyzer.processNewsAndUpdateCountries(selectedNews);
        console.log(`Yeniden analiz: ${randomCount} haber ile ${randomIndices.length} ülkenin fiyatı güncellendi`);
      }
    } catch (error) {
      console.error('Haber yeniden analiz hatası:', error);
    }
  }, 30 * 1000);
  
  // Initialize price history for all countries
  initializePriceHistory();
}

// Initialize price history for all countries
async function initializePriceHistory() {
  try {
    const countries = await storage.getAllCountries();
    console.log(`Initializing price history for ${countries.length} countries...`);
    
    for (const country of countries) {
      // Make sure each country has a current price
      if (!country.currentPrice) {
        await storage.updateCountry(country.countryCode, {
          currentPrice: "0.5",
          previousPrice: "0.5"
        });
      }
    }
  } catch (error) {
    console.error('Error initializing price history:', error);
  }
}