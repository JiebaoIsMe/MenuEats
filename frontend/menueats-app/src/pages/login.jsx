import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { testUsers } from "@/services/auth"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('[LOGIN] Attempting login for:', formData.username)
      const result = await login(formData.username, formData.password)
      
      if (result.success) {
        console.log('[LOGIN] Login successful, redirecting...')
        // Navigate based on user role
        if (result.user.role === 'CUSTOMER') {
          navigate('/customer')
        } else if (result.user.role === 'BUSINESS_OWNER') {
          navigate('/business')
        } else if (result.user.role === 'RIDER') {
          navigate('/rider')
        } else {
          navigate('/customer') // Default fallback
        }
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (error) {
      console.error('[LOGIN] Login error:', error)
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (userType) => {
    const userData = testUsers[userType]
    setFormData({
      username: userData.username,
      password: userData.password
    })
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          MenuEats
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl"> Welcome to MenuEats</CardTitle>
              <CardDescription>
                Login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </div>
                  
                  {/* Quick Login Buttons for Testing */}
                  <div className="grid gap-2">
                    <div className="text-xs text-gray-500 text-center">Quick Login (All use password: password123)</div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickLogin('customer')}
                        title="john / password123"
                      >
                        Customer
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickLogin('business')}
                        title="mario / password123"
                      >
                        Business
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickLogin('rider')}
                        title="mike / password123"
                      >
                        Rider
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Available users: john, jane, mario, bob, mike, sarah
                    </div>
                  </div>
                  
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="underline underline-offset-4">
                      Sign up
                    </a>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}