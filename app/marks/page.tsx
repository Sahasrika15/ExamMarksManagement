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

// Dynamically import Navbar to avoid SSR issues
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false });

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
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [existingMarks, setExistingMarks] = useState<Mark[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: Mark }>({});
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes, examsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/subjects"),
          fetch("/api/exams"),
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
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, selectedBatch, selectedBranch, selectedYear, selectedSemester]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, selectedBranch, selectedYear, selectedSemester]);

  useEffect(() => {
    if (selectedSubject && selectedExamType) {
      fetchExistingMarks();
      const exam = exams.find(
        (e) => e.subjectId === selectedSubject && e.type === selectedExamType
      );
      setMaxMarks(exam ? exam.maxMarks : 100);
    } else {
      setMaxMarks(null);
    }
  }, [selectedSubject, selectedExamType, exams]);

  const fetchExistingMarks = async () => {
    try {
      const response = await fetch(`/api/marks?subjectId=${selectedSubject}&examType=${selectedExamType}`);
      if (response.ok) {
        const data = await response.json();
        setExistingMarks(data);

        const prefilledMarks: { [key: string]: Mark } = {};
        data.forEach((mark: Mark) => {
          const markKey = `${mark.studentId}-${mark.subjectId}-${mark.examType}`;
          prefilledMarks[markKey] = mark;
        });
        setMarks(prefilledMarks);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to fetch marks: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error fetching existing marks:", error);
      toast.error("Error fetching existing marks");
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

    if (isNaN(scoredMarks) || scoredMarks < 0 || (maxMarks && scoredMarks > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setMarks((prev) => ({
      ...prev,
      [markKey]: {
        ...prev[markKey],
        studentId,
        subjectId: selectedSubject,
        examType: selectedExamType,
        maxMarks: maxMarks || 100,
        scoredMarks,
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
    const marksArray = Object.values(marks).filter(
      (mark) =>
        mark.studentId &&
        mark.subjectId &&
        mark.examType &&
        mark.scoredMarks != null &&
        mark.scoredMarks >= 0 &&
        (maxMarks ? mark.scoredMarks <= maxMarks : true)
    );

    if (marksArray.length === 0) {
      toast.error("No valid marks to save. Please enter marks for at least one student.");
      return;
    }

    try {
      const response = await fetch("/api/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marks: marksArray }),
      });

      if (response.ok) {
        toast.success("Marks saved successfully!");
        setMarks({});
        await fetchExistingMarks();
      } else {
        const errorData = await response.json();
        console.error("Save marks error:", errorData);
        toast.error(`Error saving marks: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Error saving marks");
    }
  };

  const updateMark = async (markId: string, mark: Mark) => {
    if (mark.scoredMarks == null || mark.scoredMarks < 0 || (maxMarks && mark.scoredMarks > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    try {
      const response = await fetch(`/api/marks/${markId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
        toast.error(`Error updating mark: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating mark:", error);
      toast.error("Error updating mark");
    }
  };

  const deleteMark = async (markId: string) => {
    try {
      const response = await fetch(`/api/marks/${markId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Mark deleted successfully!");
        await fetchExistingMarks();
      } else {
        const errorData = await response.json();
        toast.error(`Error deleting mark: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting mark:", error);
      toast.error("Error deleting mark");
    }
  };

  const canShowMarksTable =
    selectedBatch && selectedBranch && selectedYear && selectedSemester && selectedSubject && selectedExamType;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <Navbar />
      <div className="p-6">
        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Marks Entry</h1>
                <p className="text-gray-600">Enter, update, or delete marks for examinations</p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Exam Configuration</CardTitle>
              <CardDescription>
                Choose batch, branch, year, semester, subject, and exam type to manage marks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
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
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
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
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
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
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger>
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
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {canShowMarksTable && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Marks</CardTitle>
                    <CardDescription>
                      {filteredSubjects.find((s) => s._id === selectedSubject)?.name} - {selectedExamType}
                      <br />
                      Maximum Marks: {maxMarks} | Students: {filteredStudents.length}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={saveMarks} className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save All Marks
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.location.href = `/api/marks/export?subjectId=${selectedSubject}&examType=${selectedExamType}`
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Scored Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const markKey = `${student._id}-${selectedSubject}-${selectedExamType}`;
                      const currentMark = marks[markKey];
                      const percentage = currentMark?.scoredMarks != null
                        ? ((currentMark.scoredMarks / (maxMarks || 100)) * 100).toFixed(1)
                        : "0";

                      return (
                        <TableRow key={student._id}>
                          <TableCell className="font-mono">{student.rollNumber}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max={maxMarks || 100}
                                value={currentMark?.scoredMarks ?? ""}
                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                className="w-20"
                                placeholder="0"
                              />
                              <span className="text-gray-500">/ {maxMarks}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                Number.parseFloat(percentage) >= 90
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
                              {percentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={currentMark?.comments || ""}
                              onChange={(e) => handleCommentChange(student._id, e.target.value)}
                              placeholder="Optional comments..."
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {currentMark?._id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateMark(currentMark._id!, currentMark)}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteMark(currentMark._id!)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
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
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select Configuration</h3>
                  <p>Please select batch, branch, year, semester, subject, and exam type to start managing marks.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}