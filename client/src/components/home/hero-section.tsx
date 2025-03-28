import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" id="home">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary to-transparent opacity-70 z-10"></div>
      <div className="container mx-auto px-4 py-16 relative z-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Trade Bonds from 193 UN Countries</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The world's first virtual bond exchange platform with leverage options up to 50x
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/80 text-secondary py-3 px-6 rounded font-medium">
                Get Started
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" className="bg-transparent border border-primary text-primary hover:bg-primary/10 py-3 px-6 rounded font-medium">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* World Map Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          className="w-full h-full object-cover" 
          alt="World map background" 
        />
      </div>
    </section>
  );
}
