import nlp from 'compromise';
import { storage } from './storage';

// Haber kategorileri ve anahtar kelimeleri
const newsCategories = {
  war: [
    'war', 'warfare', 'battle', 'conflict', 'bombing', 'attack', 'military', 'missile', 
    'invasion', 'combat', 'soldiers', 'troops', 'strike', 'artillery', 'hostility',
    'savaş', 'çatışma', 'bombalama', 'saldırı', 'askeri', 'füze', 'istila', 'muharebe'
  ],
  peace: [
    'peace', 'agreement', 'treaty', 'ceasefire', 'truce', 'negotiation', 'diplomacy', 
    'reconciliation', 'settlement', 'cooperation', 'harmony', 'resolution', 'dialogue',
    'barış', 'anlaşma', 'ateşkes', 'müzakere', 'diplomasi', 'uzlaşma', 'işbirliği'
  ],
  economy: [
    'economy', 'economic', 'market', 'trade', 'stock', 'inflation', 'gdp', 'growth', 
    'recession', 'debt', 'financial', 'fiscal', 'monetary', 'investment', 'budget', 
    'unemployment', 'bank', 'currency', 'loan', 'deficit', 'tax', 'finance',
    'ekonomi', 'ekonomik', 'piyasa', 'ticaret', 'borsa', 'enflasyon', 'büyüme',
    'durgunluk', 'borç', 'finansal', 'mali', 'yatırım', 'bütçe', 'işsizlik', 'banka'
  ],
  health: [
    'health', 'pandemic', 'epidemic', 'virus', 'disease', 'infection', 'vaccine', 'hospital', 
    'medical', 'healthcare', 'treatment', 'medicine', 'outbreak', 'illness', 'doctor', 'patient',
    'sağlık', 'pandemi', 'salgın', 'virüs', 'hastalık', 'enfeksiyon', 'aşı', 'hastane',
    'tıbbi', 'tedavi', 'ilaç', 'doktor', 'hasta'
  ],
  politics: [
    'politics', 'government', 'election', 'vote', 'president', 'parliament', 'democracy', 
    'minister', 'politician', 'policy', 'senate', 'congress', 'law', 'legislation', 'political',
    'siyaset', 'hükümet', 'seçim', 'oy', 'cumhurbaşkanı', 'başkan', 'parlamento', 'demokrasi',
    'bakan', 'siyasetçi', 'politika', 'meclis', 'yasa', 'mevzuat', 'siyasi'
  ],
  sports: [
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'olympic', 'championship', 'tournament', 
    'athlete', 'player', 'team', 'match', 'race', 'competition', 'winner', 'stadium', 'coach',
    'spor', 'futbol', 'basketbol', 'tenis', 'olimpiyat', 'şampiyona', 'turnuva',
    'atlet', 'oyuncu', 'takım', 'maç', 'yarış', 'rekabet', 'kazanan', 'stadyum', 'antrenör'
  ],
  terrorism: [
    'terrorism', 'terrorist', 'bombing', 'extremist', 'attack', 'explosion', 'kidnapping', 'hostage', 
    'militant', 'radical', 'terror', 'violent', 'security threat', 'insurgent', 'radicalization',
    'terörizm', 'terörist', 'bombalama', 'aşırıcı', 'saldırı', 'patlama', 'kaçırma', 'rehine',
    'militan', 'radikal', 'terör', 'şiddetli', 'güvenlik tehdidi', 'ayaklanma', 'radikalleşme'
  ],
  humanRights: [
    'human rights', 'rights violation', 'freedom', 'justice', 'discrimination', 'equality', 'oppression', 
    'persecution', 'refugee', 'asylum', 'advocacy', 'activist', 'protest', 'civil liberties', 'dignity',
    'insan hakları', 'hak ihlali', 'özgürlük', 'adalet', 'ayrımcılık', 'eşitlik', 'baskı',
    'zulüm', 'mülteci', 'sığınma', 'savunuculuk', 'aktivist', 'protesto', 'sivil özgürlükler', 'onur'
  ],
  socialEvents: [
    'protest', 'demonstration', 'riot', 'strike', 'rally', 'movement', 'uprising', 'crowd', 
    'unrest', 'civil disobedience', 'activism', 'reform', 'revolution', 'dissent', 'solidarity',
    'protesto', 'gösteri', 'isyan', 'grev', 'miting', 'hareket', 'ayaklanma', 'kalabalık',
    'huzursuzluk', 'sivil itaatsizlik', 'aktivizm', 'reform', 'devrim', 'muhalefet', 'dayanışma'
  ],
  technology: [
    'technology', 'innovation', 'digital', 'cyber', 'internet', 'AI', 'artificial intelligence', 
    'robotics', 'automation', 'startup', 'app', 'software', 'hardware', 'tech', 'computing',
    'teknoloji', 'yenilik', 'dijital', 'siber', 'internet', 'yapay zeka', 'robotik',
    'otomasyon', 'girişim', 'uygulama', 'yazılım', 'donanım', 'bilişim'
  ],
  environment: [
    'environment', 'climate', 'global warming', 'pollution', 'sustainability', 'renewable', 
    'carbon', 'emissions', 'conservation', 'ecosystem', 'biodiversity', 'green', 'energy', 'fossil',
    'çevre', 'iklim', 'küresel ısınma', 'kirlilik', 'sürdürülebilirlik', 'yenilenebilir',
    'karbon', 'emisyon', 'koruma', 'ekosistem', 'biyoçeşitlilik', 'yeşil', 'enerji', 'fosil'
  ],
  natural_disaster: [
    'disaster', 'earthquake', 'flood', 'hurricane', 'tornado', 'tsunami', 'drought', 'wildfire', 
    'landslide', 'volcano', 'catastrophe', 'emergency', 'crisis', 'relief', 'rescue', 'damage',
    'felaket', 'deprem', 'sel', 'kasırga', 'hortum', 'tsunami', 'kuraklık', 'yangın',
    'toprak kayması', 'volkan', 'afet', 'acil durum', 'kriz', 'yardım', 'kurtarma', 'hasar'
  ],
  education: [
    'education', 'school', 'university', 'college', 'student', 'teacher', 'learning', 'academic', 
    'degree', 'curriculum', 'classroom', 'research', 'study', 'scholarship', 'training', 'literacy',
    'eğitim', 'okul', 'üniversite', 'kolej', 'öğrenci', 'öğretmen', 'öğrenme', 'akademik',
    'derece', 'müfredat', 'sınıf', 'araştırma', 'çalışma', 'burs', 'eğitim', 'okuryazarlık'
  ]
};

