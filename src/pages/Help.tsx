import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Shield, 
  Zap, 
  Bitcoin, 
  CheckCircle2, 
  Users,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Code,
  ExternalLink
} from "lucide-react";

const Help = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Invoice Creation",
      description: "Use natural language to create invoices. Just describe what you need, and our AI will generate the smart contract.",
      steps: [
        "Click 'Create New Invoice'",
        "Describe your project in plain English",
        "Review the generated milestones and terms",
        "Submit for DAO approval"
      ]
    },
    {
      icon: <Bitcoin className="w-8 h-8 text-orange-600" />,
      title: "Escrow & Payment",
      description: "Secure Bitcoin-native escrow using Stacks blockchain and sBTC for trustless milestone payments.",
      steps: [
        "DAO approves and funds the invoice",
        "Funds locked in smart contract escrow",
        "Contractor completes milestones",
        "Payments released automatically"
      ]
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "Milestone Management",
      description: "Track progress with granular milestones. Each milestone has its own deliverables and payment amounts.",
      steps: [
        "Define clear milestone deliverables",
        "Submit proof of completion",
        "DAO reviews and approves",
        "Funds released to contractor"
      ]
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Dispute Resolution",
      description: "Fair and transparent dispute handling with decentralized arbitrators when disagreements arise.",
      steps: [
        "Either party initiates dispute",
        "Evidence submitted on-chain",
        "Arbitrators review and vote",
        "Binding resolution executed"
      ]
    }
  ];

  const faqs = [
    {
      question: "What is BitMind?",
      answer: "BitMind is an AI-powered invoice escrow platform for DAOs built on the Stacks blockchain. It automates contractor payments using smart contracts and milestone-based releases."
    },
    {
      question: "How does the escrow system work?",
      answer: "When a DAO funds an invoice, the payment is locked in a Clarity smart contract. As contractors complete milestones, the DAO reviews and approves, triggering automatic payment releases."
    },
    {
      question: "What happens during a dispute?",
      answer: "Either party can initiate a dispute. Both sides submit evidence, and selected arbitrators review the case and vote on a resolution. The smart contract automatically executes the decision."
    },
    {
      question: "What assets are supported?",
      answer: "BitMind supports sBTC (Stacks Bitcoin), STX tokens, and various bridged assets. Multi-asset invoices allow flexible payment structures."
    },
    {
      question: "How are arbitrators selected?",
      answer: "Arbitrators are randomly selected from a pool of verified community members with good reputation scores. They stake tokens to ensure honest voting."
    },
    {
      question: "Can I cancel an invoice?",
      answer: "Yes, invoices can be cancelled before being funded. After funding, both parties must agree to cancellation, or a dispute resolution process is required."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Help & Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using BitMind for your DAO's invoice management
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-12 shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-3xl">Quick Start Guide</CardTitle>
                <CardDescription className="text-base">Get up and running in 5 minutes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Connect Wallet</h3>
                <p className="text-sm text-gray-600">Link your Stacks wallet to get started</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">Create Invoice</h3>
                <p className="text-sm text-gray-600">Use AI to generate smart contract terms</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Fund Escrow</h3>
                <p className="text-sm text-gray-600">DAO approves and funds the contract</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold mb-2">Complete & Get Paid</h3>
                <p className="text-sm text-gray-600">Finish milestones and receive payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-md hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">How it works:</h4>
                  <ol className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Developer Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-blue-500">
              <CardHeader>
                <Code className="w-10 h-10 text-blue-600 mb-3" />
                <CardTitle>Smart Contracts</CardTitle>
                <CardDescription>Explore our open-source Clarity contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View on GitHub
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-purple-500">
              <CardHeader>
                <BookOpen className="w-10 h-10 text-purple-600 mb-3" />
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>Integrate BitMind into your app</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Read Docs
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-green-500">
              <CardHeader>
                <Users className="w-10 h-10 text-green-600 mb-3" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Join our Discord for support</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Join Discord
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support CTA */}
        <Card className="shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="font-semibold">
                Contact Support
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="font-semibold bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;

