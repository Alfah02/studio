
"use client";

import { PageTitle } from "@/components/custom/PageTitle";
import { DialPad } from "@/components/custom/DialPad";
import { CallControls } from "@/components/custom/CallControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { PhoneOutgoing, UserCircle2, ListX, Clock } from "lucide-react";
import { useState } from "react";

export default function CallsPage() {
  const { toast } = useToast();
  const [inCall, setInCall] = useState(false);
  const [dialedNumber, setDialedNumber] = useState('');

  const handleDial = (number: string) => {
    toast({
      title: "Dialing...",
      description: `Calling ${number}`,
    });
    setDialedNumber(number);
    // Simulate starting a call
    setTimeout(() => {
      setInCall(true);
      toast({
        title: "Call Connected",
        description: `Connected to ${number}`,
        variant: "default"
      });
    }, 2000);
  };

  const handleHangUp = () => {
    toast({
      title: "Call Ended",
      variant: "default",
    });
    setInCall(false);
    setDialedNumber('');
  };

  return (
    <div className="space-y-8">
      <PageTitle>Calls</PageTitle>

      {inCall ? (
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneOutgoing className="text-accent" />
              <span>Ongoing Call with {dialedNumber}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="Video call placeholder" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="video call"
                className="opacity-70"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-4">
                <UserCircle2 size={128} className="text-foreground/50 mb-4" />
                <p className="text-2xl font-semibold text-foreground">{dialedNumber}</p>
                <div className="flex items-center text-muted-foreground">
                  <Clock size={16} className="mr-1" />
                  <span>00:00:00</span> {/* Placeholder for call timer */}
                </div>
              </div>
            </div>
            <CallControls onHangUp={handleHangUp} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Start a New Call</CardTitle>
            </CardHeader>
            <CardContent>
              <DialPad onDial={handleDial} />
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Calls / Favorites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[200px] flex flex-col items-center justify-center text-center">
              <ListX size={48} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No recent calls to display.</p>
              <p className="text-sm text-muted-foreground">Your recent calls and favorite contacts will appear here.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
