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
  
  // Her kategori için ağırlıklı etki puanı hesapla - aşırı dalgalanmayı önlemek için çarpanları düşürdük
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > 0 && sensitivity[category] !== undefined) {
      // Daha dengeli etki için düşürülmüş etki değeri
      const multiplier = 0.75;  // 1.5'ten 0.75'e düşürüldü 
      const impact = (sensitivity[category] / 5) * score * multiplier; // -0.75 ile 0.75 arası değer verebilir
      totalImpact += impact;
      totalWeight += score;
    }
  }
  
  // Rastgele ek volatilite (gürültü) ekle - %10-20 arası rastgele etki (düşürüldü)
  const noiseLevel = 0.1 + (Math.random() * 0.1); // 0.1 ile 0.2 arası (düşürüldü)
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
      
      // Haber etkisinin ciddiyetine göre fiyat değişim yüzdesini belirle
      // Haberin etkisi ve okunma oranı ile doğru orantılı
      const impactMagnitude = Math.abs(impact);
      
      // Haberin önemine göre değişim yüzdesini belirle (0.5% - 3%)
      const baseChangePercent = impactMagnitude * 3; 
      
      // Geçmiş 24 saat içindeki fiyat hareketini hesaba katarak aşırı oynaklığı azalt
      // Önceki değişim büyükse, yeni değişimi azalt (piyasa stabilizasyonu)
      const prevChangeRatio = Math.abs(parseFloat(targetCountry.previousPrice || "1.0") - currentPrice) / currentPrice;
      
      // Geçmiş fiyat hareketi çok büyükse, şimdiki değişimi daha az etkile
      const marketStabilityFactor = prevChangeRatio > 0.05 ? 0.5 : 1;
      
      // Fiyat değişimini hesapla
      const directionSign = impact > 0 ? 1 : -1;
      const priceChangePercent = directionSign * baseChangePercent * marketStabilityFactor;
      
      // Son durumda fiyatı güncelle
      const newPrice = currentPrice * (1 + priceChangePercent / 100);
      
      // Güncellenmiş değerleri kaydet (aralık sınırlaması olmadan doğrudan newPrice kullanıyoruz)
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
      
      // Haber etkisinin ciddiyetine göre fiyat değişim yüzdesini belirle
      const impactMagnitude = Math.abs(impact);
      
      // Haberin önemine göre değişim yüzdesini belirle (0.2% - 1.5%)
      const baseChangePercent = impactMagnitude * 1.5; 
      
      // Geçmiş fiyat hareketini hesaba katarak aşırı oynaklığı azalt
      const prevChangeRatio = Math.abs(parseFloat(country.previousPrice || "1.0") - currentPrice) / currentPrice;
      
      // Geçmiş fiyat hareketi çok büyükse, şimdiki değişimi daha az etkile
      const marketStabilityFactor = prevChangeRatio > 0.03 ? 0.4 : 1;
      
      // Fiyat değişimini hesapla
      const directionSign = impact > 0 ? 1 : -1;
      const priceChangePercent = directionSign * baseChangePercent * marketStabilityFactor;
      
      // Son durumda fiyatı güncelle
      const newPrice = currentPrice * (1 + priceChangePercent / 100);
      
      // Güncellenmiş değerleri kaydet (doğrudan newPrice kullanıyoruz)
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
  // Başlangıç fiyatı $1.0 (yeni fiyat politikamız)
  // Tüm ülkeler için sabit fiyat kullanıyoruz
  let basePrice = 1.0;
  const now = new Date();
  
  // Ülkeye özgü trend ve volatilite tanımla
  // Ülke kodunun ASCII değerlerinin toplamına göre trend belirle (deterministik)
  let trendFactor = 0;
  for (let i = 0; i < countryCode.length; i++) {
    trendFactor += countryCode.charCodeAt(i) % 10;
  }
  
  // -5 ila +5 arasında bir trend faktörü oluştur
  trendFactor = (trendFactor % 10) - 5;
  
  // Volatilite ülke kodunun son karakterine göre belirle (0.03 - 0.08 arası)
  const lastChar = countryCode.charCodeAt(countryCode.length - 1);
  const volatility = 0.03 + (lastChar % 5) * 0.01;
  
  // Başlangıç trendinden devam eden bir dizi volatilite paterni tanımla
  // Bu patern belirli aralıklarla fiyat hareketinin yönünü değiştirir
  const patternDuration = Math.max(3, days / 5); // En az 3 gün, en fazla 1/5 gün
  let patternCounter = 0;
  let currentTrendDirection = trendFactor > 0 ? 1 : -1;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Patern değişimi - her patternDuration periyodunda trend yönünü değiştir
    if (patternCounter >= patternDuration) {
      patternCounter = 0;
      // %40 ihtimalle trendi tersine çevir, %60 ihtimalle devam ettir
      if (Math.random() < 0.4) {
        currentTrendDirection *= -1;
      }
    }
    
    // Günlük değişimi hesapla (trend + rastgele volatilite)
    const trendChange = (currentTrendDirection * volatility * 0.5); // Trendden gelen değişim
    const randomChange = (Math.random() * 2 - 1) * volatility;      // Rastgele volatilite
    const dailyChange = trendChange + randomChange;
    
    // Fiyatı güncelle
    basePrice = Math.max(0.8, Math.min(1.2, basePrice * (1 + dailyChange))); // Fiyat sınırları 0.8-1.2 arası
    
    // OHLC (Open, High, Low, Close) değerleri
    const open = basePrice;
    
    // Gün içi volatilite, şu anki volatilite değeriyle orantılı olsun
    const intradayVolatility = volatility * 0.8;
    
    // Trend yönüne göre high/low değerlerini daha gerçekçi belirle
    const high = open * (1 + Math.random() * intradayVolatility * (currentTrendDirection > 0 ? 1.2 : 0.8));
    const low = open * (1 - Math.random() * intradayVolatility * (currentTrendDirection < 0 ? 1.2 : 0.8));
    
    // Kapanış değerini trendin yönüyle ilişkilendir
    // Trend yukarıysa yüksek kapanış, aşağıysa düşük kapanış olasılığı daha yüksek
    const trendBias = (currentTrendDirection + 1) / 2; // 0-1 arası değer (negatif trend: 0, pozitif trend: 1)
    const closePosition = Math.random() * 0.5 + trendBias * 0.5; // 0-1 arası, trend yönüne eğilimli
    
    // Kapanış değerini high ve low arasında trend yönüne doğru eğilimli belirle
    const close = low + (high - low) * closePosition;
    
    // Hacim, fiyat hareketinin büyüklüğüyle orantılı olsun
    const priceMovement = Math.abs(close - open) / open;
    const volume = Math.floor((1000 + Math.random() * 4000) * (1 + priceMovement * 10));
    
    // UTC zaman damgası (saniye cinsinden)
    const timestamp = Math.floor(date.getTime() / 1000);
    
    priceHistory.push({
      time: timestamp,
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: volume
    });
    
    patternCounter++;
  }
  
  return priceHistory;
}

