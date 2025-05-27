"use client"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, BarChart3, Calendar, TrendingUp, ChevronRight, Star, Zap, Shield } from "lucide-react"
import Link from "next/link"
import Navbar from "./components/navbar"

// Custom Logo Component
const EduMarksLogo = ({ size = "h-8 w-8" }) => (
  <div className={`${size} relative`}>
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.3"/>
      <path d="M12 15 L20 10 L28 15 L28 25 L20 30 L12 25 Z" fill="url(#logoGradient)" filter="url(#glow)"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
      <circle cx="16" cy="18" r="1" fill="white" opacity="0.8"/>
      <circle cx="24" cy="18" r="1" fill="white" opacity="0.8"/>
      <circle cx="20" cy="25" r="1" fill="white" opacity="0.6"/>
    </svg>
  </div>
)

// Floating Animation Component
const FloatingElement = ({
  children,
  delay = 0,
  duration = 6,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) => (
  <div 
    className="animate-float"
    style={{
      animation: `float ${duration}s ease-in-out infinite ${delay}s`
    }}
  >
    {children}
  </div>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-blue-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-200/10 to-blue-200/10 rounded-full blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-300/15 to-pink-300/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-r from-green-300/15 to-cyan-300/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-32 right-10 w-28 h-28 bg-gradient-to-r from-orange-300/20 to-red-300/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-gray-300/20 rotate-45 animate-spin" style={{animationDuration: '15s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-gray-200/10 rotate-12 animate-ping" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/4 right-1/2 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400/40 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse" style={{animationDelay: '3.5s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-100/10 to-purple-100/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-100/10 to-pink-100/10"></div>
      </div>

      {/* Header
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg fixed w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <EduMarksLogo size="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduMarks
                </h1>
                <p className="text-sm text-blue-600/80">Engineering Excellence</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center space-x-8">
              {['Students', 'Subjects', 'Marks', 'Reports'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
              <Link href="/signin">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow-sm hover:shadow-blue-500/30 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </nav>
            <button className="lg:hidden text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="relative z-10 h-screen flex items-start justify-center pt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center relative">
            {/* Floating background elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -top-10 -right-16 w-32 h-32 bg-gradient-to-r from-pink-300/20 to-blue-300/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute -bottom-16 -left-12 w-28 h-28 bg-gradient-to-r from-purple-300/20 to-cyan-300/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Main content */}
            <FloatingElement delay={0}>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-full border border-gray-300/30 text-gray-900 mb-8 shadow-xl">
                <Zap className="h-5 w-5 mr-3 text-yellow-500 animate-pulse" />
                <span className="font-medium">Next-Gen Academic Management</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent animate-gradient-x mt-2">
                  Academic Excellence
                </span>
              </h1>
            </FloatingElement>
            
            <FloatingElement delay={0.3}>
              <p className="text-xl lg:text-2xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
                Designed for <span className="font-semibold text-blue-600">teachers in mind</span>, this powerful exam management system simplifies 
                recording, organizing, and analyzing student marks. Effortlessly manage class tests, mids, and semester exams 
                by batch, branch, and subject—<span className="font-semibold text-purple-600">all in one place</span>.
              </p>
            </FloatingElement>
            
            <FloatingElement delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/students">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110 group border border-gray-300/20"
                  >
                    Start Your Journey
                    <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="text-gray-600 text-sm font-medium">
                  ✨ No setup required • Instant access
                </div>
              </div>
            </FloatingElement>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent animate-gradient-x mb-4">
              Features of Our EduMarks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to manage your engineering college</p>
            <div className="py-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: <Users className="h-6 w-6 text-gray-900" />, 
                title: "Smart Student Management", 
                description: "AI-powered student profiles with advanced analytics.", 
                color: "from-blue-500 to-cyan-500", 
                bgColor: "bg-blue-500/10", 
                link: "/students" 
              },
              { 
                icon: <BookOpen className="h-6 w-6 text-gray-900" />, 
                title: "Dynamic Subject Hub", 
                description: "Intelligent subject configuration with automated mapping.", 
                color: "from-green-500 to-emerald-500", 
                bgColor: "bg-green-500/10", 
                link: "/subjects" 
              },
              { 
                icon: <Award className="h-6 w-6 text-gray-900" />, 
                title: "Advanced Marks System", 
                description: "Real-time mark entry with intelligent grade calculations.", 
                color: "from-purple-500 to-pink-500", 
                bgColor: "bg-purple-500/10", 
                link: "/marks" 
              },
              { 
                icon: <BarChart3 className="h-6 w-6 text-gray-900" />, 
                title: "Analytics Dashboard", 
                description: "Comprehensive reporting with predictive analytics.", 
                color: "from-orange-500 to-red-500", 
                bgColor: "bg-orange-500/10", 
                link: "/reports" 
              },
              { 
                icon: <Calendar className="h-6 w-6 text-gray-900" />, 
                title: "Smart Scheduling", 
                description: "Automated exam scheduling with conflict resolution.", 
                color: "from-red-500 to-pink-500", 
                bgColor: "bg-red-500/10", 
                link: "/exams" 
              },
              { 
                icon: <TrendingUp className="h-6 w-6 text-gray-900" />, 
                title: "Performance Tracking", 
                description: "Real-time monitoring with trend analysis.", 
                color: "from-indigo-500 to-purple-500", 
                bgColor: "bg-indigo-500/10", 
                link: "/dashboard" 
              }
            ].map((feature, index) => (
              <FloatingElement key={index} delay={index * 0.2}>
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative flex flex-col justify-center items-center min-h-[250px] p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/20 group-hover:to-purple-100/20 transition-opacity duration-500"></div>
                  <div className="relative z-10 text-center">
                    <div className={`w-12 h-12 ${feature.bgColor} backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-gray-600 mb-4">{feature.description}</CardDescription>
                    <Link href={feature.link}>
                      <Button 
                        variant="default" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-base font-semibold rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 group border border-gray-300/20"
                      >
                        Explore <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </FloatingElement>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer for Gap */}
      <div className="py-8"></div>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-gray-200/50 shadow-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Students Managed", icon: Users, color: "from-blue-400 to-cyan-400" },
                { number: "500+", label: "Subjects Configured", icon: BookOpen, color: "from-green-400 to-emerald-400" },
                { number: "50K+", label: "Exams Conducted", icon: Award, color: "from-purple-400 to-pink-400" },
                { number: "99.9%", label: "Data Accuracy", icon: Shield, color: "from-orange-400 to-red-400" }
              ].map((stat, index) => (
                <FloatingElement key={index} delay={index * 0.3}>
                  <div className="space-y-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto opacity-80`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </FloatingElement>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for Gap */}
      <div className="py-8"></div>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50 shadow-lg">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of educators who trust EduMarks for their academic management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for Gap */}
      <div className="py-8"></div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/90 backdrop-blur-xl border-t border-gray-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <EduMarksLogo size="h-10 w-10" />
              <div>
                <h3 className="text-xl font-bold text-white">EduMarks</h3>
                <p className="text-gray-300">Engineering Excellence Platform</p>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-gray-300">
                © 2025 EduMarks. Empowering Education Through Technology.
              </p>
              <div className="flex justify-center lg:justify-end space-x-6 mt-4">
                <Link href="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-blue-400 transition-colors">Terms</Link>
                <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}