// Ülkelerin kategorilere olan duyarlılıkları
// -5 (çok kötü etkilenir) ile +5 (çok iyi etkilenir) arasında bir skala kullanıyoruz
type CountrySensitivity = {
  [country: string]: {
    [category: string]: number;
  }
};

// Örnek duyarlılık değerleri
const countrySensitivity: CountrySensitivity = {
  // Büyük ekonomiler ve gelişmiş ülkeler
  US: { // ABD
    war: -3, peace: 2, economy: 5, health: 3, politics: 4, sports: 1, terrorism: -4, 
    humanRights: 2, socialEvents: -1, technology: 5, environment: 2, natural_disaster: -4, education: 3
  },
  CN: { // Çin
    war: -4, peace: 3, economy: 5, health: 2, politics: 4, sports: 1, terrorism: -3, 
    humanRights: -1, socialEvents: -3, technology: 4, environment: 1, natural_disaster: -4, education: 3
  },
  JP: { // Japonya
    war: -4, peace: 3, economy: 5, health: 3, politics: 3, sports: 1, terrorism: -3, 
    humanRights: 2, socialEvents: -1, technology: 5, environment: 3, natural_disaster: -5, education: 4
  },
  DE: { // Almanya
    war: -4, peace: 4, economy: 5, health: 3, politics: 3, sports: 2, terrorism: -4, 
    humanRights: 3, socialEvents: -1, technology: 4, environment: 4, natural_disaster: -3, education: 4
  },
  GB: { // Birleşik Krallık
    war: -3, peace: 3, economy: 4, health: 3, politics: 4, sports: 2, terrorism: -4, 
    humanRights: 3, socialEvents: -1, technology: 4, environment: 3, natural_disaster: -3, education: 4
  },
  FR: { // Fransa
    war: -3, peace: 3, economy: 4, health: 3, politics: 4, sports: 2, terrorism: -4, 
    humanRights: 3, socialEvents: -2, technology: 3, environment: 3, natural_disaster: -3, education: 4
  },
  
  // Petrol ve doğal kaynak zengini ülkeler
  SA: { // Suudi Arabistan
    war: -4, peace: 3, economy: 5, health: 2, politics: 2, sports: 1, terrorism: -5, 
    humanRights: -2, socialEvents: -3, technology: 2, environment: 1, natural_disaster: -3, education: 2
  },
  RU: { // Rusya
    war: -2, peace: 3, economy: 4, health: 2, politics: 3, sports: 2, terrorism: -3, 
    humanRights: -1, socialEvents: -2, technology: 3, environment: 1, natural_disaster: -3, education: 3
  },
  
  // Gelişmekte olan ekonomiler
  BR: { // Brezilya
    war: -2, peace: 2, economy: 4, health: 2, politics: 3, sports: 3, terrorism: -3, 
    humanRights: 2, socialEvents: -2, technology: 2, environment: 3, natural_disaster: -4, education: 2
  },
  IN: { // Hindistan
    war: -3, peace: 3, economy: 4, health: 3, politics: 3, sports: 2, terrorism: -4, 
    humanRights: 2, socialEvents: -2, technology: 3, environment: 2, natural_disaster: -4, education: 3
  },
  ZA: { // Güney Afrika
    war: -3, peace: 3, economy: 4, health: 2, politics: 3, sports: 2, terrorism: -3, 
    humanRights: 3, socialEvents: -2, technology: 2, environment: 2, natural_disaster: -3, education: 3
  },
  
  // Turizmde güçlü olan ülkeler
  TR: { // Türkiye
    war: -4, peace: 3, economy: 4, health: 2, politics: 3, sports: 2, terrorism: -5, 
    humanRights: 1, socialEvents: -2, technology: 2, environment: 2, natural_disaster: -5, education: 2
  },
  TH: { // Tayland
    war: -3, peace: 2, economy: 3, health: 2, politics: 2, sports: 1, terrorism: -4, 
    humanRights: 1, socialEvents: -2, technology: 1, environment: 2, natural_disaster: -4, education: 2
  },
  
  // Küçük ama kırılgan ekonomiler
  GR: { // Yunanistan
    war: -3, peace: 3, economy: 5, health: 2, politics: 3, sports: 1, terrorism: -3, 
    humanRights: 2, socialEvents: -3, technology: 1, environment: 2, natural_disaster: -4, education: 3
  },
  AR: { // Arjantin
    war: -2, peace: 2, economy: 5, health: 2, politics: 3, sports: 3, terrorism: -2, 
    humanRights: 2, socialEvents: -3, technology: 1, environment: 2, natural_disaster: -3, education: 2
  }
};

