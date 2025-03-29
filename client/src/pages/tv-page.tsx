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
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, Search, Share, Bookmark, ArrowUpRight, Play, Volume2, VolumeX, Maximize, MinusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
    if (!source) return null;
    
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes("bbc")) return "bbc";
    if (sourceLower.includes("cnn")) return "cnn";
    if (sourceLower.includes("reuters")) return "reuters";
    if (sourceLower.includes("al jazeera")) return "aljazeera";
    if (sourceLower.includes("bloomberg")) return "bloomberg";
    if (sourceLower.includes("financial times")) return "ft";
    if (sourceLower.includes("fox")) return "fox";
    if (sourceLower.includes("economist")) return "economist";
    if (sourceLower.includes("wall street")) return "wsj";
    if (sourceLower.includes("guardian")) return "guardian";
    if (sourceLower.includes("nhk")) return "nhk";
    
    // Default
    return "news";
  };

  // Define broadcast channels with video sources
  const broadcastChannels = [
    { 
      id: "bloomberg", 
      name: "Bloomberg TV", 
      videoSrc: "https://www.bloomberg.com/media-manifest/streams/us.m3u8",
      logoSrc: "/icons/bloomberg.svg" 
    },
    { 
      id: "bbc", 
      name: "BBC World News", 
      videoSrc: "https://www.bbc.co.uk/news/av/business-12686570",
      logoSrc: "/icons/bbc.svg" 
    },
    { 
      id: "cnbc", 
      name: "CNBC", 
      videoSrc: "https://www.cnbc.com/live-tv/",
      logoSrc: "/icons/cnbc.svg" 
    },
    { 
      id: "reuters", 
      name: "Reuters TV", 
      videoSrc: "https://www.reuters.tv/",
      logoSrc: "/icons/reuters.svg" 
    }
  ];

  // Video player state
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [selectedChannel, setSelectedChannel] = useState<string>("bloomberg");
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate video progress
  useEffect(() => {
    if (isPlayingVideo) {
      videoTimerRef.current = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            // When video ends, start another news clip
            handleNextNews();
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    } else if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
    }

    return () => {
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
      }
    };
  }, [isPlayingVideo]);

  const toggleVideoPlay = () => {
    setIsPlayingVideo(prev => !prev);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

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
    const currentChannel = broadcastChannels.find(channel => channel.id === selectedChannel) || broadcastChannels[0];
    
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
        
        {/* Video Player Area */}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Placeholder for video that would come from a real streaming source */}
            <div className="flex flex-col items-center justify-center text-white">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={currentChannel.logoSrc} alt={currentChannel.name} />
                <AvatarFallback>{currentChannel.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold mb-1">{currentChannel.name}</h3>
              <p className="text-sm opacity-80 mb-4">
                {news.title}
              </p>
              
              {/* LIVE indicator */}
              <div className="flex items-center bg-red-600 px-3 py-1 rounded-full mb-4">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-2"></span>
                <span className="text-xs font-bold">LIVE</span>
              </div>
            </div>
          </div>
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Progress className="mb-2" value={videoProgress} />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={toggleVideoPlay}
                >
                  {isPlayingVideo ? <MinusCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-white mr-2">
                  {Math.floor(videoProgress / 100 * 120)}s / 120s
                </span>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Channel Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {broadcastChannels.map(channel => (
            <Button 
              key={channel.id}
              variant={selectedChannel === channel.id ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center py-2"
              onClick={() => {
                setSelectedChannel(channel.id);
                setVideoProgress(0);
                setIsPlayingVideo(true);
              }}
            >
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src={channel.logoSrc} />
                <AvatarFallback>{channel.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{channel.name}</span>
            </Button>
          ))}
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