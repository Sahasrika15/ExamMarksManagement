"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Lock, User, Mail, Eye, EyeOff, Sparkles, BookOpen, TrendingUp, Shield } from "lucide-react"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Base URL for the Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function LoginPage() {
  const [loginType, setLoginType] = useState("faculty")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    facultyId: "",
    department: "",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (loginType === "faculty") {
      if (!formData.facultyId) {
        toast.error("Faculty ID is required for faculty login.");
        return;
      }
      if (!formData.department) {
        toast.error("Department is required for faculty login.");
        return;
      }
    }

    if (loginType === "hod" && !formData.department) {
      toast.error("Department is required for HOD login.");
      return;
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          loginType,
          facultyId: formData.facultyId,
          department: formData.department,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (typeof window !== 'undefined') {
          // Store token and user data
          if (rememberMe) {
            window.localStorage.setItem('token', data.token)
            window.localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            window.sessionStorage.setItem('token', data.token)
            window.sessionStorage.setItem('user', JSON.stringify(data.user))
          }
        }
        toast.success(`Welcome back, ${data.user.name || 'User'}!`)
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toast.error(data.message || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "Administration"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements - lighter */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 right-0 w-60 h-60 bg-gradient-to-r from-pink-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gradient-to-r from-emerald-200/15 to-blue-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}>
        </div>
      </div>

      <Toaster position="top-right" />

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Centered with smaller fonts */}
        <div className="hidden lg:block">
          <div className="text-center space-y-6">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg">
                  <GraduationCap className="h-10 w-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-black text-gray-800 mb-1">EduMarks</h1>
                <p className="text-sm text-purple-600 font-medium">Engineering Excellence</p>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl lg:text-3xl font-black text-gray-800 leading-tight">
                Welcome to the
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  Future of Education
                </span>
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                Experience next-generation academic management with AI-powered insights,
                real-time analytics, and seamless collaboration tools.
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="space-y-4 max-w-md mx-auto">
              <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold text-sm">Smart Student Management</h3>
                  <p className="text-gray-600 text-xs">AI-powered student tracking and analytics</p>
                </div>
              </div>

              <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold text-sm">Advanced Analytics</h3>
                  <p className="text-gray-600 text-xs">Real-time performance insights and reports</p>
                </div>
              </div>

              <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold text-sm">Secure Cloud Platform</h3>
                  <p className="text-gray-600 text-xs">Enterprise-grade security and reliability</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-6 mt-8">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">50K+</div>
                <div className="text-xs text-gray-600">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">500+</div>
                <div className="text-xs text-gray-600">Faculty Members</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">99.9%</div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form without gradient border */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 overflow-hidden">
            {/* Card Header without gradient border */}
            <CardHeader className="pb-8">
              <div className="flex items-center justify-center mb-6 lg:hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-lg">
                  <GraduationCap className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 text-center">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 text-center text-lg">
                Sign in to access your academic dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {/* Login Type Selection with enhanced design */}
              <div className="space-y-3">
                <Label htmlFor="loginType" className="text-base font-semibold text-gray-700">Login As</Label>
                <Select value={loginType} onValueChange={setLoginType}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200">
                    <SelectValue placeholder="Select login type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">👨‍🏫 Faculty Member</SelectItem>
                    <SelectItem value="admin">👔 Administrator</SelectItem>
                    <SelectItem value="hod">🎓 Head of Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Enhanced Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 pl-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-semibold text-gray-700">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 pl-12 pr-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Faculty ID (for faculty login) */}
                {loginType === "faculty" && (
                  <div className="space-y-2">
                    <Label htmlFor="facultyId" className="text-base font-semibold text-gray-700">Faculty ID</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                      <Input
                        id="facultyId"
                        placeholder="Enter your faculty ID"
                        value={formData.facultyId}
                        onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                        className="h-12 pl-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Department (for faculty and HOD) */}
                {(loginType === "faculty" || loginType === "hod") && (
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-base font-semibold text-gray-700">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-2 border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 font-medium">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>

                {/* Enhanced Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </Button>
              </form>

              {/* Enhanced Demo Credentials */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-purple-100">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Demo Credentials
                </h4>
                <div className="text-sm text-gray-700 space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <strong>Faculty:</strong>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">faculty@college.edu / facultyPass123</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <strong>Admin:</strong>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">admin@college.edu / admin123</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <strong>HOD:</strong>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">hod@college.edu / hod123</code>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="text-center pt-4">
                <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                  <span>←</span>
                  <span>Back to Home</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}