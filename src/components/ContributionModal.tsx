import React, { useState } from 'react';
import { X, Receipt, Download, Mail, CheckCircle2, Eye, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { generateContributionReceipt } from '../services/pdfGenerator';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import type { Donor } from '../mockData';
import { themeClasses } from '../theme';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  donors: Donor[];
}

export const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose, onSubmit, donors }) => {
  const [formData, setFormData] = useState({
    donorId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    notes: ''
  });
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  
  const selectedDonor = donors.find(d => d.id === formData.donorId) || null;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    if (!selectedDonor || !formData.amount) return;
    
    const previewContribution = {
      id: `PREVIEW`,
      donorId: formData.donorId,
      donorName: selectedDonor.name,
      amount: parseFloat(formData.amount),
      amountUsd: currency === 'USD' ? parseFloat(formData.amount) : undefined,
      amountInr: currency === 'INR' ? parseFloat(formData.amount) : undefined,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      receiptSent: false
    };
    
    const doc = await generateContributionReceipt(previewContribution as any, selectedDonor, false, 'USD');
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    if (!isAnonymous && (!formData.donorId || !selectedDonor)) return;
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Saving contribution...');
    
    try {
      if (!isAnonymous && selectedDonor) {
        toast.loading('Saving contribution & emailing receipt...', { id: loadingToast });
        // 1. Generate PDF Blob
      const previewContribution = {
        id: `REC${Date.now()}`,
        donorId: formData.donorId,
        donorName: selectedDonor.name,
        amount: parseFloat(formData.amount),
        amountUsd: currency === 'USD' ? parseFloat(formData.amount) : undefined,
        amountInr: currency === 'INR' ? parseFloat(formData.amount) : undefined,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        receiptSent: true
      };
      const doc = await generateContributionReceipt(previewContribution as any, selectedDonor, false, 'USD');
      const pdfBlob = doc.output('blob');
      
      // 2. Send email via backend
      if (!isAnonymous && selectedDonor && selectedDonor.email && selectedDonor.email !== 'N/A') {
        const emailSent = await apiService.sendReceiptEmail(selectedDonor.email, selectedDonor.name, pdfBlob);
        
        if (!emailSent) {
          toast.error(`Failed to send email. Contribution was NOT saved.`, { id: loadingToast });
          setIsSubmitting(false);
          return; // Stop execution, do not save to database
        }
        
        toast.success(`Receipt securely emailed to ${selectedDonor.email}!`, { id: loadingToast });
        setEmailSentStatus(true);
      } else if (!isAnonymous) {
        toast.success(`Contribution saved locally (no email provided).`, { id: loadingToast });
        setEmailSentStatus(false);
      }
      }

      await onSubmit({
        donorId: isAnonymous ? null : formData.donorId,
        donorName: isAnonymous ? 'Anonymous' : selectedDonor?.name,
        amount: parseFloat(formData.amount),
        amountUsd: currency === 'USD' ? parseFloat(formData.amount) : undefined,
        amountInr: currency === 'INR' ? parseFloat(formData.amount) : undefined,
        currency,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });
      if (isAnonymous) {
        toast.dismiss(loadingToast);
        toast.success('Anonymous contribution saved successfully!');
      }
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ donorId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '' });
        setIsAnonymous(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting contribution:", error);
      toast.error('Error processing contribution.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-6 sm:px-7 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center rounded-t-3xl shadow-sm relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -left-10 w-36 h-36 bg-[#062A78]/10 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            {/* Modern Icon Badge */}
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-2xl ${themeClasses.bgGradientMain} text-white flex items-center justify-center shadow-lg shadow-[#062A78]/25 ring-4 ring-[#062A78]/10 dark:ring-blue-400/15`}>
                <Receipt size={22} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Record Contribution
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  Donation
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Log donation and generate instant invoice receipt
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="relative z-10 p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 hover:rotate-90 active:scale-95 shadow-sm"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl flex items-center justify-center text-white relative z-10 transform transition-all hover:scale-110">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Awesome!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                {emailSentStatus 
                  ? <span>The donation has been logged and the receipt has been securely emailed to <strong className="text-slate-700 dark:text-slate-200">{selectedDonor?.email}</strong>.</span>
                  : `The donation has been successfully logged.`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`mt-4 px-10 py-3.5 rounded-2xl ${themeClasses.bgGradientMain} text-white font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all`}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">


            <div className={`space-y-1.5 transition-opacity ${isAnonymous ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Select Donor</label>
              <select
                required={!isAnonymous}
                name="donorId"
                value={formData.donorId}
                onChange={handleChange}
                disabled={isAnonymous}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium text-slate-900 dark:text-white appearance-none`}
              >
                <option value="" disabled>Select a donor</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Amount</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                      className={`w-[85px] pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-bold text-slate-900 dark:text-white appearance-none text-left cursor-pointer`}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-[#062A78]/40 focus-within:border-[#062A78]">
                    <div className="absolute left-0 inset-y-0 flex items-center">
                      <div className="h-full py-0 pl-4 pr-3 flex items-center bg-transparent text-slate-600 dark:text-slate-300 font-bold text-sm border-r border-slate-200 dark:border-slate-700/50 rounded-l-xl">
                        {currency === 'USD' ? '$' : '₹'}
                      </div>
                    </div>
                    <input
                      required
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder={currency === 'USD' ? "e.g. 50" : "e.g. 5000"}
                      className="w-full pl-[45px] pr-4 py-3 bg-transparent outline-none text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Date</label>
                <div className="relative flex-1">
                  <DatePicker
                    selected={new Date(formData.date)}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
                      }
                    }}
                    maxDate={new Date()}
                    dateFormat="MM/dd/yyyy"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium text-slate-900 dark:text-white`}
                    wrapperClassName="w-full"
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Payment Method</label>
              <select
                required
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium text-slate-900 dark:text-white appearance-none`}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special remarks for this donation..."
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none transition-all duration-200 ${themeClasses.focusRingLight} hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium text-slate-900 dark:text-white min-h-[80px]`}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-4 mb-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <input 
                type="checkbox" 
                id="anonymous" 
                checked={isAnonymous} 
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, donorId: '' }));
                  }
                }}
                className="w-4 h-4 text-[#20002c] rounded border-gray-300 focus:ring-[#062A78]"
              />
              <label htmlFor="anonymous" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                Anonymous Donation (No donor info required, no receipt sent)
              </label>
            </div>
            
            {!isAnonymous && selectedDonor && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 flex gap-3">
                <Mail className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                  Upon saving, a highly formatted PDF donation receipt will be securely generated and automatically emailed to <strong>{selectedDonor.email}</strong>.
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              {!isAnonymous && (
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!formData.donorId || !formData.amount}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye size={16} />
                  Preview Receipt
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!isAnonymous && !formData.donorId) || !formData.amount}
                className={`px-6 py-2.5 text-sm font-bold text-white ${themeClasses.bgGradientMain} rounded-xl shadow-lg ${themeClasses.shadowPrimaryDark} hover:opacity-90 transition-all flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isAnonymous ? <Download size={16} /> : <Mail size={16} />}
                    <span>{isAnonymous ? 'Save Contribution' : 'Send Receipt'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};