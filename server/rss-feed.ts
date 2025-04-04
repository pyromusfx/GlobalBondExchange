import Parser from 'rss-parser';
import axios from 'axios';
import { storage } from './storage';
import { processNewsAndUpdateCountries } from './news-analyzer';

// RSS Feed URLs
const RSS_FEEDS = [
  // Büyük haber ajansları
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News World' },
  { url: 'http://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC News Business' },
  { url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC News Politics' },
  { url: 'http://rss.cnn.com/rss/edition_world.rss', source: 'CNN World' },
  { url: 'http://rss.cnn.com/rss/money_news_international.rss', source: 'CNN Money' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://www.reuters.com/world/rss.xml', source: 'Reuters World' },
  { url: 'https://www.reuters.com/business/rss.xml', source: 'Reuters Business' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News World' },
  { url: 'https://feeds.skynews.com/feeds/rss/business.xml', source: 'Sky News Business' },
  { url: 'https://feeds.skynews.com/feeds/rss/politics.xml', source: 'Sky News Politics' },
  
  // Ekonomi odaklı kaynaklar
  { url: 'https://www.ft.com/world?format=rss', source: 'Financial Times World' },
  { url: 'https://www.economist.com/finance-and-economics/rss.xml', source: 'The Economist' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC World' },
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC Economy' },
  { url: 'https://www.wsj.com/xml/rss/3_7085.xml', source: 'WSJ World' },
  { url: 'https://www.wsj.com/xml/rss/3_7031.xml', source: 'WSJ Business' },
  { url: 'https://markets.businessinsider.com/rss/news', source: 'Business Insider Markets' },
  { url: 'http://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch Top' },
  { url: 'http://feeds.marketwatch.com/marketwatch/marketpulse/', source: 'MarketWatch Pulse' },
  { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com News' },
  { url: 'https://www.investing.com/rss/market_overview_Commodities.rss', source: 'Investing.com Commodities' },
  { url: 'https://www.investing.com/rss/market_overview_forex.rss', source: 'Investing.com Forex' },
  
  // Diğer bölgesel kaynaklar
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'Times of India World' },
  { url: 'https://www.smh.com.au/rss/world.xml', source: 'Sydney Morning Herald' },
  { url: 'https://feeds.thelocal.com/rss/de', source: 'The Local Germany' },
  { url: 'https://feeds.thelocal.com/rss/fr', source: 'The Local France' },
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News World' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat6.xml', source: 'NHK World Japan' },
  { url: 'https://www.bangkokpost.com/rss/data/most-recent.xml', source: 'Bangkok Post' },
  { url: 'https://www.straitstimes.com/global.xml', source: 'Straits Times Global' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat9.xml', source: 'NHK Business' },
  { url: 'https://www.jpost.com/Rss/RssFeedsWorld.aspx', source: 'Jerusalem Post World' },
  
  // Türk kaynakları
  { url: 'https://www.trthaber.com/ekonomi_articles.rss', source: 'TRT Ekonomi' },
  { url: 'https://www.trthaber.com/dunya_articles.rss', source: 'TRT Dünya' },
  { url: 'https://www.hurriyet.com.tr/rss/dunya', source: 'Hürriyet Dünya' },
  { url: 'https://www.hurriyet.com.tr/rss/ekonomi', source: 'Hürriyet Ekonomi' },
  
  // Teknoloji ve inovasyon
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
  { url: 'https://www.zdnet.com/topic/banking/rss.xml', source: 'ZDNet Banking' }
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
  { name: 'United States', aliases: ['USA', 'U.S.', 'U.S.A.', 'America', 'Washington', 'Biden', 'American', 'White House', 'Pentagon'], code: 'US' },
  { name: 'China', aliases: ['Chinese', 'Beijing', 'Shanghai', 'PRC', 'Xi Jinping', 'Communist Party', 'Mainland China', 'Guangzhou', 'Hong Kong', 'Shenzhen'], code: 'CN' },
  { name: 'Russia', aliases: ['Russian', 'Moscow', 'Putin', 'Kremlin', 'St. Petersburg', 'Soviet', 'Siberia', 'Rouble', 'Moscow'], code: 'RU' },
  { name: 'United Kingdom', aliases: ['UK', 'Britain', 'England', 'London', 'British', 'Scotland', 'Wales', 'Northern Ireland', 'Pound Sterling', 'Westminster', 'Boris', 'Starmer'], code: 'GB' },
  { name: 'France', aliases: ['French', 'Paris', 'Macron', 'Eiffel', 'Champs-Elysees', 'Euro', 'Lyon', 'Marseille', 'Nice'], code: 'FR' },
  { name: 'Germany', aliases: ['German', 'Berlin', 'Scholz', 'Merkel', 'Frankfurt', 'Hamburg', 'Munich', 'Bundesbank', 'Reichstag', 'Euro', 'Deutsche'], code: 'DE' },
  { name: 'Japan', aliases: ['Japanese', 'Tokyo', 'Yen', 'Osaka', 'Kyoto', 'Abe', 'Kishida', 'Nikkei', 'Fukushima', 'Okinawa'], code: 'JP' },
  { name: 'India', aliases: ['Indian', 'New Delhi', 'Mumbai', 'Modi', 'Rupee', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Ganges', 'Maharashtra'], code: 'IN' },
  { name: 'Brazil', aliases: ['Brazilian', 'Brasilia', 'Rio', 'Sao Paulo', 'Bolsonaro', 'Lula', 'Amazon', 'Real', 'Copacabana', 'Carnival'], code: 'BR' },
  { name: 'Australia', aliases: ['Australian', 'Sydney', 'Canberra', 'Melbourne', 'Aussie', 'Brisbane', 'Perth', 'Great Barrier Reef', 'Dollar', 'Outback'], code: 'AU' },
  { name: 'Canada', aliases: ['Canadian', 'Ottawa', 'Toronto', 'Vancouver', 'Trudeau', 'Quebec', 'Montreal', 'Alberta', 'Loonie', 'Maple'], code: 'CA' },
  { name: 'Turkey', aliases: ['Turkish', 'Ankara', 'Istanbul', 'Erdogan', 'Lira', 'Bosphorus', 'Antalya', 'Izmir', 'Konya', 'Black Sea'], code: 'TR' },
  { name: 'Israel', aliases: ['Israeli', 'Jerusalem', 'Tel Aviv', 'Netanyahu', 'Shekel', 'Gaza', 'Haifa', 'Mossad', 'IDF', 'West Bank'], code: 'IL' },
  { name: 'South Africa', aliases: ['South African', 'Johannesburg', 'Cape Town', 'Pretoria', 'Rand', 'Durban', 'Mandela', 'Soweto', 'ANC', 'Ramaphosa'], code: 'ZA' },
  { name: 'Spain', aliases: ['Spanish', 'Madrid', 'Barcelona', 'Euro', 'Catalonia', 'Valencia', 'Seville', 'Mallorca', 'Basque', 'Canary'], code: 'ES' },
  { name: 'Italy', aliases: ['Italian', 'Rome', 'Milan', 'Euro', 'Vatican', 'Venice', 'Florence', 'Naples', 'Sicily', 'Turin'], code: 'IT' },
  { name: 'Saudi Arabia', aliases: ['Saudi', 'Riyadh', 'Mecca', 'Jeddah', 'Aramco', 'Riyal', 'King Salman', 'MBS', 'Medina', 'OPEC'], code: 'SA' },
  { name: 'Argentina', aliases: ['Argentine', 'Buenos Aires', 'Peso', 'Patagonia', 'Pampas', 'Cordoba', 'Mendoza', 'Rosario', 'Tierra del Fuego'], code: 'AR' },
  { name: 'Greece', aliases: ['Greek', 'Athens', 'Euro', 'Acropolis', 'Parthenon', 'Thessaloniki', 'Crete', 'Santorini', 'Mykonos', 'Aegean'], code: 'GR' },
  { name: 'Thailand', aliases: ['Thai', 'Bangkok', 'Baht', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Mekong'], code: 'TH' },
  { name: 'Mexico', aliases: ['Mexican', 'Mexico City', 'Peso', 'Cancun', 'Guadalajara', 'Monterrey', 'Yucatan', 'Chiapas', 'Baja', 'Acapulco'], code: 'MX' },
  { name: 'South Korea', aliases: ['Korean', 'Seoul', 'Won', 'Busan', 'Incheon', 'Daegu', 'Pyeongchang', 'Samsung', 'Hyundai', 'Kia', 'K-pop'], code: 'KR' },
  { name: 'Indonesia', aliases: ['Indonesian', 'Jakarta', 'Rupiah', 'Bali', 'Surabaya', 'Sumatra', 'Java', 'Borneo', 'Sulawesi', 'Papua'], code: 'ID' },
  { name: 'Netherlands', aliases: ['Dutch', 'Amsterdam', 'Euro', 'Rotterdam', 'The Hague', 'Utrecht', 'Holland', 'Gulden', 'Randstad', 'Eindhoven'], code: 'NL' },
  { name: 'Switzerland', aliases: ['Swiss', 'Bern', 'Zurich', 'Geneva', 'Franc', 'Basel', 'Lausanne', 'Lucerne', 'Alps', 'Davos'], code: 'CH' },
  { name: 'Poland', aliases: ['Polish', 'Warsaw', 'Zloty', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Lodz', 'Vistula', 'Katowice'], code: 'PL' },
  { name: 'Pakistan', aliases: ['Pakistani', 'Islamabad', 'Karachi', 'Lahore', 'Rupee', 'Peshawar', 'Rawalpindi', 'Faisalabad', 'Indus', 'Sindh'], code: 'PK' },
  { name: 'Iran', aliases: ['Iranian', 'Tehran', 'Rial', 'Isfahan', 'Mashhad', 'Shiraz', 'Persian', 'Khamenei', 'Raisi', 'Revolutionary Guard'], code: 'IR' },
  { name: 'Ukraine', aliases: ['Ukrainian', 'Kyiv', 'Kiev', 'Hryvnia', 'Kharkiv', 'Odessa', 'Lviv', 'Dnieper', 'Dnipro', 'Donetsk', 'Crimea', 'Zelenskyy'], code: 'UA' },
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

// Yeni haberlerin benzersizliğini kontrol etmek için son 200 haber başlığını saklama
const recentNewsTitles = new Set<string>();
const MAX_RECENT_NEWS = 200;

// Yeni eklenen haberin benzersiz olup olmadığını kontrol et
function isUniqueNews(title: string): boolean {
  if (!title) return false;
  
  // Başlığı normalize et (küçük harfe çevir, gereksiz boşlukları kaldır)
  const normalizedTitle = title.toLowerCase().trim();
  
  // Set içinde ara
  if (recentNewsTitles.has(normalizedTitle)) {
    return false;
  }
  
  // Set'e ekle ve boyutunu kontrol et
  recentNewsTitles.add(normalizedTitle);
  if (recentNewsTitles.size > MAX_RECENT_NEWS) {
    // Set çok büyürse en eski ekleneni sil (FIFO)
    const firstItem = recentNewsTitles.values().next().value;
    recentNewsTitles.delete(firstItem);
  }
  
  return true;
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
    for (const item of feed.items.slice(0, 20)) { // Daha fazla haber almak için 15'den 20'ye çıkarıldı
      // Haber başlığını kontrol et - benzersiz değilse atla
      if (!item.title || !isUniqueNews(item.title)) {
        continue;
      }
      
      // Kaynak Türkçe ise veya içerikte Turkish/Turkey geçiyorsa direkt Türkiye'ye bağla
      const isTurkishSource = feedInfo.source.includes('TRT') || 
                             feedInfo.source.includes('Hürriyet') || 
                             (item.title || '').toLowerCase().includes('turk') || 
                             (item.content || '').toLowerCase().includes('turk');
      
      // Ülke kodunu belirle veya Türkçe kaynak ise Türkiye'yi seç
      const countryCode = isTurkishSource ? 'TR' : detectCountry(item.title || '', item.content || item.contentSnippet || '');
      
      // Ülke kodu bulunamadıysa rastgele bir ülke seç (daha fazla fiyat hareketi için)
      // Ancak rastgele seçimde ana ekonomiler ve Türkiye'nin seçilme olasılığını artır
      const keyCountries = ['US', 'CN', 'JP', 'DE', 'GB', 'FR', 'TR', 'RU', 'IN', 'BR'];
      let finalCountryCode;
      
      if (!countryCode) {
        // %70 olasılıkla önemli ülkeleri seç, %30 olasılıkla herhangi bir ülkeyi
        if (Math.random() < 0.7) {
          finalCountryCode = keyCountries[Math.floor(Math.random() * keyCountries.length)];
        } else {
          finalCountryCode = countryMapping[Math.floor(Math.random() * countryMapping.length)].code;
        }
      } else {
        finalCountryCode = countryCode;
      }
      
      // Add the news item to the database
      const newsItem = await storage.addNewsItem({
        title: item.title || `${feedInfo.source} Update`,
        content: item.content || item.contentSnippet || item.title || '',
        countryCode: finalCountryCode,
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
  
  // Set up interval for subsequent fetches (her 5 dakikada bir güncelleme - sistem yükünü azaltmak için)
  setInterval(fetchAllNewsFeeds, 5 * 60 * 1000);

  // Her 20 saniyede bir haberleri tekrar işle ve ülke fiyatlarını sürekli değişecek şekilde güncelle
  // Bu, mevcut haberleri yeniden analiz ederek sürekli fiyat hareketliliği yaratır, ancak sistem yükünü azaltmak için daha uzun aralıkla
  setInterval(async () => {
    try {
      const storage = (await import('./storage')).storage;
      const newsAnalyzer = await import('./news-analyzer');
      
      // Mevcut haberleri al
      const latestNews = await storage.getLatestNews();
      if (latestNews.length > 0) {
        // Rastgele 8-20 haber seç - çok daha fazla haber ve sürekli fiyat hareketi
        const randomCount = Math.floor(Math.random() * 13) + 8; 
        
        // Haberlerin seçiminde önyargı oluştur - Türkiye ile ilgili haberler daha fazla seçilsin
        const turkishNews = latestNews.filter(news => 
          news.countryCode === 'TR' || 
          (news.title && news.title.toLowerCase().includes('turk')) || 
          (news.content && news.content.toLowerCase().includes('turk'))
        );
        
        // Rastgele haber seçimi
        let selectedNews = [];
        
        // Eğer Türkiye ile ilgili haber varsa, %50 ihtimal ile bunlar arasından seç
        if (turkishNews.length > 0 && Math.random() > 0.5) {
          // Türkiye haberlerinden rastgele seç
          const turkishCount = Math.min(turkishNews.length, randomCount);
          const turkishIndices = Array.from({length: turkishCount}, () => 
            Math.floor(Math.random() * turkishNews.length));
          
          selectedNews = turkishIndices.map(index => turkishNews[index]);
          
          // Eğer yeterli haber yoksa diğer haberlerden de ekle
          if (selectedNews.length < randomCount) {
            const otherNews = latestNews.filter(news => !turkishNews.includes(news));
            const otherCount = randomCount - selectedNews.length;
            
            if (otherNews.length > 0) {
              const otherIndices = Array.from({length: otherCount}, () => 
                Math.floor(Math.random() * otherNews.length));
              
              selectedNews = [...selectedNews, ...otherIndices.map(index => otherNews[index])];
            }
          }
        } else {
          // Normal rastgele seçim
          const randomIndices = Array.from({length: randomCount}, () => 
            Math.floor(Math.random() * latestNews.length));
          
          selectedNews = randomIndices.map(index => latestNews[index]);
        }
        
        // Seçilen haberleri yeniden analiz et ve ülke değerlerini güncelle
        await newsAnalyzer.processNewsAndUpdateCountries(selectedNews);
        console.log(`Yeniden analiz: ${randomCount} haber ile ${selectedNews.length} ülkenin fiyatı güncellendi`);
      }
    } catch (error) {
      console.error('Haber yeniden analiz hatası:', error);
    }
  }, 20 * 1000);
  
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