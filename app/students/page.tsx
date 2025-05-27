"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import { toast, Toaster } from "sonner"
import Navbar from "../components/navbar"

interface Student {
  _id?: string
  name: string
  rollNumber: string
  batch: string
  branch: string
  year: number
  semester: number
  email: string
  phone: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState<Student>({
    name: "",
    rollNumber: "",
    batch: "",
    branch: "",
    year: 1,
    semester: 1,
    email: "",
    phone: "",
  })

  const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"]
  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"]

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, filterBranch, filterYear])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterBranch) {
      filtered = filtered.filter((student) => student.branch === filterBranch)
    }

    if (filterYear) {
      filtered = filtered.filter((student) => student.year.toString() === filterYear)
    }

    setFilteredStudents(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStudent ? `/api/students/${editingStudent._id}` : "/api/students"
      const method = editingStudent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingStudent ? "Student updated successfully!" : "Student added successfully!")
        setIsDialogOpen(false)
        setEditingStudent(null)
        setFormData({
          name: "",
          rollNumber: "",
          batch: "",
          branch: "",
          year: 1,
          semester: 1,
          email: "",
          phone: "",
        })
        fetchStudents()
      } else {
        toast.error("Error saving student")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error saving student")
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData(student)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Student deleted successfully!")
        fetchStudents()
      } else {
        toast.error("Error deleting student")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error deleting student")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="p-6">
        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600">Manage student records by batch, branch, year, and semester</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Students</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                        <DialogDescription>
                          {editingStudent
                            ? "Update student information"
                            : "Enter student details to add them to the system"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="rollNumber">Roll Number</Label>
                          <Input
                            id="rollNumber"
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="batch">Batch</Label>
                            <Select
                              value={formData.batch}
                              onValueChange={(value) => setFormData({ ...formData, batch: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Batch" />
                              </SelectTrigger>
                              <SelectContent>
                                {batches.map((batch) => (
                                  <SelectItem key={batch} value={batch}>
                                    {batch}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="branch">Branch</Label>
                            <Select
                              value={formData.branch}
                              onValueChange={(value) => setFormData({ ...formData, branch: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((branch) => (
                                  <SelectItem key={branch} value={branch}>
                                    {branch}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="year">Year</Label>
                            <Select
                              value={formData.year.toString()}
                              onValueChange={(value) => setFormData({ ...formData, year: Number.parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="semester">Semester</Label>
                            <Select
                              value={formData.semester.toString()}
                              onValueChange={(value) => setFormData({ ...formData, semester: Number.parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st Semester</SelectItem>
                                <SelectItem value="2">2nd Semester</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingStudent ? "Update Student" : "Add Student"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Students List ({filteredStudents.length})</CardTitle>
              <CardDescription>All registered students with their academic details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {student.branch}
                        </span>
                      </TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{student.email}</div>
                          <div className="text-gray-500">{student.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => student._id && handleDelete(student._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
