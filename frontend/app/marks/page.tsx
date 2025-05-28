"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Save, Download, Trash2, Edit2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../components/auth-provider";
import { useRouter } from "next/navigation";

// Dynamically import Navbar to avoid SSR issues
const Navbar = dynamic(() => import("@/app/components/navbar"), { ssr: false });

// Base URL for the Express API
const API_BASE_URL = "https://exammarksmanagement.onrender.com";

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
  branch: string;
  year: number;
  semester: number;
  type: string;
}

interface Exam {
  _id: string;
  type: string;
  maxMarks: number;
  subjectId: string;
}

interface Mark {
  _id?: string;
  studentId: string;
  subjectId: string;
  examType: string;
  maxMarks: number;
  scoredMarks: number;
  comments?: string;
}

export default function MarksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [existingMarks, setExistingMarks] = useState<Mark[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: Mark }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [maxMarks, setMaxMarks] = useState<number | null>(null);

  const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];
  const examTypesTheory = ["CT", "Mid 1", "Mid 2", "Semester Exam"];
  const examTypesLab = ["Internal Lab", "External Lab"];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
        if (!token) {
          toast.error("Please log in to access marks data");
          router.push("/login");
          setIsLoading(false);
          return;
        }

        const [studentsRes, subjectsRes, examsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/students`, {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
          }),
          fetch(`${API_BASE_URL}/api/subjects`, {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
          }),
          fetch(`${API_BASE_URL}/api/exams`, {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
          }),
        ]);

        const studentsData = studentsRes.ok ? await studentsRes.json() : [];
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        const examsData = examsRes.ok ? await examsRes.json() : [];

        setStudents(studentsData);
        if (subjectsData.length === 0) {
          toast.warning("No subjects found. Please add subjects first.");
        }
        setSubjects(subjectsData);
        setExams(examsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterStudents();
  }, [students, selectedBatch, selectedBranch, selectedYear, selectedSemester]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, selectedBranch, selectedYear, selectedSemester]);

  useEffect(() => {
    if (selectedSubject && selectedExamType && isAuthenticated) {
      fetchExistingMarks();
      const exam = exams.find(
        (e) => e.subjectId === selectedSubject && e.type === selectedExamType
      );
      setMaxMarks(exam ? exam.maxMarks : 100);
    } else {
      setMaxMarks(null);
      setMarks({});
      setExistingMarks([]);
    }
  }, [selectedSubject, selectedExamType, exams, isAuthenticated]);

  const fetchExistingMarks = async () => {
    if (!selectedSubject || !selectedExamType) return;

    try {
      const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
      if (!token) {
        toast.error("Please log in to fetch marks");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/marks?subjectId=${selectedSubject}&examType=${selectedExamType}`,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setExistingMarks(data);

        const newMarks: { [key: string]: Mark } = {};
        filteredStudents.forEach((student) => {
          const markKey = `${student._id}-${selectedSubject}-${selectedExamType}`;
          const existingMark = data.find((m: Mark) => m.studentId === student._id);

          newMarks[markKey] = {
            _id: existingMark?._id,
            studentId: student._id,
            subjectId: selectedSubject,
            examType: selectedExamType,
            maxMarks: existingMark?.maxMarks || maxMarks || 100,
            scoredMarks: existingMark?.scoredMarks ?? 0,
            comments: existingMark?.comments || "",
          };
        });
        setMarks(newMarks);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch marks");
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        }
        setMarks({});
      }
    } catch (error) {
      console.error("Error fetching existing marks:", error);
      toast.error("Error fetching existing marks");
      setMarks({});
    }
  };

  const filterStudents = () => {
    let filtered = students;
    if (selectedBatch) {
      filtered = filtered.filter((student) => student.batch === selectedBatch);
    }
    if (selectedBranch) {
      filtered = filtered.filter((student) => student.branch === selectedBranch);
    }
    if (selectedYear) {
      filtered = filtered.filter((student) => student.year.toString() === selectedYear);
    }
    if (selectedSemester) {
      filtered = filtered.filter((student) => student.semester.toString() === selectedSemester);
    }
    setFilteredStudents(filtered);
  };

  const filterSubjects = () => {
    let filtered = subjects;
    if (selectedBranch) {
      filtered = filtered.filter((subject) => subject.branch === selectedBranch);
    }
    if (selectedYear) {
      filtered = filtered.filter((subject) => {
        const yearValue = selectedYear === "1" ? 1 : selectedYear === "2" ? 2 : selectedYear === "3" ? 3 : 4;
        return subject.year === yearValue;
      });
    }
    if (selectedSemester) {
      filtered = filtered.filter((subject) => {
        const semesterValue = selectedSemester === "1" ? 1 : 2;
        return subject.semester === semesterValue;
      });
    }
    setFilteredSubjects(filtered);
  };

  const getAvailableExamTypes = () => {
    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject) return [];
    return subject.type === "Laboratory" ? examTypesLab : examTypesTheory;
  };

  const handleMarkChange = (studentId: string, value: string) => {
    const markKey = `${studentId}-${selectedSubject}-${selectedExamType}`;
    const scoredMarks = Number.parseFloat(value);

    setMarks((prev) => ({
      ...prev,
      [markKey]: {
        ...prev[markKey],
        studentId,
        subjectId: selectedSubject,
        examType: selectedExamType,
        maxMarks: maxMarks || 100,
        scoredMarks: isNaN(scoredMarks) ? 0 : Math.min(scoredMarks, maxMarks || 100),
        comments: prev[markKey]?.comments || "",
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    const markKey = `${studentId}-${selectedSubject}-${selectedExamType}`;
    setMarks((prev) => ({
      ...prev,
      [markKey]: {
        ...prev[markKey],
        studentId,
        subjectId: selectedSubject,
        examType: selectedExamType,
        maxMarks: maxMarks || 100,
        scoredMarks: prev[markKey]?.scoredMarks ?? 0,
        comments: comment,
      },
    }));
  };

  const saveMarks = async () => {
    const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
    if (!token) {
      toast.error("Please log in to save marks");
      router.push("/login");
      return;
    }

    const marksToSave = Object.values(marks).filter(
      (mark) => mark.studentId && mark.subjectId && mark.examType
    );

    if (marksToSave.length === 0) {
      toast.error("No marks to save");
      return;
    }

    // Validate marks before saving
    const invalidMarks = marksToSave.filter(
      (mark) => mark.scoredMarks < 0 || mark.scoredMarks > (mark.maxMarks || 100)
    );

    if (invalidMarks.length > 0) {
      toast.error(`Some marks are invalid. Marks must be between 0 and ${maxMarks || 100}`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/marks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ marks: marksToSave }),
      });

      if (response.ok) {
        toast.success("Marks saved successfully!");
        setIsEditing(false);
        await fetchExistingMarks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error saving marks");
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Error saving marks");
    }
  };

  const updateMark = async (markId: string, mark: Mark) => {
    const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
    if (!token) {
      toast.error("Please log in to update marks");
      router.push("/login");
      return;
    }

    if (mark.scoredMarks < 0 || (maxMarks && mark.scoredMarks > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/marks/${markId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scoredMarks: mark.scoredMarks,
          maxMarks: mark.maxMarks,
          comments: mark.comments,
        }),
      });

      if (response.ok) {
        toast.success("Mark updated successfully!");
        await fetchExistingMarks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error updating mark");
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error updating mark:", error);
      toast.error("Error updating mark");
    }
  };

  const deleteMark = async (markId: string) => {
    const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
    if (!token) {
      toast.error("Please log in to delete marks");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/marks/${markId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Mark deleted successfully!");
        await fetchExistingMarks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error deleting mark");
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error deleting mark:", error);
      toast.error("Error deleting mark");
    }
  };

  const exportMarks = async () => {
    if (!selectedSubject || !selectedExamType) {
      toast.error("Please select subject and exam type first");
      return;
    }

    const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.sessionStorage.getItem('token')) : null;
    if (!token) {
      toast.error("Please log in to export marks");
      router.push("/login");
      return;
    }

    try {
      const url = new URL(`${API_BASE_URL}/api/marks/export`);
      url.searchParams.append('subjectId', selectedSubject);
      url.searchParams.append('examType', selectedExamType);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `marks_${selectedSubject}_${selectedExamType}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
        toast.success("Marks exported successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to export marks");
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error exporting marks:", error);
      toast.error("Error exporting marks");
    }
  };

  const canShowMarksTable =
    selectedBatch && selectedBranch && selectedYear && selectedSemester && selectedSubject && selectedExamType;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center text-gray-800">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will handle navigation to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <Navbar />
      <div className="p-6">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Marks Management</h1>
                <p className="text-gray-600 mt-2">Enter, update, or delete student marks for examinations.</p>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Configuration</CardTitle>
              <CardDescription>
                Select batch, branch, year, semester, subject, and exam type to manage marks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="batch" className="text-sm font-semibold">Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger id="batch" className="h-12">
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
                  <Label htmlFor="branch" className="text-sm font-semibold">Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger id="branch" className="h-12">
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
                  <Label htmlFor="year" className="text-sm font-semibold">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year" className="h-12">
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
                  <Label htmlFor="semester" className="text-sm font-semibold">Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger id="semester" className="h-12">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Semester</SelectItem>
                      <SelectItem value="2">2nd Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject" className="h-12">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examType" className="text-sm font-semibold">Exam Type</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger id="examType" className="h-12">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableExamTypes().length > 0 ? (
                        getAvailableExamTypes().map((type) => (
                          <SelectItem key={type} value={type}>
                            {type} {type === "Semester Exam" ? "(External)" : type === "Internal Lab" || type === "External Lab" ? "(Lab)" : "(Internal)"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Select a subject first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxMarks" className="text-sm font-semibold">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={maxMarks || ""}
                    onChange={(e) => setMaxMarks(Number.parseInt(e.target.value) || 100)}
                    min="1"
                    max="500"
                    disabled={!!exams.find(
                      (e) => e.subjectId === selectedSubject && e.type === selectedExamType
                    )}
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {canShowMarksTable && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Marks Entry</CardTitle>
                    <CardDescription>
                      {filteredSubjects.find((subject) => subject._id === selectedSubject)?.name} - {selectedExamType}
                      <br />
                      Maximum Marks: {maxMarks} | Students: {filteredStudents.length}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {isEditing ? (
                      <Button
                        onClick={saveMarks}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Save className="h-4 w-4 mr-2"></Save>
                        Save All
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Edit2 className="h-4 w-4 mr-2"></Edit2>
                        Edit All
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={exportMarks}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4 mr-2"></Download>
                      Export to Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Roll Number</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="font-semibold">Marks Scored</TableHead>
                      <TableHead className="font-semibold">Percentage</TableHead>
                      <TableHead className="font-semibold">Comments</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const markKey = `${student._id}-${selectedSubject}-${selectedExamType}`;
                      const currentMark = marks[markKey];
                      const percentage = currentMark?.scoredMarks != null
                        ? ((currentMark.scoredMarks / (maxMarks || 100)) * 100).toFixed(2)
                        : "0.00";

                      return (
                        <TableRow key={student._id}>
                          <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={currentMark?.scoredMarks?.toFixed(0) ?? ""}
                              onChange={(e) => handleMarkChange(student._id, e.target.value)}
                              className={`w-24 h-10 ${!isEditing && 'bg-gray-50'}`}
                                placeholder="0"
                                disabled={!isEditing}
                              />
                              <span className="text-gray-500 text-sm">/ {maxMarks}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${Number.parseFloat(percentage) >= 90
                                  ? "bg-green-100 text-green-800"
                                  : Number.parseFloat(percentage) >= 75
                                  ? "bg-blue-100 text-blue-800"
                                  : Number.parseFloat(percentage) >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : Number.parseFloat(percentage) >= 40
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {percentage} %
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={currentMark?.comments || ""}
                              onChange={(e) => handleCommentChange(student._id, e.target.value)}
                              placeholder="Comments"
                              className={`h-10 w-full rounded-md border border-gray-3001 ${!isEditing && 'bg-gray-50'}`}
                              disabled={!isEditing}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {currentMark?._id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateMark(currentMark._id!, currentMark)}
                                    className="h-10 px-3"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2"></Edit2>
                                    Update
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteMark(currentMark._id!)}
                                    className="h-10 px-3"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2"></Trash2>
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {!canShowMarksTable && (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-gray-600">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50"></Award>
                  <h3 className="text-xl font-semibold mb-3">No Configuration Selected</h3>
                  <p className="text-sm font-gray-500">
                    Please select a batch, branch, year, semester, subject, and exam type to manage marks.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}