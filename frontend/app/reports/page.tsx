"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { toast, Toaster } from "sonner";

// Dynamically import Navbar to avoid SSR issues
const Navbar = dynamic(() => import("@/app/components/navbar"), { ssr: false });

// Base URL for the Express API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  batch: string;
  branch: string;
  year: number;
  semester: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Mark {
  _id: string;
  studentId: string;
  subjectId: string;
  examType: string;
  maxMarks: number;
  scoredMarks: number;
  student: Student;
  subject: Subject;
}

export default function ReportsPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all"); // Updated from ""
  const [selectedSemester, setSelectedSemester] = useState("all"); // Updated from ""
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");

  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];
  const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const examTypes = [
    { value: "all", label: "All Exams" },
    { value: "CT", label: "CT (Internal)" },
    { value: "Mid 1", label: "Mid 1 (Internal)" },
    { value: "Mid 2", label: "Mid 2 (Internal)" },
    { value: "Semester Exam", label: "Semester Exam (External)" },
    { value: "Internal Lab", label: "Internal Lab (Lab)" },
    { value: "External Lab", label: "External Lab (Lab)" },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedBatch, selectedBranch, selectedYear, selectedSemester, selectedStudent, selectedSubject, selectedExamType]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
      if (!token) {
        toast.error("Please log in to access reports");
        setIsLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (selectedBatch !== "all") queryParams.append("batch", selectedBatch);
      if (selectedBranch !== "all") queryParams.append("branch", selectedBranch);
      if (selectedYear && selectedYear !== "all") queryParams.append("year", selectedYear);
      if (selectedSemester && selectedSemester !== "all") queryParams.append("semester", selectedSemester);
      if (selectedStudent !== "all") queryParams.append("studentId", selectedStudent);
      if (selectedSubject !== "all") queryParams.append("subjectId", selectedSubject);
      if (selectedExamType !== "all") queryParams.append("examType", selectedExamType);

      const response = await fetch(`${API_BASE_URL}/api/reports?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const { marks, students, subjects } = await response.json();
        setMarks(marks);
        setStudents(students);
        setSubjects(subjects);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching reports data");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredMarks = () => {
    return marks; // Backend handles filtering
  };

  const getStudentReport = () => {
    if (selectedStudent === "all") return [];
    return marks.map((mark) => ({
      ...mark,
      subjectName: mark.subject.name,
      subjectCode: mark.subject.code,
      percentage: ((mark.scoredMarks / mark.maxMarks) * 100).toFixed(1),
    }));
  };

  const getSubjectReport = () => {
    if (selectedSubject === "all") return [];
    return marks.map((mark) => ({
      ...mark,
      studentName: mark.student.name,
      rollNumber: mark.student.rollNumber,
      percentage: ((mark.scoredMarks / mark.maxMarks) * 100).toFixed(1),
    }));
  };

  const getClassStatistics = () => {
    const filteredMarks = getFilteredMarks();
    if (filteredMarks.length === 0) return null;

    const totalMarks = filteredMarks.reduce((sum, mark) => sum + mark.scoredMarks, 0);
    const totalMaxMarks = filteredMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    const percentages = filteredMarks.map((mark) => (mark.scoredMarks / mark.maxMarks) * 100);
    const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
    const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;

    return {
      totalStudents: new Set(filteredMarks.map((mark) => mark.studentId)).size,
      totalExams: filteredMarks.length,
      averagePercentage: averagePercentage.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
    };
  };

  const handleExport = () => {
    const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
    if (!token) {
      toast.error("Please log in to export reports");
      return;
    }

    const queryParams = new URLSearchParams();
    if (selectedBatch !== "all") queryParams.append("batch", selectedBatch);
    if (selectedBranch !== "all") queryParams.append("branch", selectedBranch);
    if (selectedYear && selectedYear !== "all") queryParams.append("year", selectedYear);
    if (selectedSemester && selectedSemester !== "all") queryParams.append("semester", selectedSemester);
    if (selectedStudent !== "all") queryParams.append("studentId", selectedStudent);
    if (selectedSubject !== "all") queryParams.append("subjectId", selectedSubject);
    if (selectedExamType !== "all") queryParams.append("examType", selectedExamType);

    window.location.href = `${API_BASE_URL}/api/reports/export?${queryParams.toString()}&token=${token}`;
  };

  const filteredStudents = students;
  const filteredSubjects = subjects;
  const statistics = getClassStatistics();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="text-center text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />
      <div className="p-6">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3 rounded-xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
                <p className="text-gray-600 mt-2">Generate comprehensive academic performance reports.</p>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter Reports</CardTitle>
              <CardDescription>Select criteria to generate specific reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="h-12">
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
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-12">
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
                <div>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="1">1st Semester</SelectItem>
                      <SelectItem value="2">2nd Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.rollNumber} - {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Exam Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{statistics.totalExams}</div>
                  <div className="text-sm text-gray-600">Total Exams</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{statistics.averagePercentage}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{statistics.highest}%</div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{statistics.lowest}%</div>
                  <div className="text-sm text-gray-600">Lowest Score</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Academic Reports</CardTitle>
                  <CardDescription>View detailed reports by student, subject, or exam</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="student">Student Report</TabsTrigger>
                  <TabsTrigger value="subject">Subject Report</TabsTrigger>
                  <TabsTrigger value="exam">Exam Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Student</TableHead>
                        <TableHead className="font-bold">Roll Number</TableHead>
                        <TableHead className="font-bold">Subject</TableHead>
                        <TableHead className="font-bold">Exam Type</TableHead>
                        <TableHead className="font-bold">Marks</TableHead>
                        <TableHead className="font-bold">Percentage</TableHead>
                        <TableHead className="font-bold">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredMarks().slice(0, 5).map((mark) => {
                        const percentage = (mark.scoredMarks / mark.maxMarks) * 100;
                        const grade =
                          percentage >= 90
                            ? "A+"
                            : percentage >= 80
                            ? "A"
                            : percentage >= 70
                            ? "B+"
                            : percentage >= 60
                            ? "B"
                            : percentage >= 50
                            ? "C"
                            : "F";

                        return (
                          <TableRow key={mark._id}>
                            <TableCell className="font-semibold">{mark.student.name}</TableCell>
                            <TableCell>{mark.student.rollNumber}</TableCell>
                            <TableCell>
                              {mark.subject.code} - {mark.subject.name}
                            </TableCell>
                            <TableCell>{mark.examType}</TableCell>
                            <TableCell>
                              {mark.scoredMarks} / {mark.maxMarks}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  percentage >= 90
                                    ? "bg-green-100 text-green-700"
                                    : percentage >= 75
                                    ? "bg-blue-100 text-blue-600"
                                    : percentage >= 60
                                    ? "bg-yellow-100 text-yellow-600"
                                    : percentage >= 50
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {percentage.toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{grade}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="student" className="mt-6">
                  {selectedStudent !== "all" ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Subject</TableHead>
                          <TableHead className="font-bold">Exam Type</TableHead>
                          <TableHead className="font-bold">Marks</TableHead>
                          <TableHead className="font-bold">Percentage</TableHead>
                          <TableHead className="font-bold">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getStudentReport().map((mark) => {
                          const percentage = Number.parseFloat(mark.percentage);
                          const grade =
                            percentage >= 90
                              ? "A+"
                              : percentage >= 80
                              ? "A"
                              : percentage >= 70
                              ? "B+"
                              : percentage >= 60
                              ? "B"
                              : percentage >= 50
                              ? "C"
                              : "F";

                          return (
                            <TableRow key={mark._id}>
                              <TableCell>
                                {mark.subjectCode} - {mark.subjectName}
                              </TableCell>
                              <TableCell>{mark.examType}</TableCell>
                              <TableCell>
                                {mark.scoredMarks} / {mark.maxMarks}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    percentage >= 90
                                      ? "bg-green-100 text-green-700"
                                      : percentage >= 75
                                      ? "bg-blue-100 text-blue-600"
                                      : percentage >= 60
                                      ? "bg-yellow-100 text-yellow-600"
                                      : percentage >= 50
                                      ? "bg-orange-100 text-orange-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {mark.percentage}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{grade}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center">
                      <div className="py-16 text-gray-600">
                        <FileText className="text-4xl mx-auto mb-4 opacity-60" />
                        <p className="text-gray-500">Select a student to view their detailed report.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="subject" className="mt-6">
                  {selectedSubject !== "all" ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Student</TableHead>
                          <TableHead className="font-bold">Roll Number</TableHead>
                          <TableHead className="font-bold">Exam Type</TableHead>
                          <TableHead className="font-bold">Marks</TableHead>
                          <TableHead className="font-bold">Percentage</TableHead>
                          <TableHead className="font-bold">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSubjectReport().map((mark) => {
                          const percentage = Number.parseFloat(mark.percentage);
                          const grade =
                            percentage >= 90
                              ? "A+"
                              : percentage >= 80
                              ? "A"
                              : percentage >= 70
                              ? "B+"
                              : percentage >= 60
                              ? "B"
                              : percentage >= 50
                              ? "C"
                              : "F";

                          return (
                            <TableRow key={mark._id}>
                              <TableCell className="font-semibold">{mark.studentName}</TableCell>
                              <TableCell>{mark.rollNumber}</TableCell>
                              <TableCell>{mark.examType}</TableCell>
                              <TableCell>
                                {mark.scoredMarks} / {mark.maxMarks}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    percentage >= 90
                                      ? "bg-green-100 text-green-700"
                                      : percentage >= 75
                                      ? "bg-blue-100 text-blue-600"
                                      : percentage >= 60
                                      ? "bg-yellow-100 text-yellow-600"
                                      : percentage >= 50
                                      ? "bg-orange-100 text-orange-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {mark.percentage}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{grade}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center">
                      <div className="py-16 text-gray-600">
                        <FileText className="text-4xl mx-auto mb-4 opacity-60" />
                        <p className="text-sm text-gray-500">Select a subject to view its detailed analysis.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="exam" className="mt-6">
                  {selectedExamType !== "all" ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Student</TableHead>
                          <TableHead className="font-bold">Roll Number</TableHead>
                          <TableHead className="font-bold">Subject</TableHead>
                          <TableHead className="font-bold">Marks</TableHead>
                          <TableHead className="font-bold">Percentage</TableHead>
                          <TableHead className="font-bold">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredMarks().map((mark) => {
                          const percentage = (mark.scoredMarks / mark.maxMarks) * 100;
                          const grade =
                            percentage >= 90
                              ? "A+"
                              : percentage >= 80
                              ? "A"
                              : percentage >= 70
                              ? "B+"
                              : percentage >= 60
                              ? "B"
                              : percentage >= 50
                              ? "C"
                              : "F";

                          return (
                            <TableRow key={mark._id}>
                              <TableCell className="font-semibold">{mark.student.name}</TableCell>
                              <TableCell>{mark.student.rollNumber}</TableCell>
                              <TableCell>
                                {mark.subject.code} - {mark.subject.name}
                              </TableCell>
                              <TableCell>
                                {mark.scoredMarks} / {mark.maxMarks}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    percentage >= 90
                                      ? "bg-green-100 text-green-700"
                                      : percentage >= 75
                                      ? "bg-blue-100 text-blue-600"
                                      : percentage >= 60
                                      ? "bg-yellow-100 text-yellow-600"
                                      : percentage >= 50
                                      ? "bg-orange-100 text-orange-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {percentage.toFixed(2)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{grade}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center">
                      <div className="py-16 text-gray-600">
                        <TrendingUp className="text-4xl mx-auto mb-4 opacity-60" />
                        <p className="text-sm text-gray-500">Select an exam type to analyze.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}