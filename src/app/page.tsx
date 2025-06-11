import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
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
            <Image src="https://placehold.co/600x400.png" alt="Video call illustration" width={600} height={400} className="rounded-md mt-4" data-ai-hint="communication technology" />
          </CardContent>
        </Card>
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center"><CheckCircle2 className="mr-2 text-accent"/> Stay Organized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your contacts and keep track of your call history, all in one intuitive interface.</p>
             <Image src="https://placehold.co/600x400.png" alt="Contact management illustration" width={600} height={400} className="rounded-md mt-4" data-ai-hint="contacts organization" />
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
