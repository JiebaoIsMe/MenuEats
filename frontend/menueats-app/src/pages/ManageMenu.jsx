import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"
import { Menu, Edit, Plus, Save, X, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'

const BASE_URL = 'http://localhost:8084/api/users'

export default function ManageMenu() {
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const navigate = useNavigate()
    const location = useLocation()
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)
    
    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingItems, setEditingItems] = useState(new Set())
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'main',
        available: true
    })

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

    // Load owner's restaurants
    const loadRestaurants = async () => {
        if (!currentUser || currentUser.role !== 'BUSINESS_OWNER') {
            console.log('[ManageMenu] No valid business owner user found')
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
            console.log('[ManageMenu] Loaded restaurants:', data)
            const restaurantList = Array.isArray(data) ? data : []
            setRestaurants(restaurantList)
            
            // Check if a specific restaurant was passed via navigation state
            const stateRestaurantId = location.state?.restaurantId
            let targetRestaurant = null
            
            if (stateRestaurantId) {
                targetRestaurant = restaurantList.find(r => r.id === stateRestaurantId)
            }
            
            // Use the restaurant from navigation state, or auto-select first restaurant if available
            if (targetRestaurant) {
                setSelectedRestaurant(targetRestaurant)
                loadMenuItems(targetRestaurant.id)
            } else if (restaurantList.length > 0) {
                setSelectedRestaurant(restaurantList[0])
                loadMenuItems(restaurantList[0].id)
            }
        } catch (error) {
            console.error('[ManageMenu] Failed to load restaurants:', error)
            setError('Failed to load restaurants')
            setRestaurants([])
        } finally {
            setLoading(false)
        }
    }

    // Load menu items for selected restaurant via user-service proxy
    const loadMenuItems = async (restaurantId) => {
        if (!currentUser) return
        
        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants/${restaurantId}/menu`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('[ManageMenu] Loaded menu items:', data)
            setMenuItems(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('[ManageMenu] Failed to load menu items:', error)
            setMenuItems([])
        }
    }

    // Create new menu item
    const createMenuItem = async () => {
        if (!currentUser || !selectedRestaurant) return

        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants/${selectedRestaurant.id}/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log('[ManageMenu] Menu item created:', data)
            
            toast({
                title: "Success",
                description: "Menu item created successfully!"
            })
            
            setShowCreateForm(false)
            resetForm()
            loadMenuItems(selectedRestaurant.id)
        } catch (error) {
            console.error('[ManageMenu] Failed to create menu item:', error)
            toast({
                title: "Error",
                description: "Failed to create menu item. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Update menu item
    const updateMenuItem = async (menuItemId, itemData) => {
        if (!currentUser || !selectedRestaurant) return

        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants/${selectedRestaurant.id}/menu/${menuItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...itemData,
                    price: parseFloat(itemData.price)
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log('[ManageMenu] Menu item updated:', data)
            
            toast({
                title: "Success",
                description: "Menu item updated successfully!"
            })
            
            stopEditing(menuItemId)
            loadMenuItems(selectedRestaurant.id)
        } catch (error) {
            console.error('[ManageMenu] Failed to update menu item:', error)
            toast({
                title: "Error",
                description: "Failed to update menu item. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Delete menu item
    const deleteMenuItem = async (menuItemId) => {
        if (!currentUser || !selectedRestaurant) return

        try {
            const response = await fetch(`${BASE_URL}/${currentUser.id}/restaurants/${selectedRestaurant.id}/menu/${menuItemId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            console.log('[ManageMenu] Menu item deleted:', menuItemId)
            
            toast({
                title: "Success",
                description: "Menu item deleted successfully!"
            })
            
            loadMenuItems(selectedRestaurant.id)
        } catch (error) {
            console.error('[ManageMenu] Failed to delete menu item:', error)
            toast({
                title: "Error",
                description: "Failed to delete menu item. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Start editing menu item
    const startEditing = (menuItem) => {
        setEditingItems(prev => new Set([...prev, menuItem.id]))
    }

    // Stop editing menu item
    const stopEditing = (menuItemId) => {
        setEditingItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(menuItemId)
            return newSet
        })
    }

    // Toggle item selection
    const toggleItemSelection = (menuItemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(menuItemId)) {
                newSet.delete(menuItemId)
            } else {
                newSet.add(menuItemId)
            }
            return newSet
        })
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'main',
            available: true
        })
    }

    // Handle restaurant selection
    const handleRestaurantChange = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === parseInt(restaurantId))
        setSelectedRestaurant(restaurant)
        if (restaurant) {
            loadMenuItems(restaurant.id)
        }
        setSelectedItems(new Set())
        setEditingItems(new Set())
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
                                    <h1 className="text-2xl font-bold">Manage Menu</h1>
                                </div>
                                <div className="flex items-center gap-4">
                                    {selectedItems.size > 0 && (
                                        <span className="text-sm text-gray-600">
                                            {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                                        </span>
                                    )}
                                    <Button 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                        onClick={() => setShowCreateForm(true)}
                                        disabled={!selectedRestaurant}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Item
                                    </Button>
                                </div>
                            </div>
                            <p className="text-gray-600">Manage menu items for your restaurants</p>
                        </div>

                        {/* Restaurant Selection */}
                        {restaurants.length > 0 && (
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Label className="text-sm font-medium">Select Restaurant:</Label>
                                        <Select 
                                            value={selectedRestaurant?.id?.toString() || ''} 
                                            onValueChange={handleRestaurantChange}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Choose a restaurant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {restaurants.map((restaurant) => (
                                                    <SelectItem 
                                                        key={restaurant.id} 
                                                        value={restaurant.id.toString()}
                                                    >
                                                        {restaurant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Create Menu Item Form */}
                        {showCreateForm && selectedRestaurant && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Add New Menu Item</span>
                                        <Button variant="ghost" onClick={() => {
                                            setShowCreateForm(false)
                                            resetForm()
                                        }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Item Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="Enter item name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="price">Price ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="entree">Entree</SelectItem>
                                                    <SelectItem value="main">Main</SelectItem>
                                                    <SelectItem value="dessert">Dessert</SelectItem>
                                                    <SelectItem value="drink">Drink</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="available"
                                                checked={formData.available}
                                                onCheckedChange={(checked) => setFormData({...formData, available: checked})}
                                            />
                                            <Label htmlFor="available">Available</Label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Enter item description"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => {
                                            setShowCreateForm(false)
                                            resetForm()
                                        }}>Cancel</Button>
                                        <Button 
                                            onClick={createMenuItem}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Menu Items List */}
                        <div className="space-y-4">
                            {loading ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading menu items...</p>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-red-500">
                                        <p>{error}</p>
                                        <Button onClick={loadRestaurants} className="mt-4">Retry</Button>
                                    </CardContent>
                                </Card>
                            ) : !selectedRestaurant ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-500">
                                        <Menu className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p>No restaurant selected</p>
                                        <p className="text-sm">Please select a restaurant to manage its menu</p>
                                    </CardContent>
                                </Card>
                            ) : menuItems.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-500">
                                        <Menu className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p>No menu items found</p>
                                        <p className="text-sm mb-4">Add your first menu item to get started</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {selectedItems.size > 0 && (
                                        <Card className="border-yellow-200 bg-yellow-50">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => setSelectedItems(new Set())}
                                                        >
                                                            Clear Selection
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => {
                                                                selectedItems.forEach(itemId => deleteMenuItem(itemId))
                                                                setSelectedItems(new Set())
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Selected
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    
                                    {menuItems.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            isEditing={editingItems.has(item.id)}
                                            isSelected={selectedItems.has(item.id)}
                                            onEdit={() => startEditing(item)}
                                            onSave={(data) => updateMenuItem(item.id, data)}
                                            onCancel={() => stopEditing(item.id)}
                                            onDelete={() => deleteMenuItem(item.id)}
                                            onToggleSelect={() => toggleItemSelection(item.id)}
                                        />
                                    ))}
                                </>
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

// Menu Item Card Component
function MenuItemCard({ item, isEditing, isSelected, onEdit, onSave, onCancel, onDelete, onToggleSelect }) {
    const [editData, setEditData] = useState({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        category: item.category || 'main',
        available: item.available ?? true
    })

    useEffect(() => {
        if (isEditing) {
            setEditData({
                name: item.name || '',
                description: item.description || '',
                price: item.price?.toString() || '',
                category: item.category || 'main',
                available: item.available ?? true
            })
        }
    }, [isEditing, item])

    const handleSave = () => {
        onSave(editData)
    }

    const getCategoryColor = (category) => {
        switch (category) {
            case 'entree': return 'bg-blue-100 text-blue-800'
            case 'main': return 'bg-green-100 text-green-800'
            case 'dessert': return 'bg-purple-100 text-purple-800'
            case 'drink': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}>
            <CardContent className="p-6">
                {isEditing ? (
                    // Edit Form
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Item Name</Label>
                                <Input
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editData.price}
                                    onChange={(e) => setEditData({...editData, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select value={editData.category} onValueChange={(value) => setEditData({...editData, category: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="entree">Entree</SelectItem>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="dessert">Dessert</SelectItem>
                                        <SelectItem value="drink">Drink</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    checked={editData.available}
                                    onCheckedChange={(checked) => setEditData({...editData, available: checked})}
                                />
                                <Label>Available</Label>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={onCancel}>Cancel</Button>
                            <Button 
                                onClick={handleSave}
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
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                                <Checkbox 
                                    checked={isSelected}
                                    onCheckedChange={onToggleSelect}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                                            {item.category}
                                        </span>
                                        {item.available ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>ID: {item.id}</span>
                                        <span className="font-semibold text-yellow-600">${item.price?.toFixed(2)}</span>
                                        <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}