import React, { useState } from 'react';
import { themeClasses, colors } from '../theme';
import { X, UserPlus, BookOpen, Heart, Briefcase, GraduationCap, Users, CalendarDays, Search, Link as LinkIcon, Check } from 'lucide-react';
import { countryCodes } from '../utils/countryCodes';

interface EntityCreationModalProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, data: any) => void;
  initialData?: any;
  students?: any[];
}

const CustomInput = ({ name, placeholder, type = "text", onChange, required, value, maxLength }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{placeholder}</label>
    <input
      required={required}
      type={type}
      name={name}
      onChange={onChange}
      value={value || ''}
      maxLength={maxLength}
      placeholder={`Enter ${placeholder.toLowerCase()}`}
      className={`w-full px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`}
    />
  </div>
);

const CustomSelect = ({ name, placeholder, onChange, options, required, value }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{placeholder}</label>
    <div className="relative">
      <select
        required={required}
        name={name}
        onChange={onChange}
        value={value || ''}
        className={`w-full px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white appearance-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`}
      >
        <option value="" disabled>Select {placeholder.toLowerCase()}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);


const CustomPhoneInput = ({ name, placeholder, onChange, required, value, onCountryCodeChange, countryCodeValue }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{placeholder}</label>
    <div className="flex gap-2">
      <div className="relative w-1/3">
        <select
          value={countryCodeValue || '🇮🇳 IN (+91)'}
          onChange={onCountryCodeChange}
          className={`w-full px-3 py-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white appearance-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`}
        >
          {countryCodes.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      <input
        required={required}
        type="tel"
        name={name}
        onChange={onChange}
        value={value || ''}
        maxLength={15}
        placeholder="Enter number"
        className={`w-2/3 px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`}
      />
    </div>
  </div>
);

export const EntityCreationModal: React.FC<EntityCreationModalProps> = ({ type, isOpen, onClose, onSubmit, initialData, students = [] }) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [showStudentGrid, setShowStudentGrid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const toggleStudentLink = (studentId: string) => {
    const current = formData.linkedStudentIds || [];
    if (current.includes(studentId)) {
      setFormData({ ...formData, linkedStudentIds: current.filter((id: string) => id !== studentId) });
    } else {
      setFormData({ ...formData, linkedStudentIds: [...current, studentId] });
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    if (initialData) {
      let pPhone = initialData.phone || '';
      let pCodeLabel = '🇮🇳 IN (+91)';
      // Sort codes by length descending to match longest code first (e.g. +971 before +9)
      const codes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
      for (const c of codes) {
        if (pPhone.startsWith(c.code)) {
          pCodeLabel = c.label;
          pPhone = pPhone.slice(c.code.length).trim();
          break;
        }
      }

      if (type === 'Student') {
        setFormData({ ...initialData, countryCode: pCodeLabel, phone: pPhone, name: initialData.name || initialData.student_name, rollNo: initialData.rollNo || initialData.student_code, grade: initialData.grade || initialData.course || initialData.year, college: initialData.college || initialData.school_name });
      } else if (type === 'Parent') {
        setFormData({ ...initialData, countryCode: pCodeLabel, phone: pPhone, name: initialData.name || initialData.parent_name, relationship: initialData.guardianName || initialData.relationship || initialData.relation, childId: initialData.childId || initialData.student_id });
      } else if (type === 'Volunteer' || type === 'Admin') {
        setFormData({ ...initialData, countryCode: pCodeLabel, phone: pPhone, name: initialData.name || initialData.full_name, role: initialData.specialization || 'Admin' });
      } else if (type === 'Donor') {
        setFormData({ ...initialData, countryCode: pCodeLabel, phone: pPhone, name: initialData.name || initialData.organization_name, address: initialData.address, amount_inr: initialData.amount_inr || initialData.totalDonated || initialData.contribution || 0, amount_usd: initialData.amount_usd || 0 });
      } else {
        setFormData({ ...initialData, countryCode: pCodeLabel, phone: pPhone });
      }
    } else {
      setFormData({ countryCode: '🇮🇳 IN (+91)', phone: '' });
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (finalData.phone && finalData.countryCode) {
      const codeMatch = finalData.countryCode.match(/\(([^)]+)\)/);
      const code = codeMatch ? codeMatch[1] : finalData.countryCode;
      finalData.phone = `${code}${finalData.phone}`;
    }
    onSubmit(type, finalData);
    setFormData({ countryCode: '🇮🇳 IN (+91)', phone: '' });
    onClose();
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'activity': return <CalendarDays className="text-white" size={24} />;
      case 'Student': return <BookOpen className="text-white" size={24} />;
      case 'Parent': return <Users className="text-white" size={24} />;
      case 'Donor': return <Heart className="text-white" size={24} />;
      case 'Volunteer': return <UserPlus className="text-white" size={24} />;
      case 'Mentor': return <Briefcase className="text-white" size={24} />;
      case 'Alumnus': return <GraduationCap className="text-white" size={24} />;
      case 'Board Member': return <Briefcase className="text-white" size={24} />;
      default: return <UserPlus className="text-white" size={24} />;
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'activity':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <CustomInput required={!initialData} name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} />
            </div>
            <CustomSelect
              required={!initialData}
              name="activity_type"
              placeholder="Event Type"
              value={formData.activity_type}
              onChange={handleChange}
              options={["General", "Academic", "Event", "Workshop", "Other"]}
            />
            <CustomInput required={!initialData} name="audience" placeholder="Audience (e.g., Everyone)" value={formData.audience} onChange={handleChange} />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Event Image</label>
              <input
                type="file"
                accept="image/*"
                name="image_url"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData((prev: any) => ({ ...prev, image_url: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} text-sm font-medium text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:${themeClasses.bgPrimaryLight}/10 file:${themeClasses.textPrimaryDark} dark:file:text-white hover:file:${themeClasses.bgPrimaryLight}/20 cursor-pointer shadow-sm`}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Description</label>
              <textarea
                required={!initialData}
                name="description"
                value={formData.description || ''}
                onChange={handleChange as any}
                placeholder="Enter event description"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm min-h-[100px]`}
              />
            </div>
          </div>
        );
      case 'Student':
        return (
          <div className="space-y-6 overflow-y-auto pr-2 max-h-[60vh] custom-scrollbar">
            {/* Basic Info */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><UserPlus size={16} className="text-blue-500" /> Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                <CustomInput required={!initialData} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                <CustomInput required={!initialData} name="rollNo" placeholder="Roll Number / Student Code" value={formData.rollNo} onChange={handleChange} />
                <CustomInput name="date_of_birth" type="date" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} />
                <CustomSelect name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} options={["male", "female", "other"]} />
                <CustomInput name="blood_group" placeholder="Blood Group (e.g. O+)" value={formData.blood_group} onChange={handleChange} />
                <CustomSelect name="physically_challenged" placeholder="Physically Challenged" value={formData.physically_challenged?.toString() || "0"} onChange={(e: any) => setFormData({...formData, physically_challenged: parseInt(e.target.value)})} options={["0", "1"]} />
                {initialData && (
                  <>
                    <CustomInput name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} />
                    <CustomInput name="community" placeholder="Community" value={formData.community} onChange={handleChange} />
                  </>
                )}
              </div>
            </div>

            {/* Academic Info & Other Details - Only show on edit */}
            {initialData && (
              <>
                {/* Academic Info */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><BookOpen size={16} className="text-blue-500" /> Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <CustomInput name="college" placeholder="College / University" value={formData.college} onChange={handleChange} />
                    </div>
                    <CustomInput name="grade" placeholder="Course & Year (e.g. B.Tech 2nd Year)" value={formData.grade} onChange={handleChange} />
                    <CustomInput name="major" placeholder="Major / Specialization" value={formData.major} onChange={handleChange} />
                    <CustomInput name="college_address" placeholder="College Address" value={formData.college_address} onChange={handleChange} />
                    <CustomSelect name="batch" placeholder="Allocated Batch" value={formData.batch} onChange={handleChange} options={["Batch 2026", "Batch 2025", "Batch 2024", "Batch 2023", "Rcd-1", "Rcd-2", "Rcd-3"]} />
                    <CustomInput name="school_name" placeholder="School Name" value={formData.school_name} onChange={handleChange} />
                    <CustomInput name="school_name_10th" placeholder="10th School Name" value={formData.school_name_10th} onChange={handleChange} />
                    <CustomInput name="school_name_12th" placeholder="12th School Name" value={formData.school_name_12th} onChange={handleChange} />
                  </div>
                </div>

                {/* Address & Contact */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Heart size={16} className="text-rose-500" /> Contact & Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomPhoneInput name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onCountryCodeChange={(e: any) => setFormData({...formData, countryCode: e.target.value})} countryCodeValue={formData.countryCode} />
                    <CustomInput name="emergency_contact" placeholder="Emergency Contact" value={formData.emergency_contact} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <CustomInput name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} />
                    </div>
                    <CustomInput name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleChange} />
                    <CustomInput name="area" placeholder="Area" value={formData.area} onChange={handleChange} />
                    <CustomInput name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                    <CustomInput name="district" placeholder="District" value={formData.district} onChange={handleChange} />
                    <CustomInput name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <CustomInput name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
                    <CustomSelect name="hostel_or_dayscholar" placeholder="Mode (Hostel / Day Scholar)" value={formData.hostel_or_dayscholar} onChange={handleChange} options={["Hostel", "Day-Scholar", "Other"]} />
                    <CustomInput name="hostel_room" placeholder="Hostel Room / Details" value={formData.hostel_room} onChange={handleChange} />
                  </div>
                </div>

                {/* Family Details */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Users size={16} className="text-orange-500" /> Family Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <CustomInput name="parent_status" placeholder="Parent Status (e.g. Both alive)" value={formData.parent_status} onChange={handleChange} />
                    </div>
                    <CustomInput name="father_name" placeholder="Father's Name" value={formData.father_name} onChange={handleChange} />
                    <CustomInput name="father_occupation" placeholder="Father's Occupation" value={formData.father_occupation} onChange={handleChange} />
                    <CustomInput name="father_contact_number" placeholder="Father's Contact" value={formData.father_contact_number} onChange={handleChange} />
                    
                    <CustomInput name="mother_name" placeholder="Mother's Name" value={formData.mother_name} onChange={handleChange} />
                    <CustomInput name="mother_occupation" placeholder="Mother's Occupation" value={formData.mother_occupation} onChange={handleChange} />
                    <CustomInput name="mother_contact_number" placeholder="Mother's Contact" value={formData.mother_contact_number} onChange={handleChange} />

                    <CustomInput name="guardian_name" placeholder="Guardian's Name" value={formData.guardian_name} onChange={handleChange} />
                    <CustomInput name="guardian_occupation" placeholder="Guardian's Occupation" value={formData.guardian_occupation} onChange={handleChange} />
                    <CustomInput name="guardian_contact_number" placeholder="Guardian's Contact" value={formData.guardian_contact_number} onChange={handleChange} />
                    
                    <CustomInput type="number" name="number_of_siblings" placeholder="Number of Siblings" value={formData.number_of_siblings} onChange={handleChange} />
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Briefcase size={16} className="text-green-500" /> Financial & Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput name="bank_name" placeholder="Student Bank Name" value={formData.bank_name} onChange={handleChange} />
                    <CustomInput name="bank_account_number" placeholder="Student Acc Number" value={formData.bank_account_number} onChange={handleChange} />
                    <CustomInput name="bank_ifsc" placeholder="Student IFSC" value={formData.bank_ifsc} onChange={handleChange} />
                    <CustomInput name="parent_account_number" placeholder="Parent Acc Number" value={formData.parent_account_number} onChange={handleChange} />
                    <CustomInput name="parent_ifsc" placeholder="Parent IFSC" value={formData.parent_ifsc} onChange={handleChange} />
                    <CustomInput name="funders" placeholder="Funders" value={formData.funders} onChange={handleChange} />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><GraduationCap size={16} className="text-indigo-500" /> Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput name="profile_photo_link" placeholder="Profile Photo Link" value={formData.profile_photo_link} onChange={handleChange} />
                    <CustomInput name="folder_link" placeholder="Drive Folder Link" value={formData.folder_link} onChange={handleChange} />
                    <CustomInput name="documents_collected" placeholder="Documents Collected" value={formData.documents_collected} onChange={handleChange} />
                    <CustomSelect name="is_document_uploaded" placeholder="Documents Uploaded" value={formData.is_document_uploaded?.toString() || "0"} onChange={(e: any) => setFormData({...formData, is_document_uploaded: parseInt(e.target.value)})} options={["0", "1"]} />
                    
                    <CustomSelect name="currently_working" placeholder="Currently Working?" value={formData.currently_working?.toString() || "0"} onChange={(e: any) => setFormData({...formData, currently_working: parseInt(e.target.value)})} options={["0", "1"]} />
                    <CustomInput name="designation" placeholder="Job Designation" value={formData.designation} onChange={handleChange} />
                    <CustomInput name="location" placeholder="Work Location" value={formData.location} onChange={handleChange} />
                    
                    <CustomSelect name="is_married" placeholder="Married?" value={formData.is_married?.toString() || "0"} onChange={(e: any) => setFormData({...formData, is_married: parseInt(e.target.value)})} options={["0", "1"]} />
                    <CustomSelect name="are_you_on_track" placeholder="On Track?" value={formData.are_you_on_track?.toString() || "0"} onChange={(e: any) => setFormData({...formData, are_you_on_track: parseInt(e.target.value)})} options={["0", "1"]} />
                    <CustomSelect name="willing_to_do_volunteering" placeholder="Willing to Volunteer?" value={formData.willing_to_do_volunteering?.toString() || "0"} onChange={(e: any) => setFormData({...formData, willing_to_do_volunteering: parseInt(e.target.value)})} options={["0", "1"]} />
                    
                    <div className="md:col-span-2">
                      <CustomInput name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} />
                      <div className="mt-4">
                        <CustomInput name="other_notes" placeholder="Other Notes" value={formData.other_notes} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'Parent':
        return (
          <div className="space-y-4">
            <CustomInput required={!initialData} name="name" placeholder="Parent / Guardian Name" value={formData.name} onChange={handleChange} />
            <CustomSelect
              required={!initialData}
              name="relationship"
              placeholder="Relationship to Student"
              value={formData.relationship}
              onChange={handleChange}
              options={['Father', 'Mother', 'Legal Guardian', 'Other']}
            />
            <CustomPhoneInput required={!initialData} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onCountryCodeChange={(e: any) => setFormData({...formData, countryCode: e.target.value})} countryCodeValue={formData.countryCode} />
            <CustomInput required={!initialData} name="childId" placeholder="Child's Student ID" value={formData.childId} onChange={handleChange} />
            <CustomInput required={!initialData} name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} />
          </div>
        );
      case 'Donor':
        if (showStudentGrid) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white">Link Students</h3>
                <button type="button" onClick={() => setShowStudentGrid(false)} className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">Done</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {filteredStudents.map((student: any) => {
                  const isSelected = (formData.linkedStudentIds || []).includes(student.id || student.student_id);
                  return (
                    <div 
                      key={student.id || student.student_id} 
                      onClick={() => toggleStudentLink(student.id || student.student_id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                      <div className="font-bold text-sm text-slate-800 dark:text-white truncate pr-2">{student.student_name}</div>
                      {isSelected && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0"><Check size={12} className="text-white" /></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <CustomSelect
              required={!initialData}
              name="donor_type"
              placeholder="Donor Type"
              value={formData.donor_type || 'Individual'}
              onChange={handleChange}
              options={['Individual', 'Organization']}
            />
            <CustomInput required={!initialData} name="name" placeholder={formData.donor_type === 'Organization' ? "Organization Name" : "Donor Name"} value={formData.name} onChange={handleChange} />
            <CustomInput required={!initialData} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
            <CustomPhoneInput required={!initialData} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onCountryCodeChange={(e: any) => setFormData({...formData, countryCode: e.target.value})} countryCodeValue={formData.countryCode} />
            <CustomInput required={!initialData} name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

            {initialData && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Contributed</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                      className={`w-[85px] pl-4 pr-8 py-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-bold text-slate-900 dark:text-white appearance-none text-left cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <div className="relative flex-1 flex items-center bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <div className="absolute left-0 inset-y-0 flex items-center">
                      <div className="h-full py-0 pl-4 pr-3 flex items-center bg-transparent text-slate-600 dark:text-slate-300 font-bold text-sm border-r border-slate-200/80 dark:border-slate-700/50 rounded-l-xl">
                        {currency === 'USD' ? '$' : '₹'}
                      </div>
                    </div>
                    <input
                      type="number"
                      name={currency === 'USD' ? 'amount_usd' : 'amount_inr'}
                      value={currency === 'USD' ? formData.amount_usd || '' : formData.amount_inr || ''}
                      onChange={handleChange}
                      placeholder={currency === 'USD' ? "Contributed (USD)" : "Contributed (INR)"}
                      className="w-full pl-[45px] pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setShowStudentGrid(true)}
              className="w-full py-3.5 px-4 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <LinkIcon size={16} />
              {(formData.linkedStudentIds?.length || 0) > 0 ? `${formData.linkedStudentIds.length} Students Linked (Click to Edit)` : 'Link Students'}
            </button>
          </div>
        );
      case 'Admin':
        const isSuperAdmin = (sessionStorage.getItem('userRole') || '').toLowerCase().includes('super');
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <CustomInput required={!initialData} name="name" placeholder="Admin Name" value={formData.name} onChange={handleChange} />
            </div>
            <CustomInput required={!initialData} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
            <CustomPhoneInput required={!initialData} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onCountryCodeChange={(e: any) => setFormData({...formData, countryCode: e.target.value})} countryCodeValue={formData.countryCode} />
            {isSuperAdmin && (
              <CustomSelect
                name="role"
                placeholder="Admin Role"
                value={formData.role || 'Admin'}
                onChange={handleChange}
                options={['Admin', 'Super Admin']}
              />
            )}
          </div>
        );
      case 'Volunteer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <CustomInput required={!initialData} name="name" placeholder="Volunteer Name" value={formData.name} onChange={handleChange} />
            </div>
            <CustomInput required={!initialData} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
            <CustomPhoneInput required={!initialData} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onCountryCodeChange={(e: any) => setFormData({...formData, countryCode: e.target.value})} countryCodeValue={formData.countryCode} />
            <CustomInput required={!initialData} name="specialization" placeholder="Specialization (e.g., Mentorship, IT)" value={formData.specialization} onChange={handleChange} />
            <CustomSelect
              required={!initialData}
              name="availability"
              placeholder="Availability"
              value={formData.availability}
              onChange={handleChange}
              options={['Weekends', 'Weekdays', 'Evenings', 'Flexible']}
            />
          </div>
        );
      default:
        return <p className="text-slate-500 text-center py-4">Unknown entity type.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#111116]/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">

        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn-tab"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border border-white/20 shadow-lg shadow-blue-500/20 ${themeClasses.bgGradientMain} text-white`}>
              {getTypeIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{initialData ? 'Edit' : 'Add'} {type}</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {initialData ? `Update the details for this ${type.toLowerCase()}.` : `Fill in the details to register a new ${type.toLowerCase()}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <form id="entity-form" onSubmit={handleSubmit}>
            {renderFields()}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 flex justify-end gap-3 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="entity-form"
            className="px-8 py-3 rounded-xl text-sm font-bold gradient-btn-tab text-white hover:opacity-90 shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            {initialData ? 'Update' : 'Create'} {type}
          </button>
        </div>
      </div>
    </div>
  );
};
