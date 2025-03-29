import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX, Radio as RadioIcon, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export type RadioPlayerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RadioPlayer = ({ isOpen, onClose }: RadioPlayerProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsPlaying(!audioRef.current.muted);
    }
  };

  // Handle minimize/maximize
  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4 z-50' : 'inset-0 bg-black/50 flex items-center justify-center z-50'}`}>
      {isMinimized ? (
        // Minimized state
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 w-12 p-0 shadow-lg"
          onClick={handleMinimizeToggle}
        >
          <RadioIcon className="h-5 w-5" />
        </Button>
      ) : (
        // Expanded state
        <div className="relative max-w-sm w-full p-4">
          <Card className="bg-gradient-to-r from-slate-900 to-blue-800 text-white rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4">
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
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-blue-700/50"
                    onClick={handleMinimizeToggle}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-blue-700/50"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2 mt-4">
                <span className="text-sm text-blue-200">Volume</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-blue-700/50"
                  onClick={handleMuteToggle}
                >
                  {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              </div>

              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="mb-4"
              />

              <div className="flex items-center justify-center">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2" />
                <span className="text-xs text-blue-200">LIVE NOW</span>
              </div>

              <audio 
                ref={audioRef}
                autoPlay
                className="hidden"
                src="https://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;