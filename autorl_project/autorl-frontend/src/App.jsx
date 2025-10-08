import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Smartphone, Activity, CheckCircle, XCircle, Clock, Play, Pause, ListTodo, SlidersHorizontal } from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function App() {
  const [devices, setDevices] = useState([])
  const [tasks, setTasks] = useState([])
  const [metrics, setMetrics] = useState({
    total_tasks_success: 0,
    total_tasks_failure: 0,
    tasks_in_progress: 0,
    task_error_types: {}
  })
  const [activityLog, setActivityLog] = useState([])
  const [policies, setPolicies] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const fetchData = async () => {
    try {
      const [devicesRes, tasksRes, metricsRes, activityRes, policiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/devices`),
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}/metrics`),
        fetch(`${API_BASE_URL}/activity`),
        fetch(`${API_BASE_URL}/policies`)
      ])

      const devicesData = await devicesRes.json()
      const tasksData = await tasksRes.json()
      const metricsData = await metricsRes.json()
      const activityData = await activityRes.json()
      const policiesData = await policiesRes.json()

      setDevices(devicesData)
      setTasks(tasksData)
      setMetrics(metricsData)
      setActivityLog(activityData)
      setPolicies(policiesData)

      // Determine if agent is running based on active tasks or a dedicated status endpoint
      setIsRunning(metricsData.tasks_in_progress > 0)

    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'queued': return <Clock className="w-4 h-4 text-gray-400" />
      default: return null
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'idle': 'secondary',
      'active': 'default',
      'running': 'default',
      'completed': 'default',
      'failed': 'destructive',
      'queued': 'secondary'
    }
    return variants[status] || 'secondary'
  }

  const handleStartStop = async () => {
    const endpoint = isRunning ? 'stop' : 'start'
    try {
      const response = await fetch(`${API_BASE_URL}/agent/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      console.log(`Agent ${endpoint} response:`, data)
      // setIsRunning(!isRunning) // Let fetchData update the state based on actual metrics
      fetchData() // Refresh data after action
    } catch (error) {
      console.error(`Failed to ${endpoint} agent:`, error)
    }
  }

  const handlePromotePolicy = async (policyName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_name: policyName })
      })
      const data = await response.json()
      console.log(`Promote policy ${policyName} response:`, data)
      fetchData() // Refresh data after action
    } catch (error) {
      console.error(`Failed to promote policy ${policyName}:`, error)
    }
  }

  const totalTasks = metrics.total_tasks_success + metrics.total_tasks_failure;
  const successRate = totalTasks > 0 ? ((metrics.total_tasks_success / totalTasks) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AutoRL Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">AI Agent Control Center</p>
              </div>
            </div>
            <Button 
              onClick={handleStartStop}
              className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Agent
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Agent
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{totalTasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-3xl text-green-600">{successRate}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Failed Tasks</CardDescription>
              <CardTitle className="text-3xl text-red-600">{metrics.total_tasks_failure}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Active Tasks</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{metrics.tasks_in_progress}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Devices, Tasks, and Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Connected Devices
              </CardTitle>
              <CardDescription>Manage your device pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map(device => (
                  <div 
                    key={device.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{device.id} {device.is_real ? '(Real)' : '(Emulator)'}</p>
                        <p className="text-sm text-muted-foreground capitalize">{device.platform}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(device.status)}>
                      {device.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5" />
                Task Queue
              </CardTitle>
              <CardDescription>Monitor task execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length > 0 ? tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.device || 'Waiting for device'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(task.status)} className="mb-1">
                        {task.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{task.duration}</p>
                    </div>
                  </div>
                )) : <p className="text-muted-foreground">No tasks in queue.</p>}
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                RL Policies
              </CardTitle>
              <CardDescription>Manage and promote learning policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.length > 0 ? policies.map(policy => (
                  <div 
                    key={policy.name}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        policy.is_active ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">Strategy: {policy.strategy}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={policy.is_active ? "secondary" : "default"}
                      onClick={() => handlePromotePolicy(policy.name)}
                      disabled={policy.is_active}
                    >
                      {policy.is_active ? 'Active' : 'Promote'}
                    </Button>
                  </div>
                )) : <p className="text-muted-foreground">No policies registered.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest agent actions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm max-h-60 overflow-y-auto">
              {activityLog.map((log, index) => (
                <div key={index} className="flex gap-3 text-muted-foreground">
                  <span className={log.level === 'success' ? 'text-green-500' : log.level === 'error' ? 'text-red-500' : 'text-blue-500'}>[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default App

