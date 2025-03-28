import { useState, useCallback } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup
} from 'react-simple-maps';

// World map from react-simple-maps
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

// Simplified version of world map for the hero section background
export default function HeroWorldMap() {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  
  // Handle zooming and panning (just for animation, not interactivity)
  const handleMoveEnd = useCallback((position: any) => {
    setPosition(position);
  }, []);

  // Function to generate a very subtle color for countries in the background
  const getCountryColor = () => {
    // Return a very subtle blue shade
    return "hsl(215, 25%, 20%)";
  };

  // For background use, make a simpler version without markers or interactivity
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
          maxZoom={1.5}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: getCountryColor(),
                      stroke: "#191F28",
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    hover: {
                      fill: getCountryColor(),
                      stroke: "#191F28",
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    pressed: {
                      fill: getCountryColor(),
                      stroke: "#191F28",
                      strokeWidth: 0.5,
                      outline: "none"
                    }
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}