// Diğer ülkeler için varsayılan duyarlılık değerleri
const defaultSensitivity = {
  war: -3, peace: 2, economy: 3, health: 2, politics: 2, sports: 1, terrorism: -3, 
  humanRights: 1, socialEvents: -2, technology: 1, environment: 1, natural_disaster: -3, education: 2
};

/**
 * Bir haberin hangi kategorilere ait olduğunu analiz eder
 * @param newsItem Analiz edilecek haber
 * @returns Kategorilere göre puan dağılımı (0-1 arası)
 */
export function analyzeNewsCategories(text: string) {
  const doc = nlp(text);
  
  // Metin ön işleme
  const normalizedText = text.toLowerCase();
  
  // Her kategori için puan hesaplama
  const categoryScores: Record<string, number> = {};
  
  for (const [category, keywords] of Object.entries(newsCategories)) {
    let score = 0;
    
    // Anahtar kelimelerin metinde geçme sayısına göre puan hesaplama
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedText.match(regex) || [];
      
      if (matches.length > 0) {
        // Her eşleşme için puan arttır, ancak azalan oranda
        score += Math.min(matches.length * 0.2, 1);
      }
    }
    
    // Puanı normalize et (0-1 arası)
    categoryScores[category] = Math.min(score, 1);
  }
  
  return categoryScores;
}

/**
 * Bir haberin belirli bir ülkenin ekonomisine etkisini hesaplar
 * @param categoryScores Haberin kategori puanları
 * @param countryCode Ülke kodu
 * @returns -1 ile 1 arasında bir etki puanı (-1: çok kötü, 1: çok iyi)
 */
