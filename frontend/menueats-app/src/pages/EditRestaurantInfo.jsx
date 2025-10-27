import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"
import { Store, Edit, Plus, Save, X, ArrowLeft, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'

const BASE_URL = 'http://localhost:8084/api/users'

export default function EditRestaurantInfo() {
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const navigate = useNavigate()
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)
    
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedRestaurant, setExpandedRestaurant] = useState(null)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: ''
    })
    const [showCreateForm, setShowCreateForm] = useState(false)

    const toggleChatroom = () => {
        setIsChatroomOpen(!isChatroomOpen)
        setIsChatroomMinimized(false)
    }

    const closeChatroom = () => {
        setIsChatroomOpen(false)
        setIsChatroomMinimized(false)
    }

    const minimizeChatroom = () => {
        setIsChatroomMinimized(!isChatroomMinimized)
    }

    // Load owner's restaurants using API from js-tests
    const loadRestaurants = async () => {
        if (!currentUser || currentUser.role !== 'BUSINESS_OWNER') {
            console.log('[EditRestaurantInfo] No valid business owner user found')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('[EditRestaurantInfo] Loaded restaurants:', data)
            setRestaurants(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('[EditRestaurantInfo] Failed to load restaurants:', error)
            setError('Failed to load restaurants')
            setRestaurants([])
        } finally {
            setLoading(false)
        }
    }

    // Create new restaurant
    const createRestaurant = async () => {
        if (!currentUser) return

        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log('[EditRestaurantInfo] Restaurant created:', data)
            
            toast({
                title: "Success",
                description: "Restaurant created successfully!"
            })
            
            setShowCreateForm(false)
            setFormData({ name: '', location: '', description: '' })
            loadRestaurants()
        } catch (error) {
            console.error('[EditRestaurantInfo] Failed to create restaurant:', error)
            toast({
                title: "Error",
                description: "Failed to create restaurant. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Update restaurant
    const updateRestaurant = async (restaurantId) => {
        if (!currentUser) return

        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants/${restaurantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log('[EditRestaurantInfo] Restaurant updated:', data)
            
            toast({
                title: "Success",
                description: "Restaurant updated successfully!"
            })
            
            setEditingRestaurant(null)
            setFormData({ name: '', location: '', description: '' })
            loadRestaurants()
        } catch (error) {
            console.error('[EditRestaurantInfo] Failed to update restaurant:', error)
            toast({
                title: "Error",
                description: "Failed to update restaurant. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Start editing restaurant
    const startEditingRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant.id)
        setFormData({
            name: restaurant.name || '',
            location: restaurant.location || '',
            description: restaurant.description || ''
        })
    }

    // Cancel editing
    const cancelEditing = () => {
        setEditingRestaurant(null)
        setShowCreateForm(false)
        setFormData({ name: '', location: '', contactInfo: '', description: '' })
    }

    // Load data on component mount
    useEffect(() => {
        loadRestaurants()
    }, [currentUser])

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 bg-gray-50 min-h-screen">
                    <div className="flex items-center p-4">
                        <SidebarTrigger className="mr-4"/>
                    </div>
                    
                    <div className="p-6 pt-0">
                        {/* Header */}
                        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate(-1)}
                                        className="p-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <h1 className="text-2xl font-bold">Manage Restaurants</h1>
                                </div>
                                <Button 
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Restaurant
                                </Button>
                            </div>
                            <p className="text-gray-600">View and edit your restaurant information</p>
                        </div>

                        {/* Create Restaurant Form */}
                        {showCreateForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Create New Restaurant</span>
                                        <Button variant="ghost" onClick={cancelEditing}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Restaurant Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="Enter restaurant name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                placeholder="Enter restaurant location"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Enter restaurant description"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                                        <Button 
                                            onClick={createRestaurant}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Create Restaurant
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Restaurants List */}
                        <div className="space-y-4">
                            {loading ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading restaurants...</p>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-red-500">
                                        <p>{error}</p>
                                        <Button onClick={loadRestaurants} className="mt-4">Retry</Button>
                                    </CardContent>
                                </Card>
                            ) : restaurants.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-500">
                                        <Store className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p>No restaurants found</p>
                                        <p className="text-sm mb-4">Create your first restaurant to get started</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                restaurants.map((restaurant) => (
                                    <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            {editingRestaurant === restaurant.id ? (
                                                // Edit Form
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor={`edit-name-${restaurant.id}`}>Restaurant Name</Label>
                                                            <Input
                                                                id={`edit-name-${restaurant.id}`}
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`edit-location-${restaurant.id}`}>Location</Label>
                                                            <Input
                                                                id={`edit-location-${restaurant.id}`}
                                                                value={formData.location}
                                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`edit-description-${restaurant.id}`}>Description</Label>
                                                            <Textarea
                                                                id={`edit-description-${restaurant.id}`}
                                                                value={formData.description}
                                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                                                        <Button 
                                                            onClick={() => updateRestaurant(restaurant.id)}
                                                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                                        >
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Display View
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <Store className="w-8 h-8 text-yellow-500" />
                                                            <div>
                                                                <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                                                                <p className="text-gray-600">Restaurant ID: {restaurant.id}</p>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => startEditingRestaurant(restaurant)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">{restaurant.location || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => navigate('/manage-menu', { state: { restaurantId: restaurant.id, restaurantName: restaurant.name } })}
                                                                className="mt-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                                                            >
                                                                <Menu className="w-4 h-4 mr-2" />
                                                                View Menu
                                                            </Button>
                                                        </div>
                                                        {restaurant.description && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium text-gray-700">Description:</span>
                                                                <p className="text-gray-600">{restaurant.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </SidebarProvider>
          
            {/* Chatroom only for customers */}
            {currentUser?.role === 'CUSTOMER' && (
                <>
                    <AITriggerButton onToggleChatroom={toggleChatroom} />
                    <AIChatRoom 
                        isOpen={isChatroomOpen}
                        onClose={closeChatroom}
                        onMinimize={minimizeChatroom}
                        isMinimized={isChatroomMinimized}
                    />
                </>
            )}
        </>
    )
}