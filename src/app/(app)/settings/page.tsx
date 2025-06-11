
"use client";

import { PageTitle } from "@/components/custom/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Volume2, Video, LogOut, Save, ExternalLink, Mic, BellRing, BellMinus, ShieldAlert, Info, Copyright, Cog, LifeBuoy, FileText, PhoneCall, KeyRound, UserCheck, Router, Server, Wifi, WifiOff, Link as LinkIcon, Unlink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useSip } from "@/contexts/SipContext";
import type { SipConfig } from "@/lib/sip/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const { connectSip, disconnectSip, connectionStatus, sipConfig: currentSipConfig } = useSip();

  const [sipUsername, setSipUsername] = useState(currentSipConfig?.username || '');
  const [sipPassword, setSipPassword] = useState(currentSipConfig?.password || '');
  const [sipServerUri, setSipServerUri] = useState(currentSipConfig?.server || '');
  
  useEffect(() => {
    if (currentSipConfig) {
      setSipUsername(currentSipConfig.username);
      setSipPassword(currentSipConfig.password || '');
      setSipServerUri(currentSipConfig.server);
    }
  }, [currentSipConfig]);


  const handleSaveChanges = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated. (Simulated)`,
    });
  };

  const handleSaveSipConfig = async () => {
    if (!sipUsername || !sipServerUri) {
      toast({
        title: "SIP Configuration Error",
        description: "SIP Username and Server URI are required.",
        variant: "destructive",
      });
      return;
    }

    const newConfig: SipConfig = {
      username: sipUsername,
      password: sipPassword,
      server: sipServerUri,
      uri: `sip:${sipUsername}@${sipServerUri.includes('://') ? new URL(sipServerUri).hostname : sipServerUri.split(':')[0]}` // Construct a basic URI
    };

    try {
      await connectSip(newConfig);
      // Connection status will be updated by SipContext and displayed via `connectionStatusText`
    } catch (error) {
      toast({
        title: "SIP Connection Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectSip = () => {
    disconnectSip();
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return { text: "Disconnected", Icon: WifiOff, color: "text-red-500" };
      case 'connecting':
        return { text: "Connecting...", Icon: Wifi, color: "text-yellow-500 animate-pulse" };
      case 'connected':
        return { text: "Connected (Registering...)", Icon: Wifi, color: "text-blue-500" };
      case 'registered':
        return { text: "Registered", Icon: Wifi, color: "text-green-500" };
      case 'unregistered':
        return { text: "Unregistered", Icon: WifiOff, color: "text-red-500" };
      case 'registration_failed':
        return { text: "Registration Failed", Icon: WifiOff, color: "text-red-600" };
      case 'error':
        return { text: "Error", Icon: WifiOff, color: "text-destructive" };
      default:
        return { text: "Unknown", Icon: WifiOff, color: "text-muted-foreground" };
    }
  };

  const { text: statusText, Icon: StatusIcon, color: statusColor } = getConnectionStatusText();
  
  return (
    <div className="space-y-8">
      <PageTitle>Settings</PageTitle>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2 text-primary" /> Account</CardTitle>
            <CardDescription>Manage your VidApp Connect account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" defaultValue="Your Name" />
            </div>
            <div>
              <Label htmlFor="sipAddress">SIP Address (from server)</Label>
              <Input id="sipAddress" defaultValue={currentSipConfig ? currentSipConfig.uri : "N/A"} disabled />
            </div>
             <a href="https://vidapp.com/account" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full"><ExternalLink className="mr-2 h-4 w-4" /> Manage Account on vidapp.com</Button>
            </a>
            <Button onClick={() => handleSaveChanges("Account")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Account Changes
            </Button>
          </CardContent>
        </Card>

        {/* SIP Configuration Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PhoneCall className="mr-2 text-primary" /> SIP Configuration</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Status: <StatusIcon className={`mr-1 h-4 w-4 ${statusColor}`} /> <span className={statusColor}>{statusText}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sipUsername" className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />SIP Username</Label>
              <Input 
                id="sipUsername" 
                placeholder="e.g., 1001 or your_user" 
                value={sipUsername}
                onChange={(e) => setSipUsername(e.target.value)}
                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected' || connectionStatus === 'registered'}
              />
            </div>
            <div>
              <Label htmlFor="sipPassword" className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />SIP Password</Label>
              <Input 
                id="sipPassword" 
                type="password"
                placeholder="Your SIP password" 
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected' || connectionStatus === 'registered'}
              />
            </div>
            <div>
              <Label htmlFor="sipServerUri" className="flex items-center"><Server className="mr-2 h-4 w-4 text-muted-foreground" />SIP Server URI (WebSocket)</Label>
              <Input 
                id="sipServerUri" 
                placeholder="wss://asterisk.example.com:8089/ws" 
                value={sipServerUri}
                onChange={(e) => setSipServerUri(e.target.value)}
                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected' || connectionStatus === 'registered'}
              />
            </div>
            {connectionStatus === 'disconnected' || connectionStatus === 'error' || connectionStatus === 'unregistered' || connectionStatus === 'registration_failed' ? (
              <Button onClick={handleSaveSipConfig} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <LinkIcon className="mr-2 h-4 w-4" /> Connect & Register
              </Button>
            ) : (
              <Button onClick={handleDisconnectSip} className="w-full bg-red-600 hover:bg-red-700 text-white" variant="destructive">
                <Unlink className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Audio/Video Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Volume2 className="mr-2 text-primary" /> Audio & Video</CardTitle>
            <CardDescription>Configure your microphone, speakers, and camera.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="micSelect" className="flex items-center"><Mic className="mr-2 h-4 w-4 text-muted-foreground" />Microphone</Label>
              <Select defaultValue="default">
                <SelectTrigger id="micSelect">
                  <SelectValue placeholder="Select Microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default System Microphone</SelectItem>
                  <SelectItem value="mic1">External USB Mic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="speakerSelect" className="flex items-center"><Volume2 className="mr-2 h-4 w-4 text-muted-foreground" />Speakers</Label>
              <Select defaultValue="default">
                <SelectTrigger id="speakerSelect">
                  <SelectValue placeholder="Select Speakers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default System Speakers</SelectItem>
                  <SelectItem value="speaker1">Headphones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cameraSelect" className="flex items-center"><Video className="mr-2 h-4 w-4 text-muted-foreground" />Camera</Label>
              <Select defaultValue="default">
                <SelectTrigger id="cameraSelect">
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default System Camera</SelectItem>
                  <SelectItem value="cam1">Integrated Webcam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSaveChanges("Audio/Video")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Device Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-2 text-primary" /> Notifications</CardTitle>
            <CardDescription>Manage how you receive alerts from VidApp Connect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="incomingCallNotifs" className="flex-grow flex items-center">
                <BellRing className="mr-2 h-4 w-4 text-muted-foreground" /> Incoming Call Notifications
              </Label>
              <Switch id="incomingCallNotifs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="missedCallNotifs" className="flex-grow flex items-center">
                <BellMinus className="mr-2 h-4 w-4 text-muted-foreground" /> Missed Call Summaries
              </Label>
              <Switch id="missedCallNotifs" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="soundNotifs" className="flex-grow flex items-center">
                <Volume2 className="mr-2 h-4 w-4 text-muted-foreground" /> Notification Sounds
              </Label>
              <Switch id="soundNotifs" defaultChecked />
            </div>
            <Button onClick={() => handleSaveChanges("Notifications")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Notification Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Security Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2 text-primary" /> Privacy & Security</CardTitle>
            <CardDescription>Control your privacy and app security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="blockUnknown" className="flex-grow flex items-center">
                <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" /> Block calls from unknown numbers
              </Label>
              <Switch id="blockUnknown" />
            </div>
            <div>
                <a href="https://vidapp.org/privacy" target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="p-0 h-auto flex items-center"><ExternalLink className="mr-1 h-3 w-3" />View Privacy Policy on vidapp.org</Button>
                </a>
            </div>
             <Button onClick={() => handleSaveChanges("Privacy")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> Save Privacy Settings
             </Button>
          </CardContent>
        </Card>
        
        {/* About Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 text-primary"/>About VidApp Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> Version: 1.0.0 (Alpha)</p>
            <p className="flex items-center"><Copyright className="mr-2 h-4 w-4 text-muted-foreground" /> &copy; {new Date().getFullYear()} VidApp. All rights reserved.</p>
            <p className="flex items-center"><Cog className="mr-2 h-4 w-4 text-muted-foreground" /> Powered by SIP and Asterisk technologies.</p>
            <Separator className="my-3"/>
            <a href="https://vidapp.com/support" target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full"><LifeBuoy className="mr-2 h-4 w-4" />Get Support</Button>
            </a>
             <a href="https://vidapp.org/terms" target="_blank" rel="noopener noreferrer" className="block mt-2">
              <Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" />Terms of Service</Button>
            </a>
          </CardContent>
        </Card>

        {/* Logout */}
         <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><LogOut className="mr-2 text-destructive" /> Logout</CardTitle>
            <CardDescription>Sign out of your VidApp Connect account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={() => toast({title: "Logged Out", description: "You have been successfully logged out. (Simulated)"})}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