export function calculateNewsImpact(categoryScores: Record<string, number>, countryCode: string) {
  // Ülkenin duyarlılık değerlerini al veya varsayılanı kullan
  const sensitivity = countrySensitivity[countryCode] || defaultSensitivity;
  
  let totalImpact = 0;
  let totalWeight = 0;
  
  // Her kategori için ağırlıklı etki puanı hesapla - daha büyük etki için çarpanları artır
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > 0 && sensitivity[category] !== undefined) {
      // Daha güçlü etki için arttırılmış etki değeri (ortalama %50 daha fazla etki)
      const multiplier = 1.5;  
      const impact = (sensitivity[category] / 5) * score * multiplier; // -1.5 ile 1.5 arası değer verebilir
      totalImpact += impact;
      totalWeight += score;
    }
  }
  
  // Rastgele ek volatilite (gürültü) ekle - %30-60 arası rastgele etki
  const noiseLevel = 0.3 + (Math.random() * 0.3); // 0.3 ile 0.6 arası
  const noiseImpact = (Math.random() > 0.5 ? 1 : -1) * noiseLevel;
  
  // Toplam ağırlık 0 ise sadece gürültü etkisi kullan
  if (totalWeight === 0) return noiseImpact * 0.5; // gürültü seviyesini yarıya düşür
  
  // Ağırlıklı ortalama etki puanı
  return totalImpact / totalWeight;
}

/**
 * Yeni gelen haberleri analiz eder ve ülkelerin değerlerini günceller
 * @param newsItems Analiz edilecek haberler
 * @returns Güncellenen ülkeler ve değerleri
 */
export async function processNewsAndUpdateCountries(newsItems: any[]) {
  const countries = await storage.getAllCountries();
  const updatedCountries: any[] = [];
  
  // Her haber için analiz yap
  for (const newsItem of newsItems) {
    const categoryScores = analyzeNewsCategories(newsItem.title + ' ' + (newsItem.content || ''));
    
    // Doğrudan ilişkili ülke varsa, o ülkeye daha yüksek etki
    let targetCountry = null;
    if (newsItem.countryCode) {
      targetCountry = countries.find(c => c.countryCode === newsItem.countryCode);
    }
    
    if (targetCountry) {
      // Doğrudan ilişkili ülke üzerindeki etkiyi hesapla
      const impact = calculateNewsImpact(categoryScores, targetCountry.countryCode);
      
      // Mevcut fiyatı güncelle
      const currentPrice = parseFloat(targetCountry.currentPrice || "0");
      const previousPrice = currentPrice;
      
      // Etki (impact) -1 ile 1 arasında, fiyat değişimini +/- %5 ile %15 arasında (DAHA FAZLA arttırılmış volatilite)
      const priceChangePercent = impact * (Math.random() * 10 + 5) * 1.5; // %50 daha fazla etki
      const newPrice = currentPrice * (1 + priceChangePercent / 100);
      
      // Fiyatın $0.05'in altına düşmesini önle
      const minPrice = 0.05;
      const adjustedPrice = Math.max(newPrice, minPrice);
      
      // Güncellenmiş değerleri kaydet
      await storage.updateCountry(targetCountry.countryCode, {
        previousPrice: previousPrice.toString(),
        currentPrice: newPrice.toFixed(4)
      });
      
      updatedCountries.push({
        countryCode: targetCountry.countryCode,
        countryName: targetCountry.countryName,
        previousPrice: previousPrice.toString(),
        currentPrice: newPrice.toFixed(4),
        change: priceChangePercent.toFixed(2),
        changeDirection: priceChangePercent >= 0 ? 'up' : 'down',
        newsTitle: newsItem.title
      });
    }
    
    // Diğer ülkeler için daha düşük etki
    for (const country of countries) {
      // Zaten hedef ülke olarak işlendiyse atla
      if (targetCountry && country.countryCode === targetCountry.countryCode) continue;
      
      // Düşük etki hesapla (normal etkinin 1/5'i)
      const impact = calculateNewsImpact(categoryScores, country.countryCode) * 0.2;
      
      // Etkinin çok düşük olduğu durumlarda işlem yapma
      if (Math.abs(impact) < 0.01) continue;
      
      // Mevcut fiyatı güncelle
      const currentPrice = parseFloat(country.currentPrice || "0");
      const previousPrice = currentPrice;
      
      // Düşük etki için orta seviyede fiyat değişimi (ikincil etkiler için 1-3% arası)
      const priceChangePercent = impact * (Math.random() * 2 + 1);
      const newPrice = currentPrice * (1 + priceChangePercent / 100);
      
      // Güncellenmiş değerleri kaydet
      await storage.updateCountry(country.countryCode, {
        previousPrice: previousPrice.toString(),
        currentPrice: newPrice.toFixed(4)
      });
      
      updatedCountries.push({
        countryCode: country.countryCode,
        countryName: country.countryName,
        previousPrice: previousPrice.toString(),
        currentPrice: newPrice.toFixed(4),
        change: priceChangePercent.toFixed(2),
        changeDirection: priceChangePercent >= 0 ? 'up' : 'down',
        newsTitle: newsItem.title
      });
    }
  }
  
  return updatedCountries;
}

