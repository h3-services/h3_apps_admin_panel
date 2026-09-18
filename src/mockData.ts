export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  [key: string]: any;
}

export interface Contribution {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  amountUsd?: number;
  amountInr?: number;
  date: string;
  paymentMethod: string;
  receiptSent: boolean;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo?: string;
  age: number;
  grade: string;
  college: string;
  hostelRoom: string;
  attendance: number;
  avatar: string;
  location: {
    status: string;
    lastUpdated: string;
    coordinates: string;
    hostelDistance: string;
    collegeDistance: string;
  };
  leaveRequests: LeaveRequest[];
  academicProgress: any[];
  subjects: any[];
  notes: any[];
  parentName: string;
  parentPhone: string;

  // Extended Database Fields
  student_code?: string;
  school_name?: string;
  school_name_10th?: string;
  school_name_12th?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  religion?: string;
  community?: string;
  physically_challenged?: number;
  is_married?: number;
  address?: string;
  landmark?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  area_type?: string;
  course?: string;
  major?: string;
  college_address?: string;
  year?: string;
  current_year?: string;
  mode?: string;
  batch?: string;
  hostel_or_dayscholar?: string;
  hostel_address?: string;
  parent_status?: string;
  father_name?: string;
  father_occupation?: string;
  father_contact_number?: string;
  mother_name?: string;
  mother_occupation?: string;
  mother_contact_number?: string;
  guardian_name?: string;
  guardian_occupation?: string;
  guardian_contact_number?: string;
  number_of_siblings?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  parent_account_number?: string;
  parent_ifsc?: string;
  academic_funding_maturity?: string;
  funding_percentage?: string;
  amount_approx?: string;
  individual_amount?: string;
  funders?: string;
  remarks?: string;
  folder_link?: string;
  documents_collected?: string;
  is_document_uploaded?: number;
  emergency_contact?: string;
  fcm_token?: string;
  currently_working?: number;
  designation?: string;
  are_you_on_track?: number;
  willing_to_do_volunteering?: number;
  college_fees?: string;
  fees_status?: string;
  other_notes?: string;
  [key: string]: any;
}

export interface Volunteer {
  id: string;
  volunteer_id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  specialization?: string;
  availability?: string;
  bio?: string;
  profile_photo_link?: string;
  joined_date?: string;
  fcm_token?: string;
  hoursContributed: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  assignedStudents?: string[];
  role?: string;
  [key: string]: any;
}

export interface Parent {
  id: string;
  name: string;
  guardianName?: string;
  email?: string;
  phone: string;
  childName: string;
  childId: string;
  relationship?: string;
  relation?: string;
  occupation: string;
  address?: string;
  profile_photo_link?: string;
  parent_id?: string;
  user_id?: string;
  student_id?: string;
  is_primary?: number;
  [key: string]: any;
}

export interface Donor {
  id: string;
  donor_id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  donorType: string;
  organizationName?: string;
  totalDonated: number | string;
  formattedAmount: string;
  status: 'Active Sponsor' | 'Past Benefactor';
  profile_photo_link?: string;
  joined_date: string;
  [key: string]: any;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  refund_requested?: boolean;
  is_private?: boolean;
  is_foundation_paid?: boolean;
  status: string;
  student_id?: string | null;
  target_group?: string;
  created_by?: string;
  created_by_name?: string;
  approved_by_name?: string | null;
  receipt_photo_link?: string | null;
  receipt_drive_link?: string | null;
  uploaded_by?: string | null;
  [key: string]: any;
}

