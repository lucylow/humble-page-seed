import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform DAO Payments?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of decentralized finance with AI-powered, Bitcoin-native smart invoices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="group bg-white text-gray-900 hover:bg-gray-100 h-14 px-10 text-lg"
            >
              🚀 Launch DApp
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 h-14 px-10 text-lg"
            >
              <Github className="mr-2 w-5 h-5" />
              Star on GitHub
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">$25K+</div>
              <div className="text-blue-200 text-sm">Prize Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold">476</div>
              <div className="text-blue-200 text-sm">Hackers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-blue-200 text-sm">Days Left</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1st</div>
              <div className="text-blue-200 text-sm">Place Goal</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

