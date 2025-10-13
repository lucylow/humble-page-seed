import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Describe Your Project",
    description: "Use natural language to describe scope, milestones, and budget.",
  },
  {
    number: "2",
    title: "AI Generates Contract",
    description: "AI processes text and generates a secure Clarity contract ready for deployment.",
  },
  {
    number: "3",
    title: "Deploy & Fund Escrow",
    description: "Deploy to Stacks testnet and fund the escrow with sBTC or STX.",
  },
  {
    number: "4",
    title: "Automated Payments",
    description: "Milestones trigger automatic payments. Disputes go to pre-selected arbitrators.",
  },
];

export function DemoSection() {
  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the complete AI-to-blockchain workflow — no blockchain knowledge required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-6 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6"
            >
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                🎯 Launch Interactive Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl">
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-400">AI Invoice Generator</div>
              </div>

              {/* Demo Content */}
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-mono text-sm">AI: Analyzing invoice description...</span>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300">
                  <div className="text-green-400">$ Invoice: Website redesign</div>
                  <div className="text-blue-400">$ Amount: 0.05 sBTC</div>
                  <div className="text-purple-400">$ Milestones: 2</div>
                  <div className="text-yellow-400">$ Deadline: 2025-10-20</div>
                </div>

                <div className="flex items-center space-x-2 text-blue-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-mono text-sm">Generating Clarity contract...</span>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-green-400 text-sm mb-2">Contract deployed successfully!</div>
                  <div className="text-xs text-gray-400 break-all">
                    ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.smart-invoice-v1
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 p-0 opacity-90 hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