export const initialDonors: Donor[] = [
  {
    id: 'DON001',
    name: 'Suriya Arish',
    email: 'r.suryaarish@gmail.com',
    phone: '+919876543210',
    donorType: 'Individual Benefactor',
    totalDonated: 25000,
    formattedAmount: '₹25,000.00',
    status: 'Active Sponsor',
    joined_date: '2026-07-27'
  },
  {
    id: 'DON002',
    name: 'Global Edu Trust',
    email: 'likitha.arjava@gmail.com',
    phone: '6379036400',
    donorType: 'Corporate Sponsor',
    organizationName: 'Global Edu Trust',
    totalDonated: 95000,
    formattedAmount: '₹95,000.00',
    status: 'Active Sponsor',
    joined_date: '2026-05-30',
    address: '123 Edu Tech Park, Chennai, TN, India'
  },
  {
    id: 'DON003',
    name: 'H3 Foundation',
    email: 'h3foundation@example.com',
    phone: '1111111111',
    donorType: 'Institutional Fund',
    organizationName: 'H3 Foundation',
    totalDonated: 150000,
    formattedAmount: '₹1,50,000.00',
    status: 'Active Sponsor',
    joined_date: '2026-05-30'
  }
];

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  time: string;
  category: 'leave' | 'academic' | 'attendance' | 'general';
  [key: string]: any;
}

export interface Activity {
  activity_id: string;
  student_id: string | null;
  activity_type: string;
  title: string;
  activity_date: string;
  created_by: string;
  is_published: number;
  is_deleted: number;
  description: string;
  audience: string | null;
  images: { caption: string; image_url: string; sort_order: number }[] | null;
  created_at: string;
  updated_at: string;
}

