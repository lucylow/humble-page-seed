import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        
        <div className="container-padding relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center animate-slide-up">
              <Logo size="xl" showText={true} showTagline={true} variant="full" className="hover:scale-105 transition-transform duration-300" />
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Transform Domains
                </span>
                <br />
                <span className="text-foreground">Into Liquid Assets</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Unlock the <strong className="text-primary">$350B domain economy</strong> with AI-powered tokenization, 
                instant landing pages, and DeFi infrastructure.
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap justify-center gap-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              {[
                { value: '$350B+', label: 'Global Market', icon: '💰' },
                { value: '362M+', label: 'Domains', icon: '🌐' },
                { value: '95%', label: 'Illiquid', icon: '🔒' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="group relative bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-2xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{stat.icon}</span>
                    <div>
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="group text-lg px-12 py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 rounded-full"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span className="font-semibold">Start Tokenizing Now</span>
                  </span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-12 py-7 border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 rounded-full"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold">Explore Features</span>
                </span>
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="pt-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <p className="text-sm text-muted-foreground mb-4">Powered by</p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="text-muted-foreground/60 font-semibold text-lg hover:text-primary transition-colors duration-300">Doma Protocol</div>
                <div className="text-muted-foreground/60 font-semibold text-lg hover:text-primary transition-colors duration-300">XMTP</div>
                <div className="text-muted-foreground/60 font-semibold text-lg hover:text-primary transition-colors duration-300">Ethereum</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section id="problems" className="py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-semibold">The Challenge</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              The <span className="text-destructive">$350B Problem</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Despite massive value, domains remain illiquid and underutilized
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Poor Discoverability",
                description: "Tokenized domains sit idle on marketplaces with low search visibility and minimal SEO exposure. Buyers can't find valuable domains through organic search.",
                impact: "95% of domains never get discovered"
              },
              {
                icon: "⏳",
                title: "High Transaction Friction",
                description: "Traditional sales require intermediaries, escrow services, and long transfer times. No direct communication tools between buyers and sellers.",
                impact: "Average sale takes 30-90 days"
              },
              {
                icon: "💰",
                title: "Limited Monetization",
                description: "Domain owners rely on passive parking or speculative resale. No seamless integration with DeFi primitives like fractional ownership or royalties.",
                impact: "Most domains generate $0 revenue"
              },
              {
                icon: "🔀",
                title: "Fragmented Experience",
                description: "Web2 registrars and Web3 marketplaces are siloed. Domain buyers navigate multiple disjointed platforms with no unified interface.",
                impact: "Users need 5+ different tools"
              },
              {
                icon: "📊",
                title: "Illiquid Asset Class",
                description: "Despite 362M+ registered domains worth $350B+, the market lacks transparency in valuation and efficient trading mechanisms.",
                impact: "Less than 5% actively traded"
              },
              {
                icon: "🤖",
                title: "No Automation",
                description: "Manual processes for pricing, negotiations, and transfers. No AI-powered valuation or automated landing page generation.",
                impact: "100% manual workflows"
              }
            ].map((problem, index) => (
              <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-destructive/5 to-destructive/10 backdrop-blur-sm p-8 rounded-xl border border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/10 hover:-translate-y-2">
                <div className="relative z-10">
                  <div className="text-5xl mb-6 animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                    {problem.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-destructive transition-colors duration-300">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed mb-4">
                    {problem.description}
                  </p>
                  <div className="inline-block bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium">
                    {problem.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-secondary/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">The Solution</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Your Complete <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">DomainFi Platform</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform static domains into dynamic, revenue-generating Web3 assets
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🌐",
                title: "Automated Landing Pages",
                description: "Each tokenized domain gets a live, SEO-optimized page (e.g., cryptoqueen.domaland.xyz) generated instantly at minting. Domains become web-discoverable via organic search.",
                benefit: "Instant web presence & SEO visibility"
              },
              {
                icon: "📊",
                title: "Real-Time Orderbook Integration",
                description: "Pages pull live pricing and listing status directly from Doma Protocol's orderbook, enabling instant 'Buy Now' or offer flows without leaving the landing page.",
                benefit: "Zero-friction transactions"
              },
              {
                icon: "💬",
                title: "Built-In Messaging & Negotiation",
                description: "Secure, domain-linked messaging via XMTP enables on-chain negotiation between buyers, sellers, and brokers—eliminating email inefficiencies.",
                benefit: "Direct buyer-seller communication"
              },
              {
                icon: "📈",
                title: "Analytics & Visibility Tools",
                description: "Owners get dashboards showing traffic, offers, and valuation metrics. DomaLand becomes a domain management tool with measurable KPIs.",
                benefit: "Data-driven domain management"
              },
              {
                icon: "🤖",
                title: "AI-Enhanced Monetization",
                description: "Advanced AI modules provide domain valuation, predictive analytics, and automated content generation, unlocking DeFi utilities like fractionalization and royalties.",
                benefit: "Intelligent pricing & automation"
              },
              {
                icon: "🔗",
                title: "Seamless Web3 Integration",
                description: "Deep integration with Doma Protocol tokenization, orderbook, state sync, and fractionalization features for complete DeFi functionality.",
                benefit: "Full blockchain infrastructure"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {feature.benefit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background relative overflow-hidden">        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black dark:text-white">
              How DomainFi Works
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Simple steps to transform your domains into liquid digital assets
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Connect Wallet",
                description: "Link your Web3 wallet to access the tokenization platform.",
                icon: "🔗"
              },
              {
                step: "2",
                title: "Select Domain",
                description: "Choose a domain from your portfolio to tokenize.",
                icon: "🌐"
              },
              {
                step: "3",
                title: "Configure Terms",
                description: "Set pricing, royalties, and fractionalization options.",
                icon: "⚙️"
              },
              {
                step: "4",
                title: "Tokenize & Trade",
                description: "Mint your domain token and start trading on our marketplace.",
                icon: "🚀"
              }
            ].map((step, index) => (
              <div key={index} className="group text-center relative">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed">
                  {step.description}
                </p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background relative overflow-hidden">        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black dark:text-white">
              Success Stories
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See how domain owners are leveraging DomainFi technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "DomainFi helped me unlock $50,000 in liquidity from domains I was just holding. The process was seamless and secure.",
                author: "John Daniels",
                role: "Domain Investor",
                avatar: "JD"
              },
              {
                text: "Fractional ownership allowed me to diversify my portfolio with premium domains I couldn't afford outright. Game changer!",
                author: "Sarah Reynolds",
                role: "Crypto Investor",
                avatar: "SR"
              },
              {
                text: "The royalty system automatically distributes earnings from my domain developments. Set it and forget it revenue streams.",
                author: "Mike Johnson",
                role: "Domain Developer",
                avatar: "MJ"
              }
            ].map((testimonial, index) => (
              <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4 opacity-20">💬</div>
                  <p className="text-muted-foreground italic mb-6 group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center font-semibold mr-4 shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors duration-300">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="value-proposition" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black dark:text-white">
              Direct Business Value Proposition
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real benefits for every stakeholder in the domain ecosystem
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👑",
                title: "For Domain Owners",
                benefits: [
                  "Passive income from parked domains",
                  "Better liquidity and faster sales",
                  "Global discoverability via SEO",
                  "Automated valuation and pricing"
                ],
                color: "from-blue-500/10 to-blue-600/10 border-blue-500/20"
              },
              {
                icon: "💼",
                title: "For Buyers & Investors",
                benefits: [
                  "Frictionless offers and negotiations",
                  "Valuation transparency and data",
                  "Secure communication and settlement",
                  "Access to premium domains via fractional ownership"
                ],
                color: "from-green-500/10 to-green-600/10 border-green-500/20"
              },
              {
                icon: "🌐",
                title: "For the Web3 Ecosystem",
                benefits: [
                  "Real-world $350B asset class onboarded",
                  "Measurable user adoption and KPIs",
                  "New DeFi primitives and utilities",
                  "Bridge between Web2 and Web3 domains"
                ],
                color: "from-purple-500/10 to-purple-600/10 border-purple-500/20"
              }
            ].map((stakeholder, index) => (
              <div key={index} className={`group relative overflow-hidden bg-gradient-to-br ${stakeholder.color} backdrop-blur-sm p-8 rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}>
                <div className="relative z-10">
                  <div className="text-5xl mb-6 animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                    {stakeholder.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-6 group-hover:text-primary transition-colors duration-300">
                    {stakeholder.title}
                  </h3>
                  <ul className="space-y-3">
                    {stakeholder.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        <span className="text-primary mt-1">✓</span>
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground relative overflow-hidden">
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto text-white">
            <div className="mb-8">
              <span className="text-6xl animate-float">🚀</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Unlock the Full Financial Potential of Your Domains
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Transform your parked domains into liquid, monetizable digital assets. 
              Join the revolution that's bridging the $350B domain industry with Web3 infrastructure.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">$50K+</div>
                <p className="text-white/80">Average liquidity unlocked per domain</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <p className="text-white/80">Reduction in transaction time</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">10x</div>
                <p className="text-white/80">Increase in domain discoverability</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/dashboard">
                <Button variant="secondary" size="lg" className="text-lg px-12 py-6 bg-white text-primary hover:bg-white/90 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/25 hover:-translate-y-1">
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    Start Tokenizing Now
                  </div>
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-primary font-medium transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  View Live Demo
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-t border-border/50 py-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <Logo size="md" showText={true} showTagline={false} variant="default" />
              <p className="text-muted-foreground leading-relaxed">
                Transforming domain ownership through blockchain technology and decentralized finance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">Platform</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/marketplace" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>🏪</span> Marketplace</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>🔗</span> Tokenization</Link></li>
                <li><Link to="/fractional" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>🎯</span> Fractional Ownership</Link></li>
                <li><Link to="/analytics" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>💰</span> Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">Resources</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>📚</span> Documentation</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>🎓</span> Tutorials</Link></li>
                <li><Link to="/analytics" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>📝</span> Blog</Link></li>
                <li><Link to="/marketplace" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>🔧</span> API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">Company</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>👥</span> About Us</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>💼</span> Careers</Link></li>
                <li><Link to="/marketplace" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>📧</span> Contact</Link></li>
                <li><Link to="/analytics" className="hover:text-primary transition-colors duration-300 flex items-center gap-2"><span>⚖️</span> Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; 2024 DomainFi. All rights reserved. Built with ❤️ for the decentralized web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;