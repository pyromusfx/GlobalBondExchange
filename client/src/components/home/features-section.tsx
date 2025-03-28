import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FaChartLine, FaRocket, FaShieldAlt, FaStar, FaInfoCircle, FaWikipediaW } from "react-icons/fa";
import CandlestickChart from "@/components/ui/chart";

export default function FeaturesSection() {
  // Generate demo chart data
  const demoChartData = [];
  let currentDate = new Date();
  let price = 0.695;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(currentDate.getDate() - i);
    
    const volatility = 0.02; // 2% max move
    const change = price * volatility * (Math.random() - 0.5);
    const open = price;
    const close = price + change;
    price = close;
    
    const high = Math.max(open, close) + price * 0.01 * Math.random();
    const low = Math.min(open, close) - price * 0.01 * Math.random();
    
    demoChartData.push({
      time: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
    });
  }

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Advanced Trading Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-card rounded-full p-6 inline-block mb-6">
              <FaChartLine className="text-4xl text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Professional Charts</h3>
            <p className="text-muted-foreground">
              Advanced candlestick charts with multiple timeframes and technical indicators.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-card rounded-full p-6 inline-block mb-6">
              <FaRocket className="text-4xl text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Leverage Trading</h3>
            <p className="text-muted-foreground">
              Trade with up to 50x leverage to maximize your profit potential across all markets.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-card rounded-full p-6 inline-block mb-6">
              <FaShieldAlt className="text-4xl text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure KYC</h3>
            <p className="text-muted-foreground">
              Quick and secure KYC verification process to get started with trading in minutes.
            </p>
          </div>
        </div>
        
        {/* Trading Platform Preview */}
        <div className="mt-16 relative">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center">
                <img 
                  src="https://flagcdn.com/w40/jp.png" 
                  alt="Japan Flag" 
                  className="w-8 h-auto mr-3"
                />
                <div>
                  <div className="font-medium text-lg">Japan (JPN)</div>
                  <div className="flex items-center">
                    <span className="font-mono font-medium">$0.695</span>
                    <span className="text-red-500 text-sm ml-2">-1.23%</span>
                  </div>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Button variant="secondary" size="sm" className="bg-secondary">
                    <FaStar className="text-muted-foreground" />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-secondary">
                    <FaInfoCircle className="text-muted-foreground" />
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="bg-secondary flex items-center">
                    <a 
                      href="https://en.wikipedia.org/wiki/Japan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <FaWikipediaW className="mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">Wiki</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
              {/* Chart Area */}
              <div className="lg:col-span-3 border-r border-border p-1 h-[400px] lg:h-auto relative">
                <CandlestickChart data={demoChartData} height={400} />
                
                {/* Chart Controls */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <Button variant="secondary" size="sm" className="text-xs">15m</Button>
                  <Button size="sm" className="text-xs bg-primary text-secondary">1h</Button>
                  <Button variant="secondary" size="sm" className="text-xs">4h</Button>
                  <Button variant="secondary" size="sm" className="text-xs">1d</Button>
                  <Button variant="secondary" size="sm" className="text-xs">1w</Button>
                </div>
              </div>
              
              {/* Trading Panel */}
              <div>
                <div className="border-b border-border p-2">
                  <div className="flex space-x-1">
                    <Button variant="secondary" className="flex-1">Spot</Button>
                    <Button className="flex-1 bg-primary text-secondary">Leverage</Button>
                  </div>
                </div>
                
                {/* Leverage Options */}
                <div className="p-4 border-b border-border">
                  <div className="text-xs text-muted-foreground mb-2">Leverage</div>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="secondary" size="sm" className="py-1 px-1 text-xs">3x</Button>
                    <Button className="py-1 px-1 text-xs bg-primary text-secondary">10x</Button>
                    <Button variant="secondary" size="sm" className="py-1 px-1 text-xs">20x</Button>
                    <Button variant="secondary" size="sm" className="py-1 px-1 text-xs">50x</Button>
                  </div>
                </div>
                
                {/* Trading Form */}
                <div className="p-4">
                  <div className="flex space-x-1 mb-4">
                    <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">Buy</Button>
                    <Button variant="ghost" className="flex-1 text-muted-foreground">Sell</Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Price (USD)</div>
                      <input 
                        type="text" 
                        value="0.695" 
                        className="w-full bg-secondary p-2 rounded text-right font-mono" 
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Amount (JPN)</div>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-secondary p-2 rounded text-right font-mono" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="secondary" size="sm" className="text-xs">25%</Button>
                      <Button variant="secondary" size="sm" className="text-xs">50%</Button>
                      <Button variant="secondary" size="sm" className="text-xs">75%</Button>
                      <Button variant="secondary" size="sm" className="text-xs">Max</Button>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total (USD)</div>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-secondary p-2 rounded text-right font-mono" 
                        readOnly
                      />
                    </div>
                    
                    <Link href="/trade/JP">
                      <Button className="w-full bg-green-500 hover:bg-green-600 mt-4">
                        Buy JPN
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
