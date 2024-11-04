import { useState, useEffect } from 'react'
import { Bell, Home, User, CheckCircle, Clock, X, LogOut, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

interface Service {
  description: string;
  extraPrice: number;
}

interface Profile {
  name: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
}

export default function AgentDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: '/placeholder.svg'
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProfile()
    fetchDashboardData(page)
  }, [page])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/agent/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to fetch profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchDashboardData = async (page: number) => {
    try {
      const response = await fetch(`/agent/dashboard?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setTasks(data.tasks)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task)
    setIsPopupOpen(true)
    try {
      const response = await fetch(`/agent/bookings/${task._id}/extra-tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch extra tasks')
      const data = await response.json()
      setServices(data.extraTasks)
    } catch (error) {
      console.error('Error fetching extra tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch extra tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddService = async (service: Service) => {
    if (!selectedTask) return
    try {
      const response = await fetch(`/agent/booking/${selectedTask._id}/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(service)
      })
      if (!response.ok) throw new Error('Failed to add service')
      const data = await response.json()
      setServices(data.extraTasks)
      toast({
        title: "Success",
        description: "Service added successfully.",
      })
    } catch (error) {
      console.error('Error adding service:', error)
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: 'In Progress' | 'Completed') => {
    try {
      const endpoint = newStatus === 'In Progress' ? '/agent/bookings/in-progress' : '/agent/bookings/completed'
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bookingId: taskId })
      })
      if (!response.ok) throw new Error(`Failed to update status to ${newStatus}`)
      
      setTasks(tasks.map(task => task._id === taskId ? { ...task, status: newStatus } : task))
      
      toast({
        title: "Success",
        description: `Task status updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    try {
      const response = await fetch('/agent/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedProfile)
      })
      if (!response.ok) throw new Error('Failed to update profile')
      const data = await response.json()
      setProfile(data)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout?role=AGENT', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Logout failed')
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const pendingTasks = tasks.filter(task => task.status === 'Pending')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
        </div>
        <nav className="mt-6">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center px-4 py-2 ${activeTab === "dashboard" ? 'text-gray-700 bg-gray-200' : 'text-gray-600 hover:bg-gray-200'}`}>
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </button>
          <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center px-4 py-2 mt-2 ${activeTab === "profile" ? 'text-gray-700 bg-gray-200' : 'text-gray-600 hover:bg-gray-200'}`}>
            <User className="w-5 h-5 mr-2" />
            Profile
          </button>
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 mt-2 text-red-600 hover:bg-red-100">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">Welcome, {profile.name}</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Bell className="w-5 h-5" />
                  {pendingTasks.length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingTasks.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Pending Tasks</h4>
                    <p className="text-sm text-muted-foreground">
                      You have {pendingTasks.length} pending tasks.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {pendingTasks.map((task) => (
                      <div key={task._id} className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-sm">{task.title}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="ml-auto"
                          onClick={() => handleStatusChange(task._id, 'In Progress')}
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {activeTab === "dashboard" && (
            <div className="flex-1 overflow-auto">
              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="in-progress">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.filter(task => task.status === 'In Progress').map((task) => (
                      <TaskCard key={task._id} task={task} onClick={handleTaskClick} onStatusChange={handleStatusChange} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.filter(task => task.status === 'Completed').map((task) => (
                      <TaskCard key={task._id} task={task} onClick={handleTaskClick} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleProfileUpdate(profile);
                }} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={profile.profilePicture} alt={profile.name} />
                      <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{profile.name}</h3>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="profile-name">Name</Label>
                    <Input
                      id="profile-name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isPopupOpen && selectedTask && (
            <Popup
              task={selectedTask}
              onClose={() => setIsPopupOpen(false)}
              onAddService={handleAddService}
              
              services={services}
            />
          )}
        </div>

        {activeTab === "dashboard" && (
          <div className="mt-auto p-4 bg-white border-t">
            <div className="flex justify-center items-center">
              <Button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="mx-4">Page {page} of {totalPages}</span>
              <Button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function TaskCard({ task, onClick, onStatusChange }: { 
  task: Task; 
  onClick: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: 'In Progress' | 'Completed') => void;
}) {
  return (
    <Card className="cursor-pointer" onClick={() => onClick(task)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {task.title}
          {task.status === 'Completed' ? <CheckCircle className="text-green-500" /> : 
           task.status === 'In Progress' ? <Clock className="text-yellow-500" /> :
           <Clock className="text-gray-500" />}
        </CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {task.status === 'In Progress' && onStatusChange && (
          <Button onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task._id, 'Completed');
          }}>
            Mark Completed
          </Button>
        )}
        {task.status === 'Completed' && (
          <Button variant="outline">View Details</Button>
        )}
      </CardContent>
    </Card>
  )
}

function Popup({ task, onClose, onAddService, services }: { 
  task: Task; 
  onClose: () => void; 
  onAddService: (service: Service) => void;
  services: Service[];
}) {
  const [newService, setNewService] = useState({ description: '', extraPrice: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newService.description) {
      onAddService({
        description: newService.description,
        extraPrice: newService.extraPrice ? Math.max(0, parseFloat(newService.extraPrice)) : 0
      })
      setNewService({ description: '', extraPrice: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{task.title}</h3>
          <Button variant="ghost" onClick={onClose}><X /></Button>
        </div>
        <p className="mb-4">{task.description}</p>
        
        <h4 className="font-semibold mb-2">Add Extra Task</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service-description">Task Description</Label>
            <Textarea
              id="service-description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Enter task description"
            />
          </div>
          <div>
            <Label htmlFor="service-price">Extra Price</Label>
            <Input
              id="service-price"
              type="number"
              min="0"
              step="0.01"
              value={newService.extraPrice}
              onChange={(e) => setNewService({ ...newService, extraPrice: e.target.value })}
              placeholder="Enter extra price"
            />
          </div>
          <Button type="submit">Add Extra Task</Button>
        </form>

        <h4 className="font-semibold mt-6 mb-2">Extra Tasks</h4>
        {services.length > 0 ? (
          <ul className="space-y-2">
            {services.map((service, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded">
                <strong>{service.description}</strong>
                <span className="block text-sm text-gray-600">
                  Extra Price: ${service.extraPrice.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No extra tasks added yet.</p>
        )}
      </div>
    </div>
  )
}