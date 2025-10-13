import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Brain, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { DemoSection } from '@/components/DemoSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 text-gradient">
                BitMind
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Where Bitcoin learns to think</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Features
            </a>
            <a href="#demo" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Demo
            </a>
            <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/help" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Help
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Github className="mr-2 w-4 h-4" />
              GitHub
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
              Launch App
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              <a 
                href="#features" 
                className="block text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a 
                href="#demo" 
                className="block text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </a>
              <Link 
                to="/dashboard" 
                className="block text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/help" 
                className="block text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Help
              </Link>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 w-4 h-4" />
                  GitHub
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  Launch App
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
