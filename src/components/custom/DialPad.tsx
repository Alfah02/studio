
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Delete } from 'lucide-react';

interface DialPadProps {
  onDial: (number: string) => void;
  disabled?: boolean;
}

export function DialPad({ onDial, disabled = false }: DialPadProps) {
  const [number, setNumber] = useState('');

  const handleButtonClick = (digit: string) => {
    setNumber(prev => prev + digit);
  };

  const handleBackspace = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleDial = () => {
    if (number) {
      onDial(number);
    }
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#'
  ];

  return (
    <div className="w-full max-w-xs mx-auto space-y-4 p-4 bg-card rounded-lg shadow-lg">
      <div className="relative">
        <Input 
          type="text" 
          value={number} 
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Entrez numéro ou URI SIP" 
          className="text-center text-xl sm:text-2xl h-14 pr-10" 
          aria-label="Numéro à composer ou URI SIP"
          disabled={disabled}
        />
        {number && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10" onClick={handleBackspace} aria-label="Retour arrière" disabled={disabled}>
            <Delete className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((btn) => (
          <Button 
            key={btn} 
            variant="outline"
            className="text-xl sm:text-2xl h-16 transition-transform active:scale-95" 
            onClick={() => handleButtonClick(btn)}
            disabled={disabled}
          >
            {btn}
          </Button>
        ))}
      </div>
      <Button 
        className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90" 
        onClick={handleDial}
        disabled={!number || disabled}
      >
        Appeler
      </Button>
    </div>
  );
}
