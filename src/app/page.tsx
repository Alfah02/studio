
"use client"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react"; 
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow'; 
import { useToast } from "@/hooks/use-toast";

interface AiImageState {
  src: string;
  loading: boolean;
  error: boolean;
}

export default function HomePage() {
  const { toast } = useToast();
  const initialPlaceholder = "https://placehold.co/600x400.png";

  const [videoCallImage, setVideoCallImage] = useState<AiImageState>({ src: initialPlaceholder, loading: true, error: false });
  const [contactListImage, setContactListImage] = useState<AiImageState>({ src: initialPlaceholder, loading: true, error: false });

  useEffect(() => {
    const fetchImage = async (prompt: string, setImageState: React.Dispatch<React.SetStateAction<AiImageState>>) => {
      try {
        // Keep showing placeholder while loading new image
        setImageState(prev => ({ ...prev, loading: true, error: false })); 
        const result: GenerateImageOutput = await generateImage({ prompt });
        if (result.imageDataUri) {
          setImageState({ src: result.imageDataUri, loading: false, error: false });
        } else {
          throw new Error("Image data URI is empty");
        }
      } catch (err) {
        console.error(`Failed to generate image for prompt "${prompt}":`, err);
        setImageState({ src: initialPlaceholder, loading: false, error: true });
        toast({
          title: "Image Generation Failed",
          description: `Could not load an image for: ${prompt}. Displaying placeholder.`,
          variant: "destructive",
        });
      }
    };

    fetchImage("crystal clear video call interface for a modern communication app, showcasing clarity and connection", setVideoCallImage);
    fetchImage("well-organized digital contact list or address book in a clean, user-friendly app UI, conveying efficiency", setContactListImage);
  }, [toast]);

  const renderImage = (imageState: AiImageState, altText: string, dataAiHint: string) => {
    if (imageState.loading) {
      return (
        <div className="w-full h-[200px] sm:h-[220px] md:h-[250px] flex items-center justify-center bg-muted/50 rounded-md mt-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }
    // Show placeholder on error or if src is still the initial placeholder after attempting to load
    if (imageState.error || (imageState.src === initialPlaceholder && !imageState.loading)) { 
      return (
         <div className="w-full h-[200px] sm:h-[220px] md:h-[250px] flex flex-col items-center justify-center bg-muted/50 rounded-md text-center p-4 mt-4">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Image loading failed. Placeholder shown.</p>
        </div>
      );
    }
    return (
      <Image 
        src={imageState.src} 
        alt={altText} 
        width={600} 
        height={400} 
        className="rounded-md mt-4 object-cover w-full h-auto max-h-[250px]"
        data-ai-hint={dataAiHint}
        priority={false} 
      />
    );
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/20 p-4 sm:p-8 text-center">
      <header className="mb-12">
        <div className="inline-flex items-center space-x-3 mb-4">
           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
            <path d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20H8C5.79086 20 4 18.2091 4 16V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-5xl md:text-6xl font-headline font-bold">
            <span className="text-accent">Vid</span><span className="text-foreground">App</span> <span className="text-muted-foreground">Connect</span>
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience seamless, high-quality audio and video calls. Connect with anyone, anywhere.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mb-12 w-full">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center"><CheckCircle2 className="mr-2 text-accent"/> Crystal Clear Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Enjoy reliable audio and video communication powered by SIP with Asterisk technology.</p>
            {renderImage(videoCallImage, "Video call illustration", "video call")}
          </CardContent>
        </Card>
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center"><CheckCircle2 className="mr-2 text-accent"/> Stay Organized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your contacts and keep track of your call history, all in one intuitive interface.</p>
             {renderImage(contactListImage, "Contact management illustration", "contact list")}
          </CardContent>
        </Card>
      </div>

      <Link href="/calls" passHref>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
          Get Started <ArrowRightCircle className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>

      <p className="mt-12 text-sm text-muted-foreground">
        For more information, visit <a href="https://vidapp.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.com</a> or <a href="https://vidapp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.org</a>.
      </p>
    </div>
  );
}
