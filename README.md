# Engineering College Student Exam Marks Management System

A comprehensive full-stack application for managing student exam marks in engineering colleges, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Student Management**: Add, edit, and organize students by batch, branch, year, and semester
- **Subject Configuration**: Set up subjects for each branch and semester with credits and type
- **Marks Entry**: Bulk entry of marks for different exam types (Class Tests, Mids, Semester Exams, Lab Exams)
- **Comprehensive Reports**: Generate student-wise, subject-wise, and exam-wise performance reports
- **Real-time Analytics**: View class statistics, performance trends, and grade distributions

### Advanced Features
- **Responsive Design**: Beautiful, mobile-friendly interface using Tailwind CSS
- **Real-time Validation**: Form validation and error handling
- **Export Functionality**: Export reports to Excel/PDF (ready for implementation)
- **Grade Calculation**: Automatic percentage and grade calculation
- **Search & Filter**: Advanced filtering across all modules
- **Toast Notifications**: User-friendly feedback system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB (schema provided, currently using mock data)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📁 Project Structure

\`\`\`
student-marks-system/
├── app/
│   ├── api/
│   │   ├── students/
│   │   ├── subjects/
│   │   └── marks/
│   ├── students/
│   ├── subjects/
│   ├── marks/
│   ├── reports/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── mongodb.ts
├── components/ui/
└── README.md
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (for production)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd student-marks-system
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your MongoDB connection string:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/student-marks-system
\`\`\`

4. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Collections Structure

#### Students Collection
\`\`\`javascript
{
  name: String,
  rollNumber: String (unique),
  batch: String,
  branch: String,
  year: Number (1-4),
  semester: Number (1-2),
  email: String (unique),
  phone: String,
  timestamps: true
}
\`\`\`

#### Subjects Collection
\`\`\`javascript
{
  name: String,
  code: String (unique),
  branch: String,
  year: Number (1-4),
  semester: Number (1-2),
  credits: Number (1-6),
  type: Enum ['Theory', 'Laboratory', 'Project'],
  timestamps: true
}
\`\`\`

#### Marks Collection
\`\`\`javascript
{
  studentId: ObjectId (ref: Student),
  subjectId: ObjectId (ref: Subject),
  examType: String,
  maxMarks: Number,
  scoredMarks: Number,
  comments: String,
  enteredBy: String,
  timestamps: true
}
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
- Enter marks for multiple students simultaneously
- Add optional comments for each student
- Save all marks with one click

### 4. Reports & Analytics
- Access `/reports`
- View comprehensive performance analytics
- Generate student-wise detailed reports
- Analyze subject-wise performance
- Export reports (implementation ready)

## 🔧 API Endpoints

### Students API
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Subjects API
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/[id]` - Update subject
- `DELETE /api/subjects/[id]` - Delete subject

### Marks API
- `GET /api/marks` - Get all marks with populated data
- `POST /api/marks` - Save multiple marks

## 🎨 UI/UX Features

### Design Highlights
- **Modern Gradient Backgrounds**: Each page has unique, beautiful gradients
- **Consistent Color Coding**: Branches, grades, and types have consistent colors
- **Responsive Tables**: Mobile-friendly data display
- **Interactive Cards**: Hover effects and smooth transitions
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Semantic HTML structure

## 🚀 Deployment

### Production Setup

1. **Build the application**
\`\`\`bash
npm run build
\`\`\`

2. **Set up MongoDB**
- Configure MongoDB Atlas or local MongoDB
- Update connection string in environment variables

3. **Deploy to Vercel**
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

## 🔮 Future Enhancements

### Planned Features
- **Authentication System**: Faculty login with role-based access
- **Email Notifications**: Automated result notifications
- **Advanced Analytics**: Performance trends and predictions
- **Mobile App**: React Native companion app
- **Bulk Import**: Excel/CSV import functionality
- **Attendance Integration**: Link attendance with performance

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Caching**: Redis implementation for better performance
- **Testing**: Comprehensive test suite
- **Documentation**: API documentation with Swagger

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first styling
- **Next.js** for the powerful React framework
- **Vercel** for seamless deployment

## 📞 Support

For support, email support@edumarks.com or create an issue in the repository.

---

**Made with ❤️ for engineering colleges worldwide**
