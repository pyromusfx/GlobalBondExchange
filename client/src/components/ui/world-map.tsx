import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup, 
  Marker 
} from 'react-simple-maps';
import { useLocation } from "wouter";
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountryShare } from '@shared/schema';

// World map from react-simple-maps
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface WorldMapProps {
  colorBy: 'region' | 'performance' | 'volume';
}

export default function WorldMap({ colorBy }: WorldMapProps) {
  const [, navigate] = useLocation();
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const { data: countries } = useQuery<CountryShare[]>({
    queryKey: ['/api/countries'],
  });
  
  // Performance colors based on price change
  const getPerformanceColor = (countryCode: string) => {
    if (!countries) return "hsl(215, 25%, 27%)"; // Default background color
    
    const country = countries.find(c => c.countryCode === countryCode);
    if (!country) return "hsl(215, 25%, 27%)";
    
    const currentPrice = parseFloat(country.currentPrice || "0");
    const previousPrice = parseFloat(country.previousPrice || "0");
    
    if (currentPrice > previousPrice) {
      const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      // Green gradient based on positive change
      if (percentChange > 5) return "hsl(151, 82%, 41%)"; // Strong green
      if (percentChange > 2) return "hsl(151, 82%, 36%)"; // Medium green
      return "hsl(151, 82%, 30%)"; // Light green
    } else if (currentPrice < previousPrice) {
      const percentChange = ((previousPrice - currentPrice) / previousPrice) * 100;
      // Red gradient based on negative change
      if (percentChange > 5) return "hsl(358, 75%, 59%)"; // Strong red
      if (percentChange > 2) return "hsl(358, 75%, 52%)"; // Medium red
      return "hsl(358, 75%, 45%)"; // Light red
    }
    
    return "hsl(215, 25%, 27%)"; // No change
  };
  
  // Region-based colors
  const getRegionColor = (countryCode: string) => {
    const regionColors: { [key: string]: string } = {
      "North America": "hsl(200, 70%, 40%)",
      "South America": "hsl(150, 70%, 40%)",
      "Europe": "hsl(230, 70%, 50%)",
      "Asia": "hsl(0, 70%, 50%)",
      "Middle East": "hsl(30, 70%, 50%)",
      "Africa": "hsl(60, 70%, 50%)",
      "Oceania": "hsl(270, 70%, 50%)"
    };
    
    // Determine region from country code
    const regions: { [key: string]: string[] } = {
      "North America": ["US", "CA", "MX"],
      "South America": ["BR", "AR", "CL", "CO", "PE"],
      "Europe": ["GB", "DE", "FR", "IT", "ES", "RU"],
      "Asia": ["CN", "JP", "IN", "KR", "ID"],
      "Middle East": ["SA", "AE", "TR", "IL", "IR"],
      "Africa": ["ZA", "NG", "EG", "KE", "MA"],
      "Oceania": ["AU", "NZ", "PG", "FJ"]
    };
    
    for (const [region, codes] of Object.entries(regions)) {
      if (codes.includes(countryCode)) {
        return regionColors[region];
      }
    }
    
    return "hsl(215, 25%, 27%)"; // Default
  };
  
  // Volume-based colors
  const getVolumeColor = (countryCode: string) => {
    if (!countries) return "hsl(215, 25%, 27%)";
    
    const country = countries.find(c => c.countryCode === countryCode);
    if (!country) return "hsl(215, 25%, 27%)";
    
    // Use pre-sale progress as a proxy for volume in this demo
    const progress = parseFloat(country.preSaleProgress || "0");
    
    if (progress > 0.7) return "hsl(270, 70%, 50%)"; // High volume
    if (progress > 0.4) return "hsl(200, 70%, 50%)"; // Medium volume
    if (progress > 0.1) return "hsl(150, 70%, 40%)"; // Low volume
    
    return "hsl(215, 25%, 30%)"; // Very low volume
  };
  
  // Get color based on selected mode
  const getCountryColor = (countryCode: string) => {
    switch (colorBy) {
      case 'performance':
        return getPerformanceColor(countryCode);
      case 'volume':
        return getVolumeColor(countryCode);
      case 'region':
      default:
        return getRegionColor(countryCode);
    }
  };
  
  // Generate tooltip content
  const getTooltipContent = (countryCode: string) => {
    if (!countries) return "";
    
    const country = countries.find(c => c.countryCode === countryCode);
    if (!country) return countryCode;
    
    const price = parseFloat(country.currentPrice || "0").toFixed(3);
    const previousPrice = parseFloat(country.previousPrice || "0").toFixed(3);
    const change = ((parseFloat(country.currentPrice || "0") - parseFloat(country.previousPrice || "0")) / 
                   (parseFloat(country.previousPrice || "1")) * 100).toFixed(2);
    const direction = parseFloat(change) >= 0 ? "+" : "";
    
    return `${country.countryName} (${country.countryCode})
Price: $${price}
Change: ${direction}${change}%`;
  };
  
  const handleCountryClick = (countryCode: string) => {
    if (!countries) return;
    
    const country = countries.find(c => c.countryCode === countryCode);
    if (country) {
      navigate(`/trade/${country.countryCode}`);
    }
  };

  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [0, 0], zoom: 1 });
  
  // Handle zooming and panning
  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);
  
  // Hot spots to highlight major financial centers
  const financialCenters: { name: string; coordinates: [number, number]; size: number }[] = [
    { name: "New York", coordinates: [-74.0059, 40.7128], size: 8 },
    { name: "London", coordinates: [-0.1278, 51.5074], size: 8 },
    { name: "Tokyo", coordinates: [139.6917, 35.6895], size: 8 },
    { name: "Hong Kong", coordinates: [114.1694, 22.3193], size: 8 },
    { name: "Singapore", coordinates: [103.8198, 1.3521], size: 8 },
    { name: "Shanghai", coordinates: [121.4737, 31.2304], size: 8 }
  ];

  return (
    <div className="w-full h-full">
      <TooltipProvider>
        <ComposableMap
          projection="geoMercator"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={8}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const countryCode = geo.properties.iso_a2 || "";
                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          onMouseEnter={() => {
                            setHoveredCountry(countryCode);
                            setTooltipContent(getTooltipContent(countryCode));
                          }}
                          onMouseLeave={() => {
                            setHoveredCountry(null);
                            setTooltipContent(null);
                          }}
                          onClick={() => handleCountryClick(countryCode)}
                          style={{
                            default: {
                              fill: getCountryColor(countryCode),
                              stroke: "#212B36",
                              strokeWidth: 0.5,
                              outline: "none"
                            },
                            hover: {
                              fill: "hsl(45, 93%, 47%)",
                              stroke: "#212B36",
                              strokeWidth: 0.5,
                              outline: "none",
                              cursor: "pointer"
                            },
                            pressed: {
                              fill: "hsl(45, 93%, 40%)",
                              stroke: "#212B36",
                              strokeWidth: 0.5,
                              outline: "none"
                            }
                          }}
                        />
                      </TooltipTrigger>
                      {hoveredCountry === countryCode && tooltipContent && (
                        <TooltipContent>
                          <div className="whitespace-pre-line text-sm">
                            {tooltipContent}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })
              }
            </Geographies>
            
            {/* Financial centers markers */}
            {financialCenters.map(({ name, coordinates, size }) => (
              <Marker key={name} coordinates={coordinates}>
                <circle r={size / position.zoom} fill="rgba(255, 215, 0, 0.8)" stroke="#fff" strokeWidth={1} />
                {position.zoom > 2 && (
                  <text
                    textAnchor="middle"
                    y={position.zoom > 4 ? -15 : -10}
                    style={{ 
                      fontFamily: "system-ui", 
                      fill: "#fff", 
                      fontSize: 10 / (position.zoom > 4 ? 1 : position.zoom), 
                      fontWeight: "bold",
                      textShadow: "0px 0px 3px #000" 
                    }}
                  >
                    {name}
                  </text>
                )}
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </TooltipProvider>
      
      <div className="absolute bottom-2 left-2 bg-secondary bg-opacity-80 p-2 rounded-md text-xs">
        <div>
          <span className="font-bold">Zoom:</span> {Math.round(position.zoom * 100) / 100}x
        </div>
        <div>
          <span className="font-bold">Click:</span> See Country Details
        </div>
        <div>
          <span className="font-bold">Drag:</span> Pan Map
        </div>
        <div>
          <span className="font-bold">Wheel:</span> Zoom In/Out
        </div>
      </div>
    </div>
  );
}
