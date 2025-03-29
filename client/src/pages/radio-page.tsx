import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/layout";
import { NewsItem } from "@shared/schema";
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, Search, Share, Bookmark, ArrowUpRight, Play, Volume2, VolumeX, Pause, Radio as RadioIcon, Music, Rss, Power } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";

export default function RadioPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeNewsIndex, setActiveNewsIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);

  const {
    data: allNews,
    isLoading,
    error,
  } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    staleTime: 1000 * 60, // 1 minute
  });

  useEffect(() => {
    if (allNews) {
      // Filter news based on the selected category and search query
      let news = [...allNews];
      
      // Filter by tab/category
      if (activeTab !== "all") {
        news = news.filter(item => {
          if (activeTab === "financial") return item.title?.toLowerCase().includes("financial") || item.title?.toLowerCase().includes("economy");
          if (activeTab === "economic") return item.title?.toLowerCase().includes("economy") || item.title?.toLowerCase().includes("economic");
          if (activeTab === "market") return item.title?.toLowerCase().includes("market") || item.title?.toLowerCase().includes("trade");
          if (activeTab === "global") return item.title?.toLowerCase().includes("global") || item.title?.toLowerCase().includes("world");
          return true;
        });
      }
      
      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        news = news.filter(item => 
          item.title?.toLowerCase().includes(query) || 
          item.content?.toLowerCase().includes(query)
        );
      }
      
      setFilteredNews(news);
      // Reset active news index when filtered list changes
      setActiveNewsIndex(0);
    }
  }, [allNews, activeTab, searchQuery]);

  const handleNextNews = () => {
    if (filteredNews.length > 0) {
      setActiveNewsIndex(prev => (prev + 1) % filteredNews.length);
    }
  };

  const handlePreviousNews = () => {
    if (filteredNews.length > 0) {
      setActiveNewsIndex(prev => (prev - 1 + filteredNews.length) % filteredNews.length);
    }
  };

  const formatPublishDate = (timestamp: Date | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get related news based on the active news item
  const getRelatedNews = () => {
    if (!filteredNews.length || activeNewsIndex >= filteredNews.length) return [];
    
    const activeNews = filteredNews[activeNewsIndex];
    const countryCode = activeNews.countryCode;
    
    // Get news with the same country code or similar content
    return filteredNews
      .filter((item, index) => 
        index !== activeNewsIndex && 
        (item.countryCode === countryCode || 
         (item.title && activeNews.title && item.title.toLowerCase().includes(activeNews.title.toLowerCase().substring(0, 10))))
      )
      .slice(0, 3); // Limit to 3 related items
  };

  const getNewsSourceIcon = (source: string | null) => {
    if (!source) return "news";
    
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes("bbc")) return "bbc";
    if (sourceLower.includes("cnn")) return "news";
    if (sourceLower.includes("reuters")) return "reuters";
    if (sourceLower.includes("al jazeera")) return "news";
    if (sourceLower.includes("bloomberg")) return "bloomberg";
    if (sourceLower.includes("financial times")) return "news";
    if (sourceLower.includes("fox")) return "news";
    if (sourceLower.includes("economist")) return "news";
    if (sourceLower.includes("wall street")) return "news";
    if (sourceLower.includes("guardian")) return "news";
    if (sourceLower.includes("nhk")) return "news";
    if (sourceLower.includes("cnbc")) return "cnbc";
    
    // Default
    return "news";
  };

  // BBC World Service stream
  const bbcWorldService = { 
    id: "bbc", 
    name: "BBC World Service", 
    audioSrc: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", // BBC World Service audio stream
    logoSrc: "/icons/bbc.svg",
    description: "24/7 global news, analysis and features from the BBC World Service Radio"
  };

  // Not using audio controls anymore as we're using BBC's embedded player

  const renderActiveNews = () => {
    if (!filteredNews.length) {
      return (
        <Alert>
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>
            {t('tv.noNewsFound')}
          </AlertDescription>
        </Alert>
      );
    }
    
    const news = filteredNews[activeNewsIndex];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/icons/${getNewsSourceIcon(news.source)}.svg`} alt={news.source || ""} />
              <AvatarFallback>{news.source?.substring(0, 2) || "NS"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{news.source || t('tv.unknownSource')}</p>
              <p className="text-xs text-muted-foreground">{formatPublishDate(news.timestamp)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Radio Player Area - Nostalgic Radio Design */}
        <div className="relative rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-b from-rose-200 to-rose-300 rounded-lg shadow-xl p-6">
            {/* Radio Cabinet */}
            <div className="bg-rose-100 rounded-lg border-4 border-amber-800 shadow-inner p-4 flex flex-col items-center">
              
              {/* Radio Handle */}
              <div className="w-24 h-6 -mt-9 mb-4 rounded-t-full bg-amber-800"></div>
              
              {/* Radio Display and Controls */}
              <div className="flex w-full gap-4">
                {/* Speaker Grille */}
                <div className="flex-1 bg-amber-900 rounded p-3 grid grid-cols-6 gap-1">
                  {Array(30).fill(0).map((_, i) => (
                    <div key={i} className="h-2 bg-amber-950 rounded-full"></div>
                  ))}
                </div>
                
                {/* Control Panel */}
                <div className="w-1/3 flex flex-col items-center space-y-4">
                  {/* Tuning Dial */}
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-800 flex items-center justify-center shadow-inner relative">
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <div className="h-3/4 w-3/4 rounded-full bg-rose-50 border-2 border-amber-700 flex items-center justify-center">
                        <div className="absolute w-1 h-10 bg-amber-800 rotate-45 bottom-6 origin-bottom"></div>
                        <div className="w-4 h-4 rounded-full bg-amber-800"></div>
                      </div>
                    </div>
                    <div className="absolute h-full w-full rounded-full">
                      {/* Dial Markings */}
                      {Array(12).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-1 h-2 bg-amber-950"
                          style={{ 
                            transform: `rotate(${i * 30}deg) translateY(-32px)`,
                            transformOrigin: 'center bottom',
                            left: 'calc(50% - 1px)'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    <button className="w-6 h-6 rounded-full bg-amber-800 shadow-sm flex items-center justify-center">
                      <Power className="h-3 w-3 text-rose-100" />
                    </button>
                    <button className="w-6 h-6 rounded-full bg-amber-800 shadow-sm flex items-center justify-center">
                      <VolumeX className="h-3 w-3 text-rose-100" />
                    </button>
                    <button className="w-6 h-6 rounded-full bg-amber-800 shadow-sm flex items-center justify-center">
                      <Volume2 className="h-3 w-3 text-rose-100" />
                    </button>
                  </div>
                  
                  {/* BBC Logo */}
                  <div className="text-center">
                    <p className="font-serif font-bold text-amber-950 text-xs">SEKANCE</p>
                    <p className="font-serif font-bold text-amber-950 text-[9px]">WORLD RADIO</p>
                  </div>
                </div>
              </div>
              
              {/* Radio Footer */}
              <div className="mt-4 w-full flex justify-between items-center text-amber-950">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                  <p className="text-xs font-serif font-bold">LIVE</p>
                </div>
                <p className="text-xs font-medium">BBC World Service</p>
              </div>

              {/* Hidden iframe for audio */}
              <div className="hidden">
                <iframe 
                  src="https://www.bbc.co.uk/sounds/player/live:bbc_world_service" 
                  width="1" 
                  height="1"
                  allow="autoplay"
                ></iframe>
              </div>
            </div>
          </div>

          {/* News Display Under Radio */}
          <div className="mt-4 bg-black/10 backdrop-blur-sm rounded-lg p-3 border border-amber-800/30">
            <p className="text-amber-950 font-medium text-sm mb-1">
              {news.title.substring(0, 60)}...
            </p>
            <p className="text-amber-800/80 text-xs">
              {news.content.substring(0, 120)}...
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold">{news.title}</h2>
        
        {news.countryCode && (
          <Badge variant="outline" className="mb-4">
            {news.countryCode}
          </Badge>
        )}
        
        <div className="prose max-w-none dark:prose-invert">
          <p>{news.content}</p>
        </div>
        
        <div className="flex justify-between pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handlePreviousNews}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('tv.previous')}
          </Button>
          <Button variant="outline" onClick={handleNextNews}>
            {t('tv.next')}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Sekance Radio</h1>
          <p className="text-muted-foreground mt-2">BBC World Service Radio Streaming Live</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      <span className="flex items-center">
                        {t('tv.liveNow')}
                        <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      </span>
                    </CardTitle>
                    <CardDescription>{t('tv.channels')}</CardDescription>
                  </div>
                  <div className="w-full max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-8" 
                        placeholder={t('market.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start mb-4 overflow-auto">
                    <TabsTrigger value="all">{t('tv.allChannels')}</TabsTrigger>
                    <TabsTrigger value="financial">{t('tv.financial')}</TabsTrigger>
                    <TabsTrigger value="economic">{t('tv.economic')}</TabsTrigger>
                    <TabsTrigger value="market">{t('tv.market')}</TabsTrigger>
                    <TabsTrigger value="global">{t('tv.global')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : error ? (
                      <Alert>
                        <AlertTitle>{t('common.error')}</AlertTitle>
                        <AlertDescription>
                          {t('common.error')}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      renderActiveNews()
                    )}
                  </TabsContent>
                  
                  <TabsContent value="financial" className="mt-0">
                    {renderActiveNews()}
                  </TabsContent>
                  
                  <TabsContent value="economic" className="mt-0">
                    {renderActiveNews()}
                  </TabsContent>
                  
                  <TabsContent value="market" className="mt-0">
                    {renderActiveNews()}
                  </TabsContent>
                  
                  <TabsContent value="global" className="mt-0">
                    {renderActiveNews()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('tv.relatedNews')}</CardTitle>
                <CardDescription>{t('tv.latest')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="mb-4 flex space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {getRelatedNews().length > 0 ? (
                      getRelatedNews().map((news, index) => (
                        <div 
                          key={index}
                          className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            const newsIndex = filteredNews.findIndex(item => item.id === news.id);
                            if (newsIndex !== -1) {
                              setActiveNewsIndex(newsIndex);
                            }
                          }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/icons/${getNewsSourceIcon(news.source)}.svg`} alt={news.source || ""} />
                            <AvatarFallback>{news.source?.substring(0, 2) || "NS"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-medium line-clamp-2">{news.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{formatPublishDate(news.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">{t('tv.noRelatedNews')}</p>
                    )}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium mb-3">{t('tv.trending')}</h3>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3 mt-1" />
                      </div>
                    ))
                  ) : (
                    allNews && allNews.slice(0, 5).map((news, index) => (
                      <div 
                        key={index}
                        className="mb-3 cursor-pointer hover:underline"
                        onClick={() => {
                          // Set active tab to all, reset search, then set active news
                          setActiveTab("all");
                          setSearchQuery("");
                          // After filteredNews is updated, find and set the news
                          setTimeout(() => {
                            const newsIndex = allNews.findIndex(item => item.id === news.id);
                            if (newsIndex !== -1) {
                              setActiveNewsIndex(newsIndex);
                            }
                          }, 0);
                        }}
                      >
                        <div className="flex items-start">
                          <ArrowUpRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium line-clamp-2">{news.title}</p>
                            <p className="text-xs text-muted-foreground">{news.source}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}