// Global değişken type tanımı
declare global {
  var countryPriceHistory: Record<string, any[]>;
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
  
  // Eğer fiyat geçmişi yoksa, yeni oluştur
  if (!global.countryPriceHistory[countryCode] || global.countryPriceHistory[countryCode].length === 0) {
    global.countryPriceHistory[countryCode] = generatePriceHistoryForCountry(countryCode);
  }
  
  const history = global.countryPriceHistory[countryCode];
  const lastPoint = history[history.length - 1];
  
  // Fiyatı formatlı bir sayıya dönüştür
  price = parseFloat(price.toFixed(4));
  
  // Eğer son veri noktası bugüne aitse, güncelle
  const now = new Date();
  const today = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
  
  if (Math.floor(lastPoint.time) === today) {
    // Son mum verisini güncelle
    lastPoint.close = price;
    
    // Gün içi high ve low değerlerini güncelle
    if (price > lastPoint.high) {
      lastPoint.high = price;
    }
    if (price < lastPoint.low) {
      lastPoint.low = price;
    }
    
    // Hacmi arttır, fiyat değişimi büyükse daha fazla artış olsun
    const priceChange = Math.abs(price - lastPoint.open) / lastPoint.open;
    lastPoint.volume += Math.floor(Math.random() * 1000) * (1 + priceChange * 10);
  } else {
    // Yeni bir gün için yeni veri noktası oluştur
    // Açılış, önceki kapanışla aynı olsun
    const open = lastPoint.close;
    
    // Açılış ile yeni fiyat arasında %1'lik rastgele sapma ekle
    const volatility = 0.01;
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    
    // Açılış fiyatına rastgele bir sapma ekle (daha gerçekçi olması için)
    const adjustedOpen = parseFloat((open * randomFactor).toFixed(4));
    
    // Gün içi high ve low değerlerini belirle
    const high = Math.max(adjustedOpen, price) * (1 + Math.random() * 0.005); // %0.5 yukarı sapma
    const low = Math.min(adjustedOpen, price) * (1 - Math.random() * 0.005);  // %0.5 aşağı sapma
    
    // Hacim, fiyat değişiminin büyüklüğüne göre daha yüksek olsun
    const volumeBase = 2000 + Math.random() * 3000;
    const priceChangeFactor = Math.abs(price - adjustedOpen) / adjustedOpen;
    const volume = Math.floor(volumeBase * (1 + priceChangeFactor * 15));
    
    // Yeni mum verisini ekle
    history.push({
      time: today,
      open: adjustedOpen,
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: price,
      volume: volume
    });
    
    // Veri setini makul bir boyuta kırp (son 90 gün)
    if (history.length > 90) {
      history.splice(0, history.length - 90);
    }
  }
  
  return true;
}