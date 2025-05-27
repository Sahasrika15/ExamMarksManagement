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
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react"
import { toast, Toaster } from "sonner"
import Navbar from "../components/navbar"

interface Subject {
  _id?: string
  name: string
  code: string
  branch: string
  year: number
  semester: number
  credits: number
  type: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [filterBranch, setFilterBranch] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState<Subject>({
    name: "",
    code: "",
    branch: "",
    year: 1,
    semester: 1,
    credits: 3,
    type: "Theory",
  })

  const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"]
  const subjectTypes = ["Theory", "Laboratory", "Project"]

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, filterBranch, filterYear])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const filterSubjects = () => {
    let filtered = subjects

    if (filterBranch) {
      filtered = filtered.filter((subject) => subject.branch === filterBranch)
    }

    if (filterYear) {
      filtered = filtered.filter((subject) => subject.year.toString() === filterYear)
    }

    setFilteredSubjects(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingSubject ? `/api/subjects/${editingSubject._id}` : "/api/subjects"
      const method = editingSubject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingSubject ? "Subject updated successfully!" : "Subject added successfully!")
        setIsDialogOpen(false)
        setEditingSubject(null)
        setFormData({
          name: "",
          code: "",
          branch: "",
          year: 1,
          semester: 1,
          credits: 3,
          type: "Theory",
        })
        fetchSubjects()
      } else {
        toast.error("Error saving subject")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error saving subject")
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData(subject)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Subject deleted successfully!")
        fetchSubjects()
      } else {
        toast.error("Error deleting subject")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error deleting subject")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="p-6">
        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
                <p className="text-gray-600">Configure subjects for each branch and semester</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter & Add Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
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
                      <Button className="bg-gradient-to-r from-green-600 to-teal-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                        <DialogDescription>
                          {editingSubject
                            ? "Update subject information"
                            : "Enter subject details to add to the curriculum"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Subject Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Data Structures and Algorithms"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Subject Code</Label>
                          <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g., CS201"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjectTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="year">Year</Label>
                            <Select
                              value={formData.year.toString()}
                              onValueChange={(value) => setFormData({ ...formData, year: Number.parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st</SelectItem>
                                <SelectItem value="2">2nd</SelectItem>
                                <SelectItem value="3">3rd</SelectItem>
                                <SelectItem value="4">4th</SelectItem>
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
                                <SelectValue placeholder="Sem" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st</SelectItem>
                                <SelectItem value="2">2nd</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="credits">Credits</Label>
                            <Input
                              id="credits"
                              type="number"
                              min="1"
                              max="6"
                              value={formData.credits}
                              onChange={(e) => setFormData({ ...formData, credits: Number.parseInt(e.target.value) })}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          {editingSubject ? "Update Subject" : "Add Subject"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects List ({filteredSubjects.length})</CardTitle>
              <CardDescription>All configured subjects with their academic details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                          {subject.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {subject.branch}
                        </span>
                      </TableCell>
                      <TableCell>{subject.year}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            subject.type === "Theory"
                              ? "bg-blue-100 text-blue-800"
                              : subject.type === "Laboratory"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {subject.type}
                        </span>
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => subject._id && handleDelete(subject._id)}>
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
