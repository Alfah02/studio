
"use client";

import { PageTitle } from "@/components/custom/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Volume2, Video, LogOut, Save, ExternalLink, Mic, BellRing, BellMinus, ShieldAlert, Info, Copyright, Cog, LifeBuoy, FileText, PhoneCall, KeyRound, UserCheck, Router, Server, Wifi, WifiOff, Link as LinkIcon, Unlink, AlertCircle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSip } from "@/contexts/SipContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { disconnectSip, connectionStatus, sipConfig } = useSip();

  const handleSaveChanges = (section: string) => {
    toast({
      title: "Paramètres Enregistrés",
      description: `Les paramètres de ${section} ont été mis à jour. (Simulé)`,
    });
  };

  const handleDisconnectAndLogin = () => {
    disconnectSip();
    router.push('/login');
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return { text: "Déconnecté", Icon: WifiOff, color: "text-red-500" };
      case 'connecting':
        return { text: "Connexion en cours...", Icon: Wifi, color: "text-yellow-500 animate-pulse" };
      case 'connected':
        return { text: "Connecté (Enregistrement...)", Icon: Wifi, color: "text-blue-500" };
      case 'registered':
        return { text: "Enregistré", Icon: Wifi, color: "text-green-500" };
      case 'unregistered':
        return { text: "Désenregistré", Icon: WifiOff, color: "text-red-500" };
      case 'registration_failed':
        return { text: "Échec de l'enregistrement", Icon: WifiOff, color: "text-red-600" };
      case 'error':
        return { text: "Erreur", Icon: WifiOff, color: "text-destructive" };
      default:
        return { text: "Inconnu", Icon: WifiOff, color: "text-muted-foreground" };
    }
  };

  const { text: statusText, Icon: StatusIcon, color: statusColor } = getConnectionStatusText();
  
  return (
    <div className="space-y-8">
      <PageTitle>Paramètres</PageTitle>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2 text-primary" /> Compte</CardTitle>
            <CardDescription>Gérez les détails de votre compte VidApp Connect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Nom d'Affichage</Label>
              <Input id="displayName" defaultValue="Votre Nom" />
            </div>
            <div>
              <Label htmlFor="sipAddress">Adresse SIP Actuelle</Label>
              <Input id="sipAddress" value={sipConfig && connectionStatus === 'registered' ? sipConfig.uri : "Non connecté"} disabled />
            </div>
             <a href="https://vidapp.com/account" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full"><ExternalLink className="mr-2 h-4 w-4" /> Gérer le Compte sur vidapp.com</Button>
            </a>
            <Button onClick={() => handleSaveChanges("Compte")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Enregistrer les Modifications du Compte
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PhoneCall className="mr-2 text-primary" /> Configuration SIP</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Statut : <StatusIcon className={`mr-1 h-4 w-4 ${statusColor}`} /> <span className={statusColor}>{statusText}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionStatus === 'registered' && sipConfig ? (
              <>
                <div className="space-y-1">
                    <p className="text-sm font-medium">Nom d'utilisateur SIP:</p>
                    <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{sipConfig.username}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">Serveur SIP:</p>
                    <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{sipConfig.server}</p>
                </div>
                <Button onClick={disconnectSip} className="w-full bg-red-600 hover:bg-red-700 text-white" variant="destructive">
                  <Unlink className="mr-2 h-4 w-4" /> Se Déconnecter du SIP
                </Button>
                 <Button onClick={handleDisconnectAndLogin} className="w-full" variant="outline">
                  <LogIn className="mr-2 h-4 w-4" /> Changer d'Identifiants SIP
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-md">
                <AlertCircle className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Vous n'êtes actuellement pas connecté au service SIP.
                </p>
                <Button onClick={() => router.push('/login')} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <LinkIcon className="mr-2 h-4 w-4" /> Aller à la Page de Connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Volume2 className="mr-2 text-primary" /> Audio & Vidéo</CardTitle>
            <CardDescription>Configurez votre microphone, haut-parleurs et caméra.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="micSelect" className="flex items-center"><Mic className="mr-2 h-4 w-4 text-muted-foreground" />Microphone</Label>
              <Select defaultValue="default">
                <SelectTrigger id="micSelect">
                  <SelectValue placeholder="Sélectionner un Microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Microphone Système par Défaut</SelectItem>
                  <SelectItem value="mic1">Micro USB Externe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="speakerSelect" className="flex items-center"><Volume2 className="mr-2 h-4 w-4 text-muted-foreground" />Haut-parleurs</Label>
              <Select defaultValue="default">
                <SelectTrigger id="speakerSelect">
                  <SelectValue placeholder="Sélectionner des Haut-parleurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Haut-parleurs Système par Défaut</SelectItem>
                  <SelectItem value="speaker1">Écouteurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cameraSelect" className="flex items-center"><Video className="mr-2 h-4 w-4 text-muted-foreground" />Caméra</Label>
              <Select defaultValue="default">
                <SelectTrigger id="cameraSelect">
                  <SelectValue placeholder="Sélectionner une Caméra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Caméra Système par Défaut</SelectItem>
                  <SelectItem value="cam1">Webcam Intégrée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSaveChanges("Audio & Vidéo")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Enregistrer les Paramètres des Périphériques
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-2 text-primary" /> Notifications</CardTitle>
            <CardDescription>Gérez la manière dont vous recevez les alertes de VidApp Connect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="incomingCallNotifs" className="flex-grow flex items-center">
                <BellRing className="mr-2 h-4 w-4 text-muted-foreground" /> Notifications d'Appel Entrant
              </Label>
              <Switch id="incomingCallNotifs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="missedCallNotifs" className="flex-grow flex items-center">
                <BellMinus className="mr-2 h-4 w-4 text-muted-foreground" /> Résumés d'Appels Manqués
              </Label>
              <Switch id="missedCallNotifs" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="soundNotifs" className="flex-grow flex items-center">
                <Volume2 className="mr-2 h-4 w-4 text-muted-foreground" /> Sons des Notifications
              </Label>
              <Switch id="soundNotifs" defaultChecked />
            </div>
            <Button onClick={() => handleSaveChanges("Notifications")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Enregistrer les Préférences de Notification
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2 text-primary" /> Confidentialité & Sécurité</CardTitle>
            <CardDescription>Contrôlez votre confidentialité et la sécurité de l'application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="blockUnknown" className="flex-grow flex items-center">
                <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" /> Bloquer les appels de numéros inconnus
              </Label>
              <Switch id="blockUnknown" />
            </div>
            <div>
                <a href="https://vidapp.org/privacy" target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="p-0 h-auto flex items-center"><ExternalLink className="mr-1 h-3 w-3" />Voir la Politique de Confidentialité sur vidapp.org</Button>
                </a>
            </div>
             <Button onClick={() => handleSaveChanges("Confidentialité")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> Enregistrer les Paramètres de Confidentialité
             </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 text-primary"/>À Propos de VidApp Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> Version : 1.0.0 (Alpha)</p>
            <p className="flex items-center"><Copyright className="mr-2 h-4 w-4 text-muted-foreground" /> &copy; {new Date().getFullYear()} VidApp. Tous droits réservés.</p>
            <p className="flex items-center"><Cog className="mr-2 h-4 w-4 text-muted-foreground" /> Propulsé par les technologies SIP et Asterisk.</p>
            <Separator className="my-3"/>
            <a href="https://vidapp.com/support" target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full"><LifeBuoy className="mr-2 h-4 w-4" />Obtenir de l'Aide</Button>
            </a>
             <a href="https://vidapp.org/terms" target="_blank" rel="noopener noreferrer" className="block mt-2">
              <Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" />Conditions d'Utilisation</Button>
            </a>
          </CardContent>
        </Card>

         <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><LogOut className="mr-2 text-destructive" /> Déconnexion Générale</CardTitle>
            <CardDescription>Déconnectez-vous de votre compte VidApp Connect et du service SIP.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={() => {
                disconnectSip(); 
                router.push('/login');
                toast({title: "Déconnecté", description: "Vous avez été déconnecté avec succès."});
            }}>
              <LogOut className="mr-2 h-4 w-4" /> Se Déconnecter de Partout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
