import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Wallet, GitBranch, Shield, TrendingUp, Clock, DollarSign } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor your DAO's invoice activities and treasury metrics
          </p>
        </header>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <CardTitle className="text-lg">Active Invoices</CardTitle>
              <CardDescription>Current ongoing deals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">12</p>
              <p className="text-sm text-green-600 mt-1">+3 this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Wallet className="w-8 h-8 text-purple-600" />
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <CardTitle className="text-lg">Total Value</CardTitle>
              <CardDescription>Locked in escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">$45.2K</p>
              <p className="text-sm text-gray-600 mt-1">Across 12 deals</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <GitBranch className="w-8 h-8 text-green-600" />
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <CardTitle className="text-lg">Milestones</CardTitle>
              <CardDescription>Completed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600 mt-1">96% on time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="w-8 h-8 text-orange-600" />
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                  ACTIVE
                </span>
              </div>
              <CardTitle className="text-lg">Disputes</CardTitle>
              <CardDescription>Currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600 mt-1">1 pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Recent Invoices</CardTitle>
                    <CardDescription>Your latest invoice activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      id: "INV-001", 
                      status: "funded", 
                      amount: "$12,500", 
                      dao: "DeFi DAO",
                      progress: 75,
                      contractor: "Alice Johnson",
                      dueDate: "Dec 31, 2024"
                    },
                    { 
                      id: "INV-002", 
                      status: "pending", 
                      amount: "$8,300", 
                      dao: "NFT Collective",
                      progress: 0,
                      contractor: "Bob Smith",
                      dueDate: "Jan 15, 2025"
                    },
                    { 
                      id: "INV-003", 
                      status: "completed", 
                      amount: "$15,000", 
                      dao: "Web3 Guild",
                      progress: 100,
                      contractor: "Carol White",
                      dueDate: "Dec 20, 2024"
                    },
                    { 
                      id: "INV-004", 
                      status: "funded", 
                      amount: "$9,200", 
                      dao: "DAO Builders",
                      progress: 40,
                      contractor: "David Lee",
                      dueDate: "Jan 10, 2025"
                    },
                  ].map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="w-8 h-8 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-lg">{invoice.id}</p>
                            <Badge
                              variant={
                                invoice.status === "completed"
                                  ? "default"
                                  : invoice.status === "funded"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{invoice.dao} • {invoice.contractor}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                              <div 
                                className={`h-2 rounded-full ${
                                  invoice.status === "completed" 
                                    ? "bg-green-500" 
                                    : invoice.status === "funded"
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                                style={{ width: `${invoice.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{invoice.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-xl text-gray-900">{invoice.amount}</p>
                          <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" size="lg">
                  <FileText className="mr-2 w-5 h-5" />
                  Create New Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Wallet className="mr-2 w-5 h-5" />
                  Fund Escrow
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <GitBranch className="mr-2 w-5 h-5" />
                  Review Milestone
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Shield className="mr-2 w-5 h-5" />
                  View Disputes
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl">Treasury Health</CardTitle>
                <CardDescription>Overall DAO metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-lg font-bold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Completion</span>
                  <span className="text-lg font-bold text-blue-600">12 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Paid</span>
                  <span className="text-lg font-bold text-purple-600">$342K</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

