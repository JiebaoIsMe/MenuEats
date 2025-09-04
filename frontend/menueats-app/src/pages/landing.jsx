import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-black">MenuEats</div>
        </div>
        
        <nav className="flex items-center gap-6">
          <Button variant="ghost" className="text-white bg-orange-400 hover:bg-orange-500 rounded-full px-6">
            Home
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:text-orange-400">
            Browse Menu
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:text-orange-400">
            Special Offers
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:text-orange-400">
            Restaurants
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:text-orange-400">
            Track Order
          </Button>
        </nav>

        <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6">
          Login/Signup
        </Button>
      </header>

      {/* Location Bar */}
      <div className="px-6 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">=�</span>
          <span className="text-gray-900">Regent Street, A4, A4201, London</span>
          <Button variant="link" className="text-orange-400 p-0 h-auto">
            Change location
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative bg-gradient-to-r from-gray-900 to-orange-400 min-h-[600px] flex items-center">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="space-y-2">
                <p className="text-lg">Order Restaurant food, takeaway and groceries.</p>
                <h1 className="text-5xl font-bold leading-tight">
                  Feast Your Senses,<br />
                  <span className="text-orange-400">Fast and Fresh</span>
                </h1>
              </div>
              
              <p className="text-gray-300">Enter a postcode to see what we deliver</p>
              
              <div className="flex gap-3 max-w-md">
                <Input 
                  placeholder="e.g. EC4R 3TE"
                  className="bg-white text-black border-0 rounded-full px-4"
                />
                <Button className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-8">
                  Search
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-lg ml-auto max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400 font-semibold">Orders</span>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  <p className="text-sm font-medium">We've Received your order!</p>
                  <p className="text-xs text-gray-500">Awaiting Restaurant acceptance</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-lg ml-auto max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400 font-semibold">Orders</span>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Order Accepted!</p>
                    <span className="text-green-500"></span>
                  </div>
                  <p className="text-xs text-gray-500">Your order will be delivered shortly</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-lg ml-auto max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400 font-semibold">Orders</span>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  <p className="text-sm font-medium">Your rider's nearby </p>
                  <p className="text-xs text-gray-500">They're almost there get ready!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exclusive Deals Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Up to -40% 🔥 MenuEats exclusive deals</h2>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-sm">Vegan</Button>
              <Button variant="ghost" className="text-sm">Sushi</Button>
              <Button variant="default" className="text-sm bg-orange-100 text-orange-600 hover:bg-orange-200">Pizza & Fast food</Button>
              <Button variant="ghost" className="text-sm">others</Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/200" alt="Chef Burgers London" className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4 bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium">-40%</div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-medium">Restaurant</span>
                <p className="text-white font-semibold mt-1">Chef Burgers London</p>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/200" alt="Grand Ai Cafe London" className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4 bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium">-20%</div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-medium">Restaurant</span>
                <p className="text-white font-semibold mt-1">Grand Ai Cafe London</p>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/200" alt="Butterbrot Caf's London" className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4 bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium">-17%</div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-medium">Restaurant</span>
                <p className="text-white font-semibold mt-1">Butterbrot Caf's London</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner and Rider Sections */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden p-8 text-white">
              <div className="absolute top-4 left-4 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium">
                Earn more with lower fees
              </div>
              <div className="mt-8">
                <div className="text-orange-400 text-sm font-medium mb-2">Signup as a business</div>
                <h3 className="text-3xl font-bold mb-6">Partner with us</h3>
                <Button className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-6">
                  Get Started
                </Button>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg overflow-hidden p-8 text-white">
              <div className="absolute top-4 left-4 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium">
                Avail exclusive perks
              </div>
              <div className="mt-8">
                <div className="text-gray-900 text-sm font-medium mb-2">Signup as a rider</div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Ride with us</h3>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-orange-400 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold">546+</div>
              <div className="text-sm opacity-90">Registered Riders</div>
            </div>
            <div>
              <div className="text-4xl font-bold">789,900+</div>
              <div className="text-sm opacity-90">Orders Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold">690+</div>
              <div className="text-sm opacity-90">Restaurants Partnered</div>
            </div>
            <div>
              <div className="text-4xl font-bold">17,457+</div>
              <div className="text-sm opacity-90">Food items</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-black mb-4">MenuEats</div>
              <div className="flex gap-2 mb-4">
                <img src="/api/placeholder/120/40" alt="App Store" className="h-10" />
                <img src="/api/placeholder/120/40" alt="Google Play" className="h-10" />
              </div>
              <p className="text-sm text-gray-600">
                Company # 490039-445, Registered with
                House of companies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Get Exclusive Deals in your inbox</h4>
              <div className="flex gap-2 mb-4">
                <Input placeholder="youremail@gmail.com" className="text-sm" />
                <Button className="bg-orange-400 hover:bg-orange-500 text-white px-4">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                we wont spam, read our email policy
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal Pages</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-400">Terms and conditions</a></li>
                <li><a href="#" className="hover:text-orange-400">Privacy</a></li>
                <li><a href="#" className="hover:text-orange-400">Cookies</a></li>
                <li><a href="#" className="hover:text-orange-400">Modern Slavery Statement</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Important Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-400">Get help</a></li>
                <li><a href="#" className="hover:text-orange-400">Add your restaurant</a></li>
                <li><a href="#" className="hover:text-orange-400">Sign up to deliver</a></li>
                <li><a href="#" className="hover:text-orange-400">Create a business account</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <p>Order.uk Copyright 2024, All Rights Reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-orange-400">Privacy Policy</a>
                <a href="#" className="hover:text-orange-400">Terms</a>
                <a href="#" className="hover:text-orange-400">Pricing</a>
                <a href="#" className="hover:text-orange-400">Do not sell or share my personal information</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}