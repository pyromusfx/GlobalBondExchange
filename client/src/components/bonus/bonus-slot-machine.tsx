import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FaGlobe } from 'react-icons/fa';

interface BonusSlotMachineProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
}

// Sample country codes for slot machine animation
const sampleCountryCodes = ['US', 'GB', 'FR', 'DE', 'JP', 'CN', 'RU', 'BR', 'IN', 'AU', 'CA', 'IT', 'ES', 'TR', 'ZA'];

export default function BonusSlotMachine({ isSpinning, onSpinComplete }: BonusSlotMachineProps) {
  const [reels, setReels] = useState<string[]>(['?', '?', '?']);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spinCountRef = useRef<number>(0);
  const maxSpins = 20; // Number of spins before stopping

  // Start or stop the spinning based on isSpinning prop
  useEffect(() => {
    if (isSpinning) {
      startSpinning();
    } else {
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
      }
      spinCountRef.current = 0;
    }

    return () => {
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    };
  }, [isSpinning]);

  const startSpinning = () => {
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
    }

    spinCountRef.current = 0;
    
    // Start the spinning animation
    spinTimerRef.current = setInterval(() => {
      spinCountRef.current += 1;
      
      // Update each reel with a random country code
      setReels([
        sampleCountryCodes[Math.floor(Math.random() * sampleCountryCodes.length)],
        sampleCountryCodes[Math.floor(Math.random() * sampleCountryCodes.length)],
        sampleCountryCodes[Math.floor(Math.random() * sampleCountryCodes.length)]
      ]);

      // Stop after maxSpins iterations
      if (spinCountRef.current >= maxSpins && !isSpinning) {
        if (spinTimerRef.current) {
          clearInterval(spinTimerRef.current);
          spinTimerRef.current = null;
        }
        onSpinComplete();
      }
    }, 100);
  };

  return (
    <div className="slot-machine-container">
      <div className="flex justify-center items-center gap-2">
        {reels.map((symbol, index) => (
          <Card 
            key={index} 
            className={`w-24 h-24 flex items-center justify-center ${isSpinning ? 'animate-pulse' : ''}`}
          >
            {isSpinning ? (
              <div className="text-3xl font-bold">
                <FaGlobe className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="text-3xl font-bold">{symbol}</div>
            )}
          </Card>
        ))}
      </div>
      {isSpinning && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
          Picking a random country...
        </div>
      )}
    </div>
  );
}