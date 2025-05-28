# Engineering College Student Exam Marks Management System

A comprehensive full-stack application for managing student exam marks in engineering colleges, built with Next.js 14, TypeScript, TailwindCSS, NodeJS and ExpressJS. It isdesigned to manage engineering college students' exam marks in a structured and organized manner, based on Batch, Year, Semester, and Branch.

## 🚀 Features

### Core Functionality
- **Student Management**: Organize students by Batch, Branch, Year, and Semester.
- **Subject Configuration**: Set up subjects for each branch and semester with credits and type.
- **Marks Entry**: Faculty can enter marks using structured grid, filterable by Batch → Branch → Year → Semester → Subject → Exam Type.
- **Marks Storage**: Store marks in a structured format in MongoDB.
- **Reports**: Generate student-wise, subject-wise, and exam-wise performance reports.

### Advanced Features
- **Responsive Design**: Beautiful, mobile-friendly interface using Tailwind CSS.
- **Real-time Validation**: Form validation and error handling.
- **Export Functionality**: Export reports to Excel/PDF (ready for implementation).
- **Grade Calculation**: Automatic percentage and grade calculation.
- **Search & Filter**: Advanced filtering across all modules.
- **Toast Notifications**: User-friendly feedback system.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (schema provided, currently using mock data)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📁 Basic Project Structure

\`\`\`
student-marks-system/
├── backend/
│   ├── config/         # Database connection setup
│   ├── models/         # MongoDB schemas (Student, Subject, Exam, etc.)
│   ├── routes/         # API routes (students, subjects, marks, etc.)
│   ├── controllers/    # Logic handlers for routes
│   └── middleware/     # Middleware for authentication and role-based access
└── frontend/
    ├── pages/          # Next.js pages for routing
    │   ├── students/   # Page for entering students
    │   ├── subjects/   # Page for entering subjects
    │   ├── login/      # Page for login
    │   ├── marks/      # Page for entering marks
    │   └── reports/    # Page for viewing reports
    ├── components/     # Reusable UI components
    ├── lib/            # Utility functions (API calls)
    └── public/         # Static assets (images, icons)
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Node.js and npm installed.
- MongoDB running locally or a MongoDB Atlas cloud instance.

### Installation

1. **Clone the repository**
\`\`\`bash
git clone **https://github.com/Sahasrika15/ExamMarksManagement.git**
\`\`\`

2. **Install dependencies**
\`\`\`bash
cd backend
npm install --force
\`\`\`

\`\`\`bash
cd ../frontend
npm install --force
\`\`\`

3. **Start the Backend**
\`\`\`bash
  cd backend
  npm start
\`\`\`


4. **Start the Frontend**

\`\`\`bash
  cd frontend
  npm run dev
\`\`\`

## 🎯 Usage Guide

### 1. Student Management
- Navigate to `/students`
- Add students with complete academic details
- Filter by branch, year, or search by name/roll number
- Edit or delete existing student records

### 2. Subject Configuration
- Go to `/subjects`
- Configure subjects for each branch and semester
- Set credits and subject type (Theory/Laboratory/Project)
- Manage subject codes and names

### 3. Marks Entry
- Visit `/marks`
- Select batch, branch, year, semester, subject, and exam type
- Add optional comments for each student
- Save all marks with one click
- Export by Excel

### 4. Reports & Analytics
- Access `/reports`
- View comprehensive performance analytics
- Generate student-wise detailed reports
- Analyze subject-wise performance
- Export reports (implementation ready by CSV)

### 🌐 Deployment

- *Frontend (Vercel):* [https://edumarks.vercel.app](https://edumarks.vercel.app)  
- *Backend (Render):* [https://exammarksmanagement.onrender.com](https://exammarksmanagement.onrender.com)

### 🔗 GitHub

- *Repository:* [https://github.com/Sahasrika15/ExamMarksManagement.git](https://github.com/Sahasrika15/ExamMarksManagement.git) 