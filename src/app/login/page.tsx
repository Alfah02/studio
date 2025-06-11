
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSip } from "@/contexts/SipContext";
import type { SipConfig } from "@/lib/sip/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/custom/Logo";
import { useToast } from "@/hooks/use-toast";
import { Wifi, WifiOff, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { connectSip, connectionStatus, sipConfig: currentSipConfig } = useSip();

  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipServerUri, setSipServerUri] = useState(""); // e.g., wss://asterisk.example.com:8089/ws
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (connectionStatus === "registered") {
      router.push("/calls");
    }
  }, [connectionStatus, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sipUsername || !sipServerUri) {
      toast({
        title: "Champs Requis Manquants",
        description: "Le nom d'utilisateur SIP et l'URI du serveur SIP sont requis.",
        variant: "destructive",
      });
      return;
    }
    if (!sipServerUri.startsWith("wss://") && !sipServerUri.startsWith("ws://")) {
        toast({
            title: "Format d'URI Invalide",
            description: "L'URI du serveur SIP doit commencer par wss:// ou ws://.",
            variant: "destructive",
        });
        return;
    }

    setIsConnecting(true);
    const newConfig: SipConfig = {
      username: sipUsername,
      password: sipPassword,
      server: sipServerUri,
      uri: `sip:${sipUsername}@${new URL(sipServerUri).hostname}`, // Auto-generate URI
    };

    try {
      await connectSip(newConfig);
      // useEffect will handle redirect on status change
    } catch (error) {
      toast({
        title: "Échec de la Connexion SIP",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { text: "Connexion en cours...", Icon: Loader2, color: "text-yellow-500 animate-spin" };
      case 'connected':
        return { text: "Connecté au serveur, enregistrement...", Icon: Wifi, color: "text-blue-500" };
      case 'registered':
        return { text: "Enregistré et prêt !", Icon: Wifi, color: "text-green-500" };
      case 'unregistered':
      case 'registration_failed':
        return { text: "Échec de l'enregistrement. Vérifiez vos identifiants/serveur.", Icon: WifiOff, color: "text-red-500" };
      case 'disconnected':
        return { text: "Déconnecté. Veuillez entrer vos identifiants.", Icon: WifiOff, color: "text-muted-foreground" };
      case 'error':
        return { text: "Erreur de connexion. Vérifiez l'URI du serveur et la console.", Icon: WifiOff, color: "text-destructive" };
      default:
        return { text: `Statut: ${connectionStatus}`, Icon: WifiOff, color: "text-muted-foreground" };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Connexion à VidApp Connect</CardTitle>
          <CardDescription className="text-center">
            Veuillez entrer vos identifiants SIP pour accéder à l'application.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sipUsername">Nom d'utilisateur SIP</Label>
              <Input
                id="sipUsername"
                type="text"
                placeholder="ex: 1001 ou votre_nom_utilisateur"
                value={sipUsername}
                onChange={(e) => setSipUsername(e.target.value)}
                required
                disabled={isConnecting || connectionStatus === 'registered'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sipPassword">Mot de passe SIP</Label>
              <Input
                id="sipPassword"
                type="password"
                placeholder="Votre mot de passe SIP"
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                disabled={isConnecting || connectionStatus === 'registered'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sipServerUri">URI du Serveur SIP (WebSocket)</Label>
              <Input
                id="sipServerUri"
                type="text"
                placeholder="wss://asterisk.example.com:8089/ws"
                value={sipServerUri}
                onChange={(e) => setSipServerUri(e.target.value)}
                required
                disabled={isConnecting || connectionStatus === 'registered'}
              />
            </div>
             {connectionStatus !== 'disconnected' && connectionStatus !== 'registered' && (
              <div className="flex items-center justify-center space-x-2 text-sm p-3 bg-muted/50 rounded-md">
                <statusDisplay.Icon className={`h-5 w-5 ${statusDisplay.color}`} />
                <span className={`${statusDisplay.color}`}>{statusDisplay.text}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isConnecting || connectionStatus === 'registered'}>
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {connectionStatus === 'registered' ? "Connecté" : "Se Connecter"}
            </Button>
          </CardFooter>
        </form>
      </Card>
       <p className="mt-8 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} VidApp Connect. Tous droits réservés.
        <br />
        Pour plus d'informations, visitez <a href="https://vidapp.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.com</a> ou <a href="https://vidapp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.org</a>.
      </p>
    </div>
  );
}