export const initialStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Aravind Swamy',
    rollNo: 'H3-2024-089',
    age: 19,
    grade: 'B.Tech - 2nd Year (CSE)',
    college: 'St. Xavier Engineering College',
    hostelRoom: 'Block B - Room 204',
    attendance: 94.5,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    location: {
      status: 'In College',
      lastUpdated: '10 mins ago',
      coordinates: '12.9716° N, 77.5946° E',
      hostelDistance: '3.2 km',
      collegeDistance: '0.1 km (On Campus)'
    },
    leaveRequests: [
      {
        id: 'LR-101',
        studentId: 'STU001',
        studentName: 'Aravind Swamy',
        type: 'Medical Leave',
        fromDate: '2026-05-10',
        toDate: '2026-05-12',
        days: 3,
        reason: 'Severe viral fever, doctor advised rest.',
        status: 'Approved',
        requestedAt: '2026-05-09'
      },
      {
        id: 'LR-104',
        studentId: 'STU001',
        studentName: 'Aravind Swamy',
        type: 'Sick Leave',
        fromDate: '2026-05-25',
        toDate: '2026-05-26',
        days: 2,
        reason: 'Dental checkup and minor extraction procedure.',
        status: 'Pending',
        requestedAt: '2026-05-19'
      }
    ],
    academicProgress: [
      { semester: 'Sem 1', gpa: 8.2 },
      { semester: 'Sem 2', gpa: 8.5 },
      { semester: 'Sem 3', gpa: 8.9 },
      { semester: 'Sem 4', gpa: 9.1 }
    ],
    subjects: [
      { name: 'Data Structures & Algorithms', score: 92, grade: 'O' },
      { name: 'Computer Networks', score: 85, grade: 'A+' },
      { name: 'Database Management Systems', score: 88, grade: 'A+' },
      { name: 'Discrete Mathematics', score: 94, grade: 'O' },
      { name: 'Environmental Sciences', score: 78, grade: 'B+' }
    ],
    notes: [
      {
        id: 'N-201',
        date: '2026-04-18',
        author: 'Admin',
        note: 'Aravind has shown exceptional progress in programming. He is taking part in college hackathons and managing studies well.',
        type: 'academic'
      },
      {
        id: 'N-202',
        date: '2026-05-02',
        author: 'Admin',
        note: 'Spoke with him regarding his health. Recommended dietary changes for his recurring stomach issues.',
        type: 'health'
      }
    ],
    parentName: 'Venkatesh Swamy',
    parentPhone: '+91 98450 12345'
  },
  {
    id: 'STU002',
    name: 'Priya Narayanan',
    rollNo: 'H3-2023-041',
    age: 20,
    grade: 'B.Sc - 3rd Year (Nursing)',
    college: 'Apollo Institute of Nursing',
    hostelRoom: 'Block A - Room 102',
    attendance: 88.2,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    location: {
      status: 'In Hostel',
      lastUpdated: '5 mins ago',
      coordinates: '12.9680° N, 77.6010° E',
      hostelDistance: '0.0 km (In Room)',
      collegeDistance: '1.8 km'
    },
    leaveRequests: [
      {
        id: 'LR-102',
        studentId: 'STU002',
        studentName: 'Priya Narayanan',
        type: 'Festival Leave',
        fromDate: '2026-05-18',
        toDate: '2026-05-20',
        days: 3,
        reason: 'Travelling home for regional temple festival family union.',
        status: 'Approved',
        requestedAt: '2026-05-15'
      }
    ],
    academicProgress: [
      { semester: 'Sem 1', gpa: 7.8 },
      { semester: 'Sem 2', gpa: 7.9 },
      { semester: 'Sem 3', gpa: 8.3 },
      { semester: 'Sem 4', gpa: 8.4 },
      { semester: 'Sem 5', gpa: 8.7 }
    ],
    subjects: [
      { name: 'Anatomy and Physiology', score: 81, grade: 'A' },
      { name: 'Microbiology', score: 84, grade: 'A' },
      { name: 'Medical-Surgical Nursing', score: 90, grade: 'A+' },
      { name: 'Pharmacology', score: 76, grade: 'B+' },
      { name: 'Community Health Nursing', score: 89, grade: 'A+' }
    ],
    notes: [
      {
        id: 'N-203',
        date: '2026-05-10',
        author: 'Admin',
        note: 'Priya performed very well in her ward internship. Head nurse gave highly positive feedback about her empathy and work ethic.',
        type: 'academic'
      }
    ],
    parentName: 'Narayanan Pillai',
    parentPhone: '+91 97410 54321'
  },
  {
    id: 'STU003',
    name: 'Mohamed Rehan',
    rollNo: 'H3-2025-112',
    age: 18,
    grade: 'B.Com - 1st Year (General)',
    college: 'Loyola College of Commerce',
    hostelRoom: 'Block B - Room 408',
    attendance: 92.1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    location: {
      status: 'Out of Bounds',
      lastUpdated: '1 hr ago',
      coordinates: '12.9800° N, 77.5850° E',
      hostelDistance: '4.8 km',
      collegeDistance: '5.2 km'
    },
    leaveRequests: [
      {
        id: 'LR-103',
        studentId: 'STU003',
        studentName: 'Mohamed Rehan',
        type: 'Personal Leave',
        fromDate: '2026-05-22',
        toDate: '2026-05-25',
        days: 4,
        reason: 'Sister wedding ceremony. Needs to assist in arrangements.',
        status: 'Pending',
        requestedAt: '2026-05-17'
      }
    ],
    academicProgress: [
      { semester: 'Sem 1', gpa: 7.2 },
      { semester: 'Sem 2', gpa: 7.5 }
    ],
    subjects: [
      { name: 'Financial Accounting', score: 79, grade: 'B+' },
      { name: 'Business Economics', score: 71, grade: 'B' },
      { name: 'Principles of Management', score: 82, grade: 'A' },
      { name: 'Business Communication', score: 88, grade: 'A+' }
    ],
    notes: [
      {
        id: 'N-204',
        date: '2026-04-20',
        author: 'Admin',
        note: 'Rehan is slightly struggling with Financial Accounting concepts. Initiated special remedial tutoring with senior commerce volunteers.',
        type: 'academic'
      }
    ],
    parentName: 'Shabana Begum',
    parentPhone: '+91 91234 56789'
  },
  {
    id: 'STU004',
    name: 'Divya Deshmukh',
    rollNo: 'H3-2024-063',
    age: 19,
    grade: 'B.Tech - 2nd Year (ECE)',
    college: 'St. Xavier Engineering College',
    hostelRoom: 'Block A - Room 311',
    attendance: 96.8,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    location: {
      status: 'On Leave',
      lastUpdated: '2 days ago',
      coordinates: '18.5204° N, 73.8567° E (Pune)',
      hostelDistance: 'Over 800 km',
      collegeDistance: 'Over 800 km'
    },
    leaveRequests: [
      {
        id: 'LR-105',
        studentId: 'STU004',
        studentName: 'Divya Deshmukh',
        type: 'Family Emergency',
        fromDate: '2026-05-17',
        toDate: '2026-05-21',
        days: 5,
        reason: 'Mother hospitalized for surgery in hometown. Need to attend to family.',
        status: 'Approved',
        requestedAt: '2026-05-16'
      }
    ],
    academicProgress: [
      { semester: 'Sem 1', gpa: 9.4 },
      { semester: 'Sem 2', gpa: 9.6 },
      { semester: 'Sem 3', gpa: 9.8 }
    ],
    subjects: [
      { name: 'Electronic Devices & Circuits', score: 97, grade: 'O' },
      { name: 'Signals & Systems', score: 95, grade: 'O' },
      { name: 'Network Theory', score: 98, grade: 'O' },
      { name: 'Digital Electronics', score: 94, grade: 'O' }
    ],
    notes: [
      {
        id: 'N-205',
        date: '2026-05-15',
        author: 'Admin',
        note: 'Divya is a top performer. Approved emergency travel to Pune to support her family due to mother surgery. Keep monitoring her emotional well-being.',
        type: 'personal'
      }
    ],
    parentName: 'Sanjay Deshmukh',
    parentPhone: '+91 88888 77777'
  }
];

