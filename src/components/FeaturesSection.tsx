import { motion } from 'framer-motion';
import { Brain, Shield, Bitcoin, Zap, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI-Powered Development",
    description: "NLP converts project descriptions into production-ready Clarity smart contracts with security checks and parameterization.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Leverages Clarity's decidability, no reentrancy, predictable gas, and optional formal verification for escrow contracts.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Bitcoin,
    title: "Bitcoin-Native",
    description: "Settle invoices in sBTC, unlocking Bitcoin as a payments rail for DAOs and real-world services.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "One-click deployment to Stacks testnet/mainnet with automated contract verification and optimization.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Time-Saving Automation",
    description: "Reduce invoice processing time from weeks to minutes with automated milestone tracking and payment releases.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Users,
    title: "DAO-Ready",
    description: "Built for decentralized organizations with multi-sig support, voting mechanisms, and transparent treasury management.",
    color: "from-indigo-500 to-blue-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose BitMind?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for DAOs: AI→Clarity→sBTC — secure, auditable, and automated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 from-gray-900 to-gray-700" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

