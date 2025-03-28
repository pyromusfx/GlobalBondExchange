import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup
} from 'react-simple-maps';

// World map from react-simple-maps
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

// Map ISO3 country codes to ISO2 for our database
function mapISO3toISO2(iso3Code: string): string {
  const iso3ToIso2Map: Record<string, string> = {
    USA: "US", GBR: "GB", CAN: "CA", AUS: "AU", DEU: "DE", 
    FRA: "FR", JPN: "JP", CHN: "CN", ITA: "IT", ESP: "ES",
    RUS: "RU", BRA: "BR", IND: "IN", MEX: "MX", ZAF: "ZA",
    NLD: "NL", CHE: "CH", SWE: "SE", NOR: "NO", DNK: "DK",
    FIN: "FI", IRL: "IE", NZL: "NZ", SGP: "SG", AUT: "AT",
    BEL: "BE", ARG: "AR", CHL: "CL", COL: "CO", EGY: "EG",
    GRC: "GR", HKG: "HK", IDN: "ID", ISR: "IL", KOR: "KR",
    MYS: "MY", PER: "PE", PHL: "PH", POL: "PL", PRT: "PT",
    SAU: "SA", THA: "TH", TUR: "TR", UKR: "UA", VNM: "VN",
    ZWE: "ZW", ARE: "AE", BGD: "BD", PAK: "PK", NGA: "NG",
    KEN: "KE", MAR: "MA", TUN: "TN", GHA: "GH", AGO: "AO",
    // Add more mappings as needed
  };
  
  return iso3ToIso2Map[iso3Code] || "";
}

// Simplified version of world map for the hero section background
export default function HeroWorldMap() {
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1
  });
  
  const [, navigate] = useLocation();
  
  // Handle zooming and panning (just for animation, not interactivity)
  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);

  // Function to generate color for countries in the background
  const getCountryColor = () => {
    // Return a subtle blue shade
    return "hsl(215, 25%, 20%)";
  };
  
  // Handle country click
  const handleCountryClick = (countryCode: string) => {
    if (countryCode && countryCode.length > 0) {
      navigate(`/trade/${countryCode}`);
    }
  };

  // For background use, but still interactive for country clicks
  return (
    <div className="w-full h-full">
      <ComposableMap
        projection="geoMercator"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={2}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                // Get the country code from properties
                const countryCode = geo.properties.iso_a2 || 
                                   geo.properties.ISO_A2 || 
                                   (geo.properties.iso_a3 ? mapISO3toISO2(geo.properties.iso_a3) : "");
                
                return (
                  <Geography
                    key={geo.rsmKey || geo.id}
                    geography={geo}
                    onClick={() => handleCountryClick(countryCode)}
                    style={{
                      default: {
                        fill: getCountryColor(),
                        stroke: "#191F28",
                        strokeWidth: 0.5,
                        outline: "none"
                      },
                      hover: {
                        fill: "hsl(45, 93%, 47%)", // Gold color on hover
                        stroke: "#191F28",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "hsl(45, 93%, 40%)",
                        stroke: "#191F28",
                        strokeWidth: 0.5,
                        outline: "none"
                      }
                    }}
                  />
              })}
            
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}