export const initialVolunteers: Volunteer[] = [
  {
    id: 'VOL001',
    name: 'Rahul Sen',
    email: 'rahul.s@outlook.com',
    program: 'Weekend Academic Support (Science & Math)',
    hoursContributed: 84,
    status: 'Active',
    phone: '+91 99000 88221'
  },
  {
    id: 'VOL002',
    name: 'Meera Deshpande',
    email: 'meera.dp@gmail.com',
    program: 'Digital Literacy & Computer Coding',
    hoursContributed: 120,
    status: 'Active',
    phone: '+91 88776 65544'
  },
  {
    id: 'VOL003',
    name: 'Karan Malhotra',
    email: 'karan.m@gmail.com',
    program: 'Alumni Relations & Career Guidance',
    hoursContributed: 45,
    status: 'On Leave',
    phone: '+91 76543 21098'
  }
];

export const initialParents: Parent[] = [
  {
    id: 'PAR001',
    name: 'Venkatesh Swamy',
    email: 'venkatesh.swamy@gmail.com',
    phone: '+91 98450 12345',
    childName: 'Aravind Swamy',
    childId: 'STU001',
    occupation: 'Agricultural Farmer'
  },
  {
    id: 'PAR002',
    name: 'Narayanan Pillai',
    email: 'n.pillai@yahoo.com',
    phone: '+91 97410 54321',
    childName: 'Priya Narayanan',
    childId: 'STU002',
    occupation: 'Post Office Clerk'
  },
  {
    id: 'PAR003',
    name: 'Shabana Begum',
    email: 'shabana.b@gmail.com',
    phone: '+91 91234 56789',
    childName: 'Mohamed Rehan',
    childId: 'STU003',
    occupation: 'Tailor Shop Owner'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'ACT001',
    user: 'Admin',
    role: 'Admin',
    action: 'Added academic progress note for student Aravind Swamy',
    time: '2 hours ago',
    category: 'academic'
  },
  {
    id: 'ACT003',
    user: 'Biometric System',
    role: 'System',
    action: 'Priya Narayanan checked into Block A Hostel at 08:35 PM',
    time: '12 hours ago',
    category: 'attendance'
  },
  {
    id: 'ACT004',
    user: 'Admin Staff',
    role: 'Admin',
    action: 'Approved festival leave request (LR-102) for student Priya Narayanan',
    time: '1 day ago',
    category: 'leave'
  },
  {
    id: 'ACT005',
    user: 'Vol. Meera Deshpande',
    role: 'Volunteer',
    action: 'Completed coding class session: Intro to Javascript (2 hours)',
    time: '2 days ago',
    category: 'general'
  }
];
