
"use client";

import { PageTitle } from "@/components/custom/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Volume2, Video, LogOut, Save, ExternalLink, Mic, BellRing, BellMinus, ShieldAlert, Info, Copyright, Cog, LifeBuoy, FileText, PhoneCall, KeyRound, UserCheck, Router } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');
  const [sipServerUri, setSipServerUri] = useState('');

  const handleSaveChanges = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated. (Simulated)`,
    });
  };

  const handleSaveSipConfig = () => {
    // In a real app, you would securely store these (e.g., context, localStorage, or send to a backend)
    // and potentially try to register with the SIP server.
    toast({
      title: "SIP Configuration Saved",
      description: "Your SIP details have been saved. (Simulated)",
    });
    console.log("SIP Config:", { sipUsername, sipPassword, sipServerUri });
  };
  
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
              <Input id="sipAddress" defaultValue="you@vidapp.com" disabled />
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
            <CardDescription>Configure your SIP account details for making calls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sipUsername" className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />SIP Username</Label>
              <Input 
                id="sipUsername" 
                placeholder="e.g., 1001 or your_user" 
                value={sipUsername}
                onChange={(e) => setSipUsername(e.target.value)}
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
              />
            </div>
            <div>
              <Label htmlFor="sipServerUri" className="flex items-center"><Router className="mr-2 h-4 w-4 text-muted-foreground" />SIP Server URI</Label>
              <Input 
                id="sipServerUri" 
                placeholder="wss://asterisk.example.com:8089/ws" 
                value={sipServerUri}
                onChange={(e) => setSipServerUri(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveSipConfig} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save SIP Configuration
            </Button>
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

    