/**
 * Bir ülke için fiyat verileri oluşturur (geçmiş veriler için)
 * @param countryCode Ülke kodu
 * @param days Kaç günlük geçmiş veri oluşturulacak
 * @returns OHLC veri dizisi
 */
export function generatePriceHistoryForCountry(countryCode: string, days: number = 30) {
  const priceHistory = [];
  // Ülkenin duyarlılık değerlerini al veya varsayılanı kullan
  const sensitivity = countrySensitivity[countryCode] || defaultSensitivity;
  
  // Ülkenin volatilitesini duyarlılıklarından hesapla
  const volatilityFactors = Object.values(sensitivity).map(Math.abs);
  const avgVolatility = volatilityFactors.reduce((sum, val) => sum + val, 0) / volatilityFactors.length;
  
  // Başlangıç fiyatı $0.5
  let basePrice = 0.5;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Volatiliteye göre günlük fiyat değişimi - Daha yüksek volatilite için katsayı arttırıldı
    const dailyChange = (Math.random() * 2 - 1) * (avgVolatility / 5);
    basePrice = basePrice * (1 + dailyChange);
    
    // OHLC (Open, High, Low, Close) verileri - Daha yüksek intraday volatilite
    const open = basePrice;
    const high = open * (1 + Math.random() * 0.05); // 5% olası yukarı hareket
    const low = open * (1 - Math.random() * 0.05);  // 5% olası aşağı hareket
    const close = (high + low) / 2 + (Math.random() * 0.02 - 0.01); // Biraz daha rastgele kapanış
    
    // UTC zaman damgası (milisaniye cinsinden)
    const timestamp = date.getTime() / 1000;
    
    priceHistory.push({
      time: timestamp,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: Math.floor(Math.random() * 10000) + 1000
    });
  }
  
  return priceHistory;
}

// Fiyat geçmişi verilerini kaydetmek için
export async function savePriceHistoryForCountry(countryCode: string, priceHistory: any[]) {
  // Burada normalde veri tabanına kayıt yapılabilir
  // Şu an için global değişken üzerinden kullanıyoruz
  global.countryPriceHistory = global.countryPriceHistory || {};
  global.countryPriceHistory[countryCode] = priceHistory;
  
  return priceHistory;
}

// Fiyat geçmişi verilerini almak için
export function getPriceHistoryForCountry(countryCode: string) {
  global.countryPriceHistory = global.countryPriceHistory || {};
  
  // Eğer veri yoksa oluştur
  if (!global.countryPriceHistory[countryCode]) {
    const history = generatePriceHistoryForCountry(countryCode);
    global.countryPriceHistory[countryCode] = history;
  }
  
  return global.countryPriceHistory[countryCode];
}

// Son günlük veriyi eklemek için
export function appendLatestPriceForCountry(countryCode: string, price: number) {
  global.countryPriceHistory = global.countryPriceHistory || {};
  
  if (!global.countryPriceHistory[countryCode]) {
    return false;
  }
  
  const history = global.countryPriceHistory[countryCode];
  const lastPoint = history[history.length - 1];
  
  // Eğer aynı günse, sadece close değerini ve high/low değerlerini güncelle
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  
  if (lastPoint.time === today) {
    lastPoint.close = price;
    if (price > lastPoint.high) lastPoint.high = price;
    if (price < lastPoint.low) lastPoint.low = price;
  } else {
    // Yeni bir gün ise, yeni bir veri noktası ekle
    history.push({
      time: today,
      open: lastPoint.close,
      high: Math.max(price, lastPoint.close),
      low: Math.min(price, lastPoint.close),
      close: price,
      volume: Math.floor(Math.random() * 10000) + 1000
    });
  }
  
  return true;
}