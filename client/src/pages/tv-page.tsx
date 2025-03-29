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
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, Search, Share, Bookmark, ArrowUpRight, Play, Volume2, VolumeX, Pause, Radio, Music, Rss } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";

export default function TvPage() {
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
        
        {/* Radio Player Area */}
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-slate-900 to-blue-900 aspect-video mb-4">
          {/* Audio Stream */}
          <iframe 
            src="https://www.bbc.co.uk/sounds/player/live:bbc_world_service" 
            width="100%" 
            height="100%"
            allow="autoplay"
            className="absolute inset-0 h-full w-full border-0"
          ></iframe>
          
          {/* Radio overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute top-0 left-0 m-4 bg-black/50 px-3 py-1 rounded-full flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE</span>
            </div>
            
            <div className="absolute top-0 right-0 m-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-xs font-bold text-white">BBC World Service</span>
            </div>
            
            <div className="text-center bg-black/30 rounded-lg p-4 mb-32 backdrop-blur-sm max-w-sm">
              <p className="text-white/90 text-sm mb-2">
                {news.title.substring(0, 60)}...
              </p>
              <p className="text-xs text-white/70">
                {news.content.substring(0, 120)}...
              </p>
            </div>
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
          <h1 className="text-3xl font-bold">{t('tv.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('tv.subtitle')}</p>
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