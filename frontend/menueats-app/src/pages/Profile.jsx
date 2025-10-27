import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"
import { User, Mail, Phone, MapPin, Building, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const navigate = useNavigate()
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)
    
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    // Load user profile data
    const loadUserProfile = async () => {
        if (!currentUser) {
            console.log('[Profile] No current user found')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            // Get user information from user service
            const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('[Profile] Loaded user profile:', data)
            setUserProfile(data)
        } catch (error) {
            console.error('[Profile] Failed to load user profile:', error)
            setError('Failed to load profile information')
            
            // Fallback to current user data if API fails
            setUserProfile(currentUser)
        } finally {
            setLoading(false)
        }
    }

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'BUSINESS_OWNER':
                return 'bg-yellow-100 text-yellow-800'
            case 'CUSTOMER':
                return 'bg-blue-100 text-blue-800'
            case 'RIDER':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Load data on component mount
    useEffect(() => {
        loadUserProfile()
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
                                    <h1 className="text-2xl font-bold">User Profile</h1>
                                </div>
                            </div>
                            <p className="text-gray-600">View your account information</p>
                        </div>

                        {/* Profile Information */}
                        <div className="max-w-4xl">
                            {loading ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading profile...</p>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-red-500">
                                        <p>{error}</p>
                                        <Button onClick={loadUserProfile} className="mt-4">Retry</Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-yellow-500" />
                                                Basic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">User ID</label>
                                                    <p className="text-gray-900">{userProfile?.id || 'Not available'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Username</label>
                                                    <p className="text-gray-900">{userProfile?.username || 'Not available'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-500" />
                                                        <p className="text-gray-900">{userProfile?.email || 'Not available'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-gray-500" />
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userProfile?.role)}`}>
                                                            {userProfile?.role?.replace('_', ' ') || 'Not available'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${userProfile?.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        <p className="text-gray-900">{userProfile?.active ? 'Active' : 'Inactive'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Contact Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Phone className="w-5 h-5 text-yellow-500" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <Mail className="w-5 h-5 text-yellow-500" />
                                                        <p className="text-gray-900 font-medium">{userProfile?.email || 'Not available'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <Phone className="w-5 h-5 text-yellow-500" />
                                                        <p className="text-gray-900 font-medium">{userProfile?.userProfile?.phone || 'Not available'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Address Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-yellow-500" />
                                                Address Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <MapPin className="w-5 h-5 text-yellow-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-gray-900 font-medium">{userProfile?.userProfile?.address || 'Not available'}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {userProfile?.userProfile?.city || 'City not available'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Personal Details */}
                                    {userProfile?.userProfile && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="w-5 h-5 text-yellow-500" />
                                                    Personal Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                                        <p className="text-gray-900 p-2 bg-gray-50 rounded">{userProfile.userProfile.firstName || 'Not available'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                                        <p className="text-gray-900 p-2 bg-gray-50 rounded">{userProfile.userProfile.lastName || 'Not available'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Account Statistics */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-yellow-500" />
                                                Account Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700">Account Type</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {userProfile?.role === 'BUSINESS_OWNER' ? 'Business Owner' :
                                                         userProfile?.role === 'CUSTOMER' ? 'Customer' :
                                                         userProfile?.role === 'RIDER' ? 'Delivery Rider' : 'User'}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700">Status</p>
                                                    <p className={`text-lg font-semibold ${userProfile?.active ? 'text-green-600' : 'text-red-600'}`}>
                                                        {userProfile?.active ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700">User ID</p>
                                                    <p className="text-lg font-semibold text-gray-900">#{userProfile?.id}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
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