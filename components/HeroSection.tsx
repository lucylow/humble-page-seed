import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-primary/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container-padding relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              SEO-Optimized Landing Pages for Every Domain
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Automatically generate high-converting, search engine optimized landing pages for your tokenized domains with DomaLand.AI
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  Start Creating Pages
                </div>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2">
                <span>📚</span>
                Learn More
              </div>
            </Button>
          </div>

          {/* SEO Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Faster Page Load Times</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">300%</div>
              <div className="text-sm text-muted-foreground">Increase in Organic Traffic</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Automated SEO Optimization</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

