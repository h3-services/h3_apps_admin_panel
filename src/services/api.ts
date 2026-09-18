import { auth } from '../lib/firebase';
import { 
  type Student, 
  type Volunteer, 
  type Parent, 
  type Donor,
  type Expense,
  type Activity,
  type Contribution
} from '../mockData';

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://h3apps-api.hope3.org').replace(/\/+$/, '');

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    // 1. Check for env static token (VITE_API_TOKEN)
    const envToken = import.meta.env.VITE_API_TOKEN || 'Hope3-Apps-Team';
    if (envToken) {
      return { 'Authorization': `Bearer ${envToken}` };
    }

    // 2. Check for stored auth token in localStorage/sessionStorage
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (storedToken) {
      return { 'Authorization': `Bearer ${storedToken}` };
    }

    // 3. Check Firebase Auth current user
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      return { 'Authorization': `Bearer ${token}` };
    }
  } catch (err) {
    console.warn('Could not retrieve auth token:', err);
  }
  return { 'Authorization': 'Bearer Hope3-Apps-Team' };
}

async function apiFetch<T>(path: string, fallback: T, retries = 1): Promise<T> {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      console.warn(`API request ${path} failed with status ${response.status}. Returning empty fallback.`);
      return fallback;
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data as T;
    }
    return data ? (data as T) : fallback;
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 1200));
      return apiFetch(path, fallback, retries - 1);
    }
    console.warn(`API request ${path} failed:`, error, '. Returning empty fallback.');
    return fallback;
  }
}

