
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
          title: "Échec de la Génération d'Image",
          description: `Impossible de charger une image pour : ${prompt}. Affichage d'un placeholder.`,
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
    if (imageState.error || (imageState.src === initialPlaceholder && !imageState.loading)) { 
      return (
         <div className="w-full h-[200px] sm:h-[220px] md:h-[250px] flex flex-col items-center justify-center bg-muted/50 rounded-md text-center p-4 mt-4">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Chargement de l'image échoué. Placeholder affiché.</p>
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
            <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M17 9L21 7V17L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="12" r="2" fill="currentColor"/>
          </svg>
          <h1 className="text-5xl md:text-6xl font-headline font-bold">
            <span className="text-accent">Vid</span><span className="text-foreground">App</span> <span className="text-muted-foreground">Connect</span>
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez des appels audio et vidéo fluides et de haute qualité. Connectez-vous avec n'importe qui, n'importe où.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mb-12 w-full">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center"><CheckCircle2 className="mr-2 text-accent"/> Appels d'une Clarté Exceptionnelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Profitez d'une communication audio et vidéo fiable grâce à la technologie SIP avec Asterisk.</p>
            {renderImage(videoCallImage, "Illustration d'un appel vidéo", "video call")}
          </CardContent>
        </Card>
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center"><CheckCircle2 className="mr-2 text-accent"/> Restez Organisé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Gérez vos contacts et suivez votre historique d'appels, le tout dans une interface intuitive.</p>
             {renderImage(contactListImage, "Illustration de la gestion des contacts", "contact list")}
          </CardContent>
        </Card>
      </div>

      <Link href="/calls" passHref>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
          Commencer <ArrowRightCircle className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>

      <p className="mt-12 text-sm text-muted-foreground">
        Pour plus d'informations, visitez <a href="https://vidapp.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.com</a> ou <a href="https://vidapp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.org</a>.
      </p>
    </div>
  );
}
