import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Heart, 
  Users, 
  Stethoscope, 
  Shield, 
  Zap, 
  Lock, 
  Star, 
  ArrowRight, 
  Activity, 
  Brain,
  Pill,
  Calendar,
  BarChart3,
  CheckCircle,
  Globe,
  Smartphone,
  Clock,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">HealthID</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">Home</a>
              <a href="#services" className="text-gray-600 hover:text-orange-500 transition-colors">Services</a>
              <a href="#about" className="text-gray-600 hover:text-orange-500 transition-colors">About us</a>
              <a href="#contact" className="text-gray-600 hover:text-orange-500 transition-colors">Contact</a>
              <Link href="/patient/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Our Healthcare<br />
                  <span className="text-gray-700">Solutions Meet</span><br />
                  <span className="text-gray-700">Every Need</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                  With a team of experienced professionals and cutting-edge 
                  technology, we strive to empower individuals to achieve optimal health and well-being.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/patient/register">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium">
                    Get Started
                  </Button>
                </Link>
                <Link href="/doctor/register">
                  <Button variant="secondary" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-medium">
                    Join as Doctor
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1">400+</div>
                  <div className="text-gray-600 text-sm">Expert Doctor</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1">500+</div>
                  <div className="text-gray-600 text-sm">Recover Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1">97%</div>
                  <div className="text-gray-600 text-sm">Satisfied Rate</div>
                </div>
              </div>
            </div>

            {/* Right Content - Healthcare Professionals Image */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 rounded-3xl p-8 overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-orange-400 rounded-full opacity-80"></div>
                <div className="absolute top-20 left-4 w-12 h-12 bg-teal-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 right-20 w-8 h-8 bg-blue-400 rounded-full opacity-70"></div>
                
                {/* Healthcare professionals placeholder */}
                <div className="relative z-10 flex items-center justify-center h-96">
                  <div className="flex space-x-4">
                    <div className="w-32 h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Stethoscope className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-xs text-gray-600">Doctor</div>
                      </div>
                    </div>
                    <div className="w-32 h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center mt-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-xs text-gray-600">Nurse</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Call Us */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-2">Need to speak to our experts?</p>
              <p className="text-orange-500 font-medium">+1 (555) 000-0000</p>
            </div>

            {/* Book an Appointment */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book an Appointment</h3>
              <p className="text-gray-600 text-sm mb-2">Get expert care today</p>
              <p className="text-orange-500 font-medium">HealthIDexpert.com</p>
            </div>

            {/* Visit Us */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-2">Come visit our clinic</p>
              <p className="text-orange-500 font-medium">100 Smith Street PO, 2020 Aus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Care Tools */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Care Tools That<br />
                Are Innovative
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Discover our innovative healthcare tools designed to provide comprehensive 
                care and support for your health journey with cutting-edge technology.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Healthcare Facility</span>
                </div>
                <p className="text-gray-600 text-sm ml-8">Advanced medical equipment and modern facilities for optimal care.</p>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Medical Devices</span>
                </div>
                <p className="text-gray-600 text-sm ml-8">State-of-the-art medical devices for accurate diagnosis and treatment.</p>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced Technologies</span>
                </div>
                <p className="text-gray-600 text-sm ml-8">Cutting-edge medical technology and AI-powered health insights.</p>
              </div>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full">
                Learn More
              </Button>
            </div>

            {/* Right Side - Medical Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 text-sm font-medium">Monitoring</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Stethoscope className="w-10 h-10 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 text-sm font-medium">Diagnosis</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                    <p className="text-purple-700 text-sm font-medium">AI Analysis</p>
                  </div>
                </div>
                <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-orange-700 text-sm font-medium">Treatment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Healthier Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Medical Services Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-teal-600 mx-auto mb-2" />
                    <p className="text-teal-700 font-medium">Pediatrics</p>
                    <p className="text-teal-600 text-xs">Child Healthcare</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Stethoscope className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 font-medium">Medicine</p>
                    <p className="text-blue-600 text-xs">General Practice</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-green-600 mx-auto mb-1" />
                    <p className="text-green-700 text-sm font-medium">Neurology</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Healthier with Our<br />
                Medical Clinic
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Pediatrics</h3>
                      <p className="text-gray-600 text-sm">
                        Comprehensive healthcare services for children with specialized pediatric care 
                        and child-friendly environment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Medicine</h3>
                      <p className="text-gray-600 text-sm">
                        Advanced diagnostic technology and expert care for comprehensive 
                        medical treatment and health monitoring.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Neurology</h3>
                      <p className="text-gray-600 text-sm">
                        Specialized neurological care with the latest brain health technologies 
                        and expert neurological assessment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HealthID</span>
              </div>
              <p className="text-gray-400 mb-4">
                Advanced healthcare management for the modern world.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/patient/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/patient/login" className="hover:text-white transition-colors">Patient Login</Link></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Health Dashboard</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">QR Access</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/doctor/register" className="hover:text-white transition-colors">Join Platform</Link></li>
                <li><Link href="/doctor/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Practice Analytics</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">QR Scanning</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 000-0000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>100 Smith Street PO, 2020 Aus</span>
                </li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthID. All rights reserved. Built with ❤️ for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