export function formatAvatarUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();
  if (!clean || clean === 'string' || clean === 'null' || clean === 'undefined' || clean.includes('example.com') || clean.includes('example.org') || clean.includes('ui-avatars.com')) return '';

  // Convert Google Drive view/share URLs to official Google thumbnail URLs
  if (clean.includes('drive.google.com') || clean.includes('googleusercontent.com')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=s400`;
    }
  }

  // If valid full HTTP/HTTPS URL
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }

  return '';
}

export const apiService = {
  // Update Fee Request Status
  updateFeeRequestStatus: async (feeRequestId: string, status: string): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/feerequests/${feeRequestId}/status?status=${status.toLowerCase()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status: status.toLowerCase() }) // Sending both query and body to be safe based on FastAPI varying patterns
      });
      if (res.ok) return await res.json();
      return null;
    } catch (error) {
      console.error("Failed to update fee request status:", error);
      return null;
    }
  },

  // Update Leave Request Status
  updateLeaveRequestStatus: async (leaveRequestId: string, status: string): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/leaverequests/${leaveRequestId}/status?status=${status.toLowerCase()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status: status.toLowerCase() }) // Sending both query and body to be safe
      });
      if (res.ok) return await res.json();
      return null;
    } catch (error) {
      console.error("Failed to update leave request status:", error);
      return null;
    }
  },


  // Fetch Admins Count
  getAdminsCount: async (): Promise<number> => {
    try {
      const usersData = await apiFetch<any[]>('/api/v1/users/?limit=10000', []);
      if (!Array.isArray(usersData)) return 3;
      
      const adminUsers = usersData.filter(u => 
        u.role === 'admin' || u.is_superuser === true || u.is_admin === true || u.user_role === 'admin'
      );
      
      return adminUsers.length > 0 ? adminUsers.length : 0;
    } catch (err) {
      return 0;
    }
  },

  // Fetch Students
  getStudents: async (includeDeleted: boolean = false): Promise<Student[]> => {
    const data = await apiFetch<any[]>('/api/v1/students/', []);
    if (!data || data.length === 0) return [];
    const activeData = includeDeleted ? data : data.filter((item: any) => item.is_deleted !== 1);
    
    // Map backend response fields to Student type
    return activeData.map((item, idx) => ({
      ...item,
      id: item.student_id || item.id || item.student_code || `STU${idx + 1}`,
      name: item.student_name || item.full_name || item.name || (item.first_name ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : 'N/A'),
      rollNo: item.student_code || 'N/A',
      age: item.age || null,
      gender: item.gender || 'N/A',
      batch: item.batch || item.current_year || item.year || (item.grade && item.grade.includes('2nd Year') ? '2026' : item.grade && item.grade.includes('3rd Year') ? '2025' : 'N/A'),
      grade: item.year || item.grade || item.class || 'N/A',
      college: item.college || item.school_name || item.college_name || 'N/A',
      course: (item.course && item.major) ? `${item.course} (${item.major})` : (item.course || item.major || 'N/A'),
      hostelRoom: item.hostel_room || 'N/A',
      parentName: item.father_name || item.mother_name || item.guardian_name || item.parent_name || 'N/A',
      parentPhone: item.father_contact_number || item.mother_contact_number || item.emergency_contact || 'N/A',
      attendance: item.attendance || null,
      avatar: formatAvatarUrl(item.profile_photo_link || item.profile_photo_url || item.avatar),
      location: {
        status: item.location_status || 'N/A',
        lastUpdated: item.last_updated || 'N/A',
        coordinates: item.coordinates || '',
        hostelDistance: '',
        collegeDistance: ''
      },
      leaveRequests: item.leave_requests || [],
      academicProgress: item.academic_progress || [],
      achievements: item.achievements || [],
      is_deleted: item.is_deleted,
      subjects: item.subjects || [],
      notes: item.notes || []
    }));
  },

  // Fetch Volunteers
  getVolunteers: async (includeDeleted: boolean = false): Promise<Volunteer[]> => {
    const [volsData, usersData] = await Promise.all([
      apiFetch<any[]>('/api/v1/volunteers/', []),
      apiFetch<any[]>('/api/v1/users/?limit=10000', [])
    ]);

    if (!volsData || volsData.length === 0) return [];
    
    // Create lookup map of users by user_id
    const userMap: Record<string, any> = {};
    if (Array.isArray(usersData)) {
      usersData.forEach(u => {
        if (u.user_id) userMap[u.user_id] = u;
      });
    }

    const activeVols = includeDeleted ? volsData : volsData.filter((item: any) => item.is_deleted !== 1);

    return activeVols.map((item, idx) => {
      const user = userMap[item.user_id] || {};
      
      // Determine real user name
      let realName = user.user_name || item.full_name || item.name;
      if (!realName || realName === 'string' || realName.trim() === '') {
        // Fallback to bio first sentence
        if (item.bio && item.bio.length > 5) {
          const match = item.bio.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          if (match) realName = match[1];
        }
      }
      if (!realName || realName === 'string' || realName.trim() === '') {
        realName = 'N/A';
      } else if (realName.toLowerCase() === realName) {
        realName = realName.replace(/\b\w/g, (c: string) => c.toUpperCase());
      }

      const realEmail = (user.user_email && user.user_email !== 'string') ? user.user_email : (item.email || 'N/A');
      const realPhone = (user.user_phone && user.user_phone !== 'string') ? user.user_phone : (item.phone || 'N/A');

      return {
        id: item.volunteer_id || item.id || `VOL${idx + 1}`,
        volunteer_id: item.volunteer_id,
        user_id: item.user_id,
        name: realName,
        email: realEmail,
        phone: realPhone,
        program: item.specialization || item.program || 'N/A',
        specialization: item.specialization || 'N/A',
        availability: item.availability || 'N/A',
        bio: item.bio || '',
        address: item.address || '',
        profile_photo_link: formatAvatarUrl(item.profile_photo_link),
        joined_date: item.joined_date || 'N/A',
        fcm_token: item.fcm_token || '',
        hoursContributed: item.hours_contributed || item.hours || 0,
        status: item.status || 'N/A',
        assignedStudents: item.assigned_students || [],
        role: item.specialization || 'N/A'
      };
    });
  },

  // Fetch Parents
  getParents: async (studentsList?: Student[], includeDeleted: boolean = false): Promise<Parent[]> => {
    const data = await apiFetch<any[]>('/api/v1/parents/', []);
    if (!data || data.length === 0) return [];
    const activeData = includeDeleted ? data : data.filter((item: any) => item.is_deleted !== 1);
    return activeData.map((item, idx) => {
      // Find matching student by student_id
      const matchedStudent = studentsList?.find(s => s.id === item.student_id || s.student_code === item.student_id || (s as any).student_id === item.student_id);

      // Determine real Guardian / Parent Name
      let parentName = item.parent_name || item.full_name || item.name;
      if (!parentName || parentName.trim() === '' || parentName === 'string') {
        if (matchedStudent) {
          if (item.relation === 'father') parentName = matchedStudent.father_name || matchedStudent.parentName;
          else if (item.relation === 'mother') parentName = matchedStudent.mother_name;
          else if (item.relation === 'guardian') parentName = matchedStudent.guardian_name;
          
          if (!parentName) {
            parentName = `${matchedStudent.name}'s ${item.relation ? item.relation.charAt(0).toUpperCase() + item.relation.slice(1) : 'Guardian'}`;
          }
        } else {
          parentName = item.relation ? `Guardian (${item.relation})` : 'N/A';
        }
      }

      const childName = matchedStudent?.name || item.student_name || item.child_name || 'N/A';
      const childId = matchedStudent?.id || item.student_id || '';

      const phone = item.parent_phone || item.phone || matchedStudent?.parentPhone || matchedStudent?.father_contact_number || matchedStudent?.mother_contact_number || 'N/A';

      const rel = item.relation ? item.relation.charAt(0).toUpperCase() + item.relation.slice(1) : 'Guardian';
      const guardianRole = item.is_primary ? `${rel} (Primary)` : rel;

      const occupation = item.occupation || matchedStudent?.father_occupation || matchedStudent?.mother_occupation || 'N/A';

      return {
        ...item,
        id: item.parent_id || item.id || `PAR${idx + 1}`,
        name: parentName,
        guardianName: guardianRole,
        phone: phone,
        childName: childName,
        childId: childId,
        relationship: rel,
        relation: rel,
        occupation: occupation,
        address: item.address || matchedStudent?.address || 'N/A',
        is_deleted: item.is_deleted
      };
    });
  },

  // Fetch Donors
  getDonors: async (includeDeleted: boolean = false): Promise<Donor[]> => {
    const [donorsData, usersData] = await Promise.all([
      apiFetch<any[]>('/api/v1/donors/?limit=10000', []),
      apiFetch<any[]>('/api/v1/users/?limit=10000', [])
    ]);

    if (!donorsData || donorsData.length === 0) return [];

    const userMap: Record<string, any> = {};
    if (Array.isArray(usersData)) {
      usersData.forEach(u => {
        if (u.user_id) userMap[u.user_id] = u;
      });
    }

    const activeDonors = includeDeleted ? donorsData : donorsData.filter((item: any) => item.is_deleted !== 1);

    return activeDonors.map((item, idx) => {
      const user = userMap[item.user_id] || {};

      let donorName = item.donor_name || item.organization_name || user.user_name || item.full_name || item.name;
      
      if (donorName && /^Donor\s*\d+$/i.test(donorName.trim())) {
        donorName = 'Anonymous Donor';
      }
      
      if (!donorName || donorName === 'string' || donorName.trim() === '') {
        donorName = `Anonymous Donor`;
      } else if (donorName.toLowerCase() === donorName) {
        donorName = donorName.replace(/\b\w/g, (c: string) => c.toUpperCase());
      }

      const email = (user.user_email && user.user_email !== 'string') ? user.user_email : 'N/A';
      const phone = (item.donor_phone && item.donor_phone !== 'string') ? item.donor_phone : 
                    ((user.user_phone && user.user_phone !== 'string') ? user.user_phone : 'N/A');
      const numAmount = parseFloat(item.total_donated) || 0;
      const formattedAmount = numAmount > 0 ? `₹${numAmount.toLocaleString('en-IN')}` : '₹0.00';
      
      const category = item.donor_type === 'organization' ? 'Corporate / Trust Sponsor' : (item.donor_type ? item.donor_type.charAt(0).toUpperCase() + item.donor_type.slice(1) : 'Individual Benefactor');

      return {
        id: item.donor_id || `DON${idx + 1}`,
        donor_id: item.donor_id,
        user_id: item.user_id,
        name: donorName,
        email: email,
        phone: phone,
        donorType: category,
        organizationName: item.organization_name || '',
        totalDonated: numAmount,
        formattedAmount: formattedAmount,
        status: 'Active Sponsor' as "Active Sponsor" | "Past Benefactor",
        profile_photo_link: formatAvatarUrl(item.profile_photo_link || user.profile_photo_link),
        joined_date: item.created_at ? item.created_at.split('T')[0] : 'N/A',
        address: item.address || 'N/A',
        is_deleted: item.is_deleted
      };
    });
  },

  // Fetch Expenses List
  getExpenses: async (): Promise<Expense[]> => {
    const data = await apiFetch<any[]>(`/api/v1/expenses/?skip=0&limit=5000`, []);
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    return data.map((item: any) => ({
      id: item.id || item.expense_id,
      title: item.title || 'N/A',
      category: item.category || 'N/A',
      amount: parseFloat(item.amount) || 0,
      date: item.date || new Date().toISOString(),
      refund_requested: item.refund_requested ?? false,
      is_private: item.is_private ?? false,
      is_foundation_paid: item.is_foundation_paid ?? true,
      status: (item.status || 'pending').toUpperCase(),
      user_id: item.user_id || null,
      student_id: item.student_id || null,
      target_group: item.target_group || 'ALL',
      created_by_name: item.created_by_name || 'N/A',
      approved_by_name: item.approved_by_name || item.approved_by || null,
      receipt_url: item.receipt_url || item.receipt || item.image_url || null,
      receipt_photo_link: item.receipt_photo_link || null,
      receipt_drive_link: item.receipt_drive_link || null,
      uploaded_by: item.uploaded_by || null
    }));
  },

  createUserForEntity: async (payload: any): Promise<string> => {
    try {
      const authHeaders = await getAuthHeader();
      const email = payload.email || '';

      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        
        try {
          const users = await apiFetch<any[]>('/api/v1/users/?limit=10000', []);
          if (Array.isArray(users)) {
            const existingUser = users.find((u: any) => u.user_email?.trim().toLowerCase() === cleanEmail);
            if (existingUser && existingUser.user_id) {
              return existingUser.user_id;
            }
          }
        } catch (err) {
          console.warn("User duplicate check failed:", err);
        }
      }

      const name = payload.donor_name || payload.student_name || payload.parent_name || payload.full_name || payload.organization_name || 'Unknown';
      const userPayload = {
        user_name: name,
        user_email: email,
        user_phone: payload.phone || payload.father_contact_number || payload.emergency_contact || '',
        password_hash: "default_hash",
        is_active: 1,
        is_deleted: 0,
        fcm_token: "",
        apple_account: null
      };
      const res = await fetch(`${BASE_URL}/api/v1/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(userPayload)
      });
      if (res.ok) {
        const createdUser = await res.json();
        return createdUser.user_id;
      }
      return "00000000-0000-0000-0000-000000000000";
    } catch (e) {
      console.error("User creation error:", e);
    }
    return "00000000-0000-0000-0000-000000000000";
  },

  updateUser: async (userId: string, payload: any): Promise<boolean> => {
    try {
      if (!userId || userId === "00000000-0000-0000-0000-000000000000") return false;
      const authHeaders = await getAuthHeader();
      const userPayload: any = {};
      if (payload.name && payload.name !== "N/A" && payload.name !== "string") userPayload.user_name = payload.name;
      else if (payload.donor_name && payload.donor_name !== "N/A" && payload.donor_name !== "string") userPayload.user_name = payload.donor_name;
      else if (payload.full_name && payload.full_name !== "N/A" && payload.full_name !== "string") userPayload.user_name = payload.full_name;

      if (payload.email && payload.email !== "N/A" && payload.email !== "string") userPayload.user_email = payload.email;
      if (payload.phone && payload.phone !== "N/A" && payload.phone !== "string") userPayload.user_phone = payload.phone;
      
      console.log("Sending User Update Payload:", userPayload);

      const res = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(userPayload)
      });
      if (!res.ok) {
        console.error("Failed to update user:", await res.text());
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error updating user:", err);
      return false;
    }
  },

  assignUserRole: async (userId: string, roles: string[]): Promise<boolean> => {
    try {
      if (!userId || userId === "00000000-0000-0000-0000-000000000000") return false;
      const authHeaders = await getAuthHeader();
      
      let existingRoleId = null;
      let existingRoles: string[] = [];
      try {
        const getRes = await fetch(`${BASE_URL}/api/v1/userroles/?limit=10000`, { headers: authHeaders });
        if (getRes.ok) {
          const allRoles = await getRes.json();
          const userRoleRecord = allRoles.find((r: any) => r.user_id === userId);
          if (userRoleRecord && !userRoleRecord.is_deleted) {
            existingRoleId = userRoleRecord.id;
            existingRoles = Array.isArray(userRoleRecord.role) ? userRoleRecord.role : [userRoleRecord.role];
          }
        }
      } catch (e) {
        console.warn("Could not fetch existing roles", e);
      }

      let finalRoles = [...existingRoles];
      roles.forEach(r => {
        if (!finalRoles.some(mr => mr.toLowerCase() === r.toLowerCase())) {
          finalRoles.push(r.toLowerCase());
        }
      });

      const payload = {
        user_id: userId,
        role: finalRoles,
        is_active: 0,
        is_deleted: 0
      };

      if (existingRoleId) {
        const res = await fetch(`${BASE_URL}/api/v1/userroles/${existingRoleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
        return res.ok;
      } else {
        const res = await fetch(`${BASE_URL}/api/v1/userroles/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
        return res.ok;
      }
    } catch (err) {
      console.error("Error assigning user role:", err);
      return false;
    }
  },


  // Create Student via FastAPI Backend
  createStudent: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const userId = await apiService.createUserForEntity(payload);
      
      const cleanPayload = { ...payload, user_id: userId };
      delete cleanPayload.email;
      delete cleanPayload.phone;
      delete cleanPayload.name;

      const existing = await apiService.getStudents(true);
      const alreadyExists = existing.find((s: any) => s.user_id === userId);
      if (alreadyExists) {
        if (alreadyExists.is_deleted === 1) {
          await apiService.updateStudent(alreadyExists.id, {
            ...cleanPayload,
            is_deleted: 0
          });
        }
        await apiService.assignUserRole(userId, ['student']);
        return alreadyExists;
      }

      const res = await fetch(`${BASE_URL}/api/v1/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(cleanPayload),
      });

      if (res.ok) {
        await apiService.assignUserRole(userId, ['student']);
        return await res.json();
      }

      if (res.status === 422 || res.status === 400) {
        const errDetail = await res.text();
        console.warn("FastAPI Error details:", errDetail);
      }

      return null;
    } catch (err) {
      console.error("Error creating student:", err);
      return null;
    }
  },

  // Create Volunteer
  createVolunteer: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const userId = await apiService.createUserForEntity(payload);
      
      const cleanPayload = {
        user_id: userId,
        is_deleted: 0,
        availability: payload.availability || 'Flexible',
        specialization: payload.specialization || 'General',
        profile_photo_link: payload.profile_photo_link || null,
        bio: payload.bio || '',
        joined_date: payload.joined_date || new Date().toISOString().split('T')[0]
      };

      const existing = await apiService.getVolunteers(true);
      const alreadyExists = existing.find((v: any) => v.user_id === userId);
      if (alreadyExists) {
        if (alreadyExists.is_deleted === 1) {
          await apiService.updateVolunteer(alreadyExists.id || (alreadyExists as any).volunteer_id, {
            ...cleanPayload,
            is_deleted: 0
          });
        }
        await apiService.assignUserRole(userId, [payload.specialization === 'Admin' ? 'admin' : 'volunteer']);
        return alreadyExists;
      }

      const res = await fetch(`${BASE_URL}/api/v1/volunteers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(cleanPayload),
      });

      if (res.ok) {
        await apiService.assignUserRole(userId, [payload.specialization === 'Admin' ? 'admin' : 'volunteer']);
        return await res.json();
      }

      if (res.status === 422 || res.status === 400) {
        const errDetail = await res.text();
        console.warn("FastAPI Error details:", errDetail);
      }

      return null;
    } catch (err) {
      console.error("Error creating volunteer:", err);
      return null;
    }
  },

  // Create Parent
  createParent: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const userId = await apiService.createUserForEntity(payload);
      
      const cleanPayload = {
        user_id: userId,
        student_id: payload.student_id || "00000000-0000-0000-0000-000000000000",
        relation: payload.relation || 'Guardian',
        is_primary: payload.is_primary || 1,
        fcm_token: payload.fcm_token || null,
        is_deleted: payload.is_deleted || 0
      };

      // Parents can be linked to multiple students, so we don't strictly block by user_id alone here
      // But we can check if a parent with this exact user_id AND student_id exists
      const existing = await apiFetch<any[]>('/api/v1/parents/', []);
      const alreadyExists = existing?.find((p: any) => p.user_id === userId && p.student_id === cleanPayload.student_id);
      if (alreadyExists) {
        if (alreadyExists.is_deleted === 1) {
          await apiService.updateParent(alreadyExists.parent_id || alreadyExists.id, {
            ...cleanPayload,
            is_deleted: 0
          });
        }
        await apiService.assignUserRole(userId, ['parent']);
        return alreadyExists;
      }

      const res = await fetch(`${BASE_URL}/api/v1/parents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(cleanPayload),
      });

      if (res.ok) {
        await apiService.assignUserRole(userId, ['parent']);
        return await res.json();
      }

      if (res.status === 422 || res.status === 400) {
        const errDetail = await res.text();
        console.warn("FastAPI Error details:", errDetail);
      }

      return null;
    } catch (err) {
      console.error("Error creating parent:", err);
      return null;
    }
  },
  // Create Donor
  createDonor: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const userId = await apiService.createUserForEntity(payload);
      
      const cleanPayload = {
        user_id: userId,
        donor_type: payload.donor_type || 'individual',
        total_donated: payload.total_donated || "0",
        is_deleted: 0,
        organization_name: payload.organization_name || null,
        profile_photo_link: payload.profile_photo_link || null
      };

      const existing = await apiService.getDonors(true);
      const alreadyExists = existing.find((d: any) => d.user_id === userId);
      if (alreadyExists) {
        if (alreadyExists.is_deleted === 1 || (alreadyExists as any).status === 'Past Benefactor') {
          await apiService.updateDonor(alreadyExists.donor_id || alreadyExists.id, {
            ...cleanPayload,
            is_deleted: 0
          });
        }
        await apiService.assignUserRole(userId, ['donor']);
        return alreadyExists;
      }

      const res = await fetch(`${BASE_URL}/api/v1/donors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(cleanPayload),
      });
      if (res.ok) {
        await apiService.assignUserRole(userId, ['donor']);
        return await res.json();
      }
      
      if (res.status === 422 || res.status === 400) {
        console.warn("FastAPI Error details:", await res.text());
      }
      return null;
    } catch (err) {
      console.error("Error creating donor:", err);
      return null;
    }
  },

  getDonorStudentMappings: async (donorId: string): Promise<any[]> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/donorstudentmapping/donor/${donorId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error("Error fetching donor-student mappings:", err);
      return [];
    }
  },

  createDonorStudentMapping: async (payload: {
    donor_id: string;
    student_ids: string[];
    mapping_type?: string;
    amount_per_month?: number | string | null;
  }): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      
      const mappingPayload = {
        donor_id: payload.donor_id,
        student_ids: payload.student_ids,
        mapping_type: payload.mapping_type || (payload.student_ids.length > 1 ? "multiple" : "single"),
        is_active: 1,
        started_at: new Date().toISOString().split('T')[0],
        is_deleted: 0,
        amount_per_month: payload.amount_per_month || null,
        ended_at: null
      };

      const res = await fetch(`${BASE_URL}/api/v1/donorstudentmapping/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(mappingPayload),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorText = await res.text();
        console.error("Failed to create donor-student mapping:", errorText);
        return null;
      }
    } catch (err) {
      console.error("Error creating donor-student mapping:", err);
      return null;
    }
  },

  // Update Methods
  updateStudent: async (id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.error("Error updating student:", err);
      return null;
    }
  },

  updateParent: async (id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/parents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.error("Error updating parent:", err);
      return null;
    }
  },

  updateVolunteer: async (id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const cleanPayload = {
        user_id: payload.user_id || "00000000-0000-0000-0000-000000000000",
        is_deleted: payload.is_deleted || 0,
        address: payload.address || "string",
        profile_photo_link: payload.profile_photo_link || "string",
        bio: payload.bio || payload.specialization || "string",
        joined_date: payload.joined_date || new Date().toISOString().split('T')[0],
        volunteer_id: id
      };
      const res = await fetch(`${BASE_URL}/api/v1/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(cleanPayload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.error("Error updating volunteer:", err);
      return null;
    }
  },

  updateDonor: async (id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const cleanPayload = {
        user_id: payload.user_id || "00000000-0000-0000-0000-000000000000",
        donor_type: payload.donor_type || "individual",
        total_donated: Number(payload.total_donated || payload.contribution || 0),
        is_deleted: 0,
        organization_name: payload.organization_name || payload.donor_name || "string",
        profile_photo_link: payload.profile_photo_link || "string",
        address: payload.address || "string"
      };

      const res = await fetch(`${BASE_URL}/api/v1/donors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(cleanPayload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.error("Error updating donor:", err);
      return null;
    }
  },

  // Create Expense
  createExpense: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/expenses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 422) {
        const errDetail = await res.json();
        console.warn("FastAPI 422 Validation Error details:", errDetail);
      }
      return null;
    } catch (err) {
      console.error("Error creating expense:", err);
      return null;
    }
  },

  // Delete Entity Methods
  deleteStudent: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/students/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting student:", err); return false; }
  },

  deleteVolunteer: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/volunteers/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting volunteer:", err); return false; }
  },

  deleteParent: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/parents/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting parent:", err); return false; }
  },

  deleteDonor: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/donors/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting donor:", err); return false; }
  },

  deleteContribution: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/contributions/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting contribution:", err); return false; }
  },

  deleteAdmin: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch (err) { console.error("Error deleting admin:", err); return false; }
  },

  // Delete Expense
  deleteExpense: async (expenseId: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders,
        },
      });
      return res.ok;
    } catch (err) {
      console.error("Error deleting expense:", err);
      return false;
    }
  },

  // Update Expense Status & Approver
  updateExpenseStatus: async (expenseId: string, status: string, approvedBy: string | null): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          status: status.toLowerCase(),
          approved_by_name: approvedBy
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error updating expense status:", err);
      return false;
    }
  },

  // Update Expense Amount & Notes
  updateExpenseAmount: async (expenseId: string, amount: number, notes?: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          amount,
          notes,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error updating expense amount:", err);
      return false;
    }
  },

  // Upload Expense Receipt File
  uploadReceipt: async (expenseId: string, file: File): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BASE_URL}/api/v1/expenses/${expenseId}/receipt`, {
        method: 'POST',
        headers: {
          ...authHeaders
        },
        body: formData
      });
      return res.ok;
    } catch (err) {
      console.error("Error uploading receipt:", err);
      return false;
    }
  },

  // Fetch API Geofences List
  getGeofences: async (): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>('/api/v1/geofences/', []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Could not fetch geofencezones from API:", err);
      return [];
    }
  },

  // Fetch Student Tracking Sessions
  getTrackingSessions: async (): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>('/api/v1/trackingsessions/', []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Could not fetch tracking sessions from API:", err);
      return [];
    }
  },

  // Create API Geofence Record
  createGeofence: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofences/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.warn("Error posting geofencezone to API:", err);
      return null;
    }
  },

  // Update API Geofence Record
  updateGeofence: async (id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.warn("Error updating geofencezone via API:", err);
      return null;
    }
  },

  // Delete API Geofence Record
  deleteGeofence: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofences/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting geofence:', e);
      return false;
    }
  },

  deleteGeofenceGroup: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofencegroups/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting geofence group:', e);
      return false;
    }
  },

  deleteActivity: async (id: string): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/activities/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting activity:', e);
      return false;
    }
  },

  // Fetch API Geofence Groups List
  getGeofenceGroups: async (): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>('/api/v1/geofencegroups/', []);
      return data || [];
    } catch (err) {
      console.warn("Could not fetch geofencegroups from API:", err);
      return [];
    }
  },

  // Create API Geofence Group
  createGeofenceGroup: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofencegroups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.warn("Error posting geofencegroup to API:", err);
      return null;
    }
  },

  // Update API Geofence Group
  updateGeofenceGroup: async (group_id: string, payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/geofencegroups/${group_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.warn("Error updating geofencegroup to API:", err);
      return null;
    }
  },

  formatAvatarUrl: formatAvatarUrl,

  // Fetch Admin Stats Overview
  getAdminStats: async () => {
    return null; // MOCK: Endpoint throws 500
  },

  getAdminDashboard: async () => {
    return null; // MOCK: Endpoint throws 500
  },

  // Check API Connection Status
  checkApiHealth: async (): Promise<{ status: 'CONNECTED' | 'UNAUTHORIZED' | 'ERROR'; statusCode: number; url: string }> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/students/`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });
      if (res.ok) {
        return { status: 'CONNECTED', statusCode: res.status, url: BASE_URL };
      } else if (res.status === 401) {
        return { status: 'UNAUTHORIZED', statusCode: res.status, url: BASE_URL };
      } else {
        return { status: 'ERROR', statusCode: res.status, url: BASE_URL };
      }
    } catch (e) {
      return { status: 'ERROR', statusCode: 0, url: BASE_URL };
    }
  },

  // Fetch Activities
  getActivities: async (): Promise<Activity[]> => {
    try {
      const data = await apiFetch<any[]>('/api/v1/activities/?skip=0&limit=100', []);
      return data.map(item => ({
        ...item,
        activity_id: item.activity_id || Math.random().toString(),
        title: item.title || 'Untitled Activity',
        description: item.description || '',
        activity_date: item.activity_date || item.created_at || new Date().toISOString(),
        audience: item.audience || 'Everyone',
        images: item.images || []
      }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  },

  // Create Activity
  createActivity: async (activityData: Partial<Activity>): Promise<Activity | null> => {
    try {
      const authHeaders = await getAuthHeader();
      
      // Fallback for missing properties as per schema
      const payload = {
        student_id: null,
        created_by: "03501652-7a03-4d8e-950e-f4de09385dc3",
        is_published: 0,
        is_deleted: 0,
        activity_date: new Date().toISOString(),
        images: [],
        ...activityData
      };

      const res = await fetch(`${BASE_URL}/api/v1/activities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error('API request POST /api/v1/activities/ failed with status', res.status);
        return null;
      }
      
      const data = await res.json();
      return data as Activity;
    } catch (error) {
      console.error('Failed to create activity:', error);
      return null;
    }
  },

  // MOCK/STUB: Get Classes
  getClasses: async (): Promise<any[]> => {
    try {
      return await apiFetch<any[]>('/api/v1/classes/', []);
    } catch (error) {
      return [];
    }
  },

  // MOCK/STUB: Get Student Requests
  getStudentRequests: async (): Promise<any[]> => {
    try {
      return []; // MOCK: Endpoint throws 404
    } catch (error) {
      return [];
    }
  },

  // MOCK/STUB: Get Leave Requests
  getLeaveRequests: async (): Promise<any[]> => {
    try {
      return []; // MOCK: Endpoint throws 404
    } catch (error) {
      return [];
    }
  },

  getLeaveRequestsByStudent: async (studentId: string): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>(`/api/v1/leaverequests/student/${studentId}`, []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch student leave requests:", error);
      return [];
    }
  },

  getFeeRequestsByStudent: async (studentId: string): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>(`/api/v1/feerequests/student/${studentId}`, []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch student fee requests:", error);
      return [];
    }
  },

  getStudentAchievementsByStudent: async (studentId: string): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>(`/api/v1/studentachievements/student/${studentId}`, []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch student achievements:", error);
      return [];
    }
  },

  getSemestersByStudent: async (studentId: string): Promise<any[]> => {
    try {
      const data = await apiFetch<any[]>(`/api/v1/semesters/student/${studentId}`, []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch student semesters:", error);
      return [];
    }
  },

  // Fetch Contributions List
  getContributions: async (): Promise<Contribution[]> => {
    const data = await apiFetch<any[]>(`/api/v1/contributions/?skip=0&limit=5000`, []);
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    return data.map((item: any) => ({
      id: item.contribution_id || item.id || `REC${Date.now()}`,
      donorId: item.donor_id,
      donorName: item.donor_name || 'Donor',
      amount: parseFloat(item.amount) || 0,
      date: item.date || new Date().toISOString().split('T')[0],
      paymentMethod: item.payment_method || 'Bank Transfer',
      receiptSent: item.receipt_sent === 1 || item.receipt_sent === true,
      notes: item.notes || ''
    }));
  },

  // Create Contribution
  createContribution: async (payload: any): Promise<any> => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/v1/contributions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          donor_id: payload.donorId,
          amount: String(payload.amount),
          payment_method: payload.paymentMethod || 'Bank Transfer',
          date: payload.date || new Date().toISOString().split('T')[0],
          receipt_sent: payload.receiptSent ? 1 : 0,
          notes: payload.notes || '',
          is_deleted: 0
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create contribution');
      }
      return await res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Fetch Expense Analytics
  getExpenseAnalytics: async (): Promise<any> => {
    try {
      const data = await apiFetch<any>('/api/v1/stats/expenses-analytics', null);
      return data;
    } catch (error) {
      console.error("Failed to fetch expense analytics:", error);
      return null;
    }
  },

  // Send Receipt Email
  sendReceiptEmail: async (email: string, donorName: string, fileBlob: Blob): Promise<boolean> => {
    try {
      const authHeaders = await getAuthHeader();
      const formData = new FormData();
      formData.append('email', email);
      formData.append('donor_name', donorName);
      formData.append('file', fileBlob, 'Hope3_Donation_Receipt.pdf');

      const res = await fetch(`${BASE_URL}/api/v1/emails/send-receipt`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) {
        console.error("Failed to send receipt email:", await res.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error sending receipt email:", error);
      return false;
    }
  }
};
