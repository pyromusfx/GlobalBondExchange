import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  id: number;
  countryCode: string | null;
  title: string;
  content: string;
  source: string | null;
  timestamp: Date | null;
}

export default function NewsTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(40);

  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['/api/news'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Adjust animation duration based on content length
  useEffect(() => {
    if (tickerRef.current && newsItems?.length) {
      const width = tickerRef.current.scrollWidth;
      // Hızı %50 artırmak için 50 yerine 75 kullanıyoruz (50 * 1.5 = 75)
      const duration = Math.max(26, width / 75); // 75px per second (50% daha hızlı)
      setAnimationDuration(duration);
    }
  }, [newsItems]);

  if (isLoading || !newsItems?.length) {
    return (
      <div className="bg-card border-t border-b border-border py-3 overflow-hidden relative">
        <div className="flex items-center justify-center h-6">
          <span className="text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-t border-b border-border py-3 overflow-hidden relative">
      <div className="flex items-center absolute left-4 top-0 bottom-0 z-10 bg-gradient-to-r from-card to-transparent pr-8">
        <div className="bg-primary text-secondary text-xs font-bold py-1 px-2 rounded mr-4">BREAKING</div>
      </div>
      
      <div 
        ref={tickerRef}
        className="whitespace-nowrap pl-36"
        style={{
          animation: `tickerScroll ${animationDuration}s linear infinite`
        }}
      >
        {newsItems.map((item) => (
          <span key={item.id} className="inline-block mr-8">
            {item.countryCode && (
              <span className="text-primary font-medium mr-2">{item.countryCode}:</span>
            )}
            {item.title}
            {item.source && (
              <span className="text-muted-foreground text-xs ml-2">({item.source})</span>
            )}
          </span>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tickerScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
