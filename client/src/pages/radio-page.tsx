import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRadio } from "@/context/RadioContext";
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

  // BBC World Service stream info
  const bbcWorldService = { 
    id: "bbc", 
    name: "BBC World Service", 
    audioSrc: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", // BBC World Service audio stream
    logoSrc: "/icons/bbc.svg",
    description: "24/7 global news, analysis and features from the BBC World Service Radio"
  };
  
  // Using the RadioContext for floating player instead of embedded audio

  // Get the radio context for toggling the radio player
  const { toggleRadio } = useRadio();
  
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
        
        {/* Modern Radio Player Design */}
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-slate-900 to-blue-800">
          <div className="p-6">
            {/* Radio Header with Logo */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <RadioIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-white font-bold">SEKANCE RADIO</h3>
                  <p className="text-blue-200 text-xs">BBC World Service</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                <span className="text-white text-xs uppercase tracking-wider">Live</span>
              </div>
            </div>
            
            {/* Radio Display */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-white font-medium">Now Playing</div>
                <div className="text-blue-300 text-sm">BBC World Service</div>
              </div>
              
              {/* Radio Controls */}
              <div className="flex space-x-4 justify-center mb-4">
                <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                  <Play className="h-6 w-6 text-white" />
                </button>
                <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                  <Pause className="h-6 w-6 text-white" />
                </button>
                <button className="w-12 h-12 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center transition-colors">
                  <Volume2 className="h-6 w-6 text-white" />
                </button>
              </div>
              
              {/* Volume Slider */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-3/4"></div>
              </div>
              
              {/* Frequency Display */}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-slate-400 text-xs">88</span>
                <div className="flex-1 mx-2 h-1 bg-slate-700 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-blue-500"></div>
                </div>
                <span className="text-slate-400 text-xs">108</span>
              </div>
              
              {/* Station Frequency */}
              <div className="text-center mt-2">
                <span className="text-blue-300 font-bold">92.5 FM</span>
              </div>
            </div>
            
            {/* Latest News Headline */}
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <h4 className="text-white font-medium text-sm mb-2">Breaking News</h4>
              <p className="text-blue-100 text-sm mb-1">
                {news.title}
              </p>
              <p className="text-slate-300 text-xs">
                {news.content.substring(0, 120)}...
              </p>
            </div>

            {/* BBC Radio Stream */}
            <div className="mt-4 flex items-center justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 px-6 flex items-center space-x-2"
                onClick={() => {
                  // Use the RadioContext to open the floating player
                  toggleRadio();
                  window.location.href = "/";
                }}
              >
                <RadioIcon className="h-5 w-5 mr-2" />
                <span>Listen in Background</span>
              </Button>
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
                        Sekance Radio Live
                        <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      </span>
                    </CardTitle>
                    <CardDescription>BBC World Service</CardDescription>
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
                    <TabsTrigger value="all">All Broadcasts</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="economic">Economic</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="global">Global</TabsTrigger>
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
                <CardTitle>Related News</CardTitle>
                <CardDescription>Latest updates from around the world</CardDescription>
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
                  <h3 className="font-medium mb-3">Trending News</h3>
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