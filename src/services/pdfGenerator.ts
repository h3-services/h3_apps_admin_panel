import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Contribution, Donor } from '../mockData';

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[-/T ]/);
    if (parts.length >= 3) {
      let y = parseInt(parts[0]);
      let m = parseInt(parts[1]) - 1;
      let d = parseInt(parts[2]);
      if (parts[0].length < 4 && parts[2].length === 4) {
        d = parseInt(parts[0]);
        m = parseInt(parts[1]) - 1;
        y = parseInt(parts[2]);
      }
      const dateObj = new Date(y, m, d);
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${month}/${day}/${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    }
  } catch (e) {}
  return dateStr;
};

export const generateContributionReceipt = async (
  contribution: Contribution,
  donor: Donor,
  download = false,
  currency: 'USD' | 'INR' = 'INR'
) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Add Logo
  try {
    const logoImg = await loadImage('/hope3_logo-removebg-preview.png');
    doc.addImage(logoImg, 'PNG', 20, 20, 25, 25);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('YOUR\nLOGO\nHERE', 32.5, 28, { align: 'center' });
    doc.circle(32.5, 32.5, 12, 'S');
  }

  // Header Texts
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0);
  doc.text('Donation Receipt', 105, 30, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('HOPE3 FOUNDATION', 105, 38, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('18129 NE 111th st, Redmond, WA 98052 US | +1 4258181900\nwww.hope3.org', 105, 43, { align: 'center' });

  // Basic Info
  doc.setFontSize(10);
  let y = 60;
  const displayDate = formatDate(contribution.date);
  
  // Receipt No
  doc.text('Receipt No:', 20, y);
  doc.setLineWidth(0.3);
  doc.line(40, y + 1, 90, y + 1);
  doc.text(contribution.id, 42, y - 1);

  y += 10;
  // Date & Tax ID
  doc.text('Date:', 20, y);
  doc.line(30, y + 1, 80, y + 1);
  doc.text(displayDate, 32, y - 1);

  doc.text('Tax ID Number (EIN):', 90, y);
  doc.line(128, y + 1, 190, y + 1);
  doc.text('', 130, y - 1); // Empty or fill with actual EIN if known

  y += 6;
  // Thick Separator Line
  doc.setLineWidth(1.0);
  doc.line(20, y, 190, y);
  
  // Donor Information Section
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Donor Information', 20, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 8;
  doc.text('Name:', 20, y);
  doc.setLineWidth(0.3);
  doc.line(32, y + 1, 190, y + 1);
  const donorName = donor?.name || contribution.donorName || '';
  doc.text(donorName, 34, y - 1);

  y += 10;
  doc.text('Address:', 20, y);
  doc.line(35, y + 1, 190, y + 1);
  const donorAddress = donor?.address && donor.address !== 'N/A' ? donor.address : '';
  doc.text(donorAddress, 37, y - 1);

  y += 10;
  doc.text('City:', 20, y);
  doc.line(29, y + 1, 80, y + 1);
  doc.text('State:', 85, y);
  doc.line(95, y + 1, 140, y + 1);
  doc.text('Zip Code:', 145, y);
  doc.line(162, y + 1, 190, y + 1);

  // Donation Information Section
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Donation Information', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let amountStr = '';
  if (contribution.amountUsd && contribution.amountInr) {
    amountStr = `$${contribution.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} / INR ${contribution.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  } else if (contribution.amountInr) {
    amountStr = `INR ${contribution.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  } else if (contribution.amountUsd) {
    amountStr = `$${contribution.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  } else if (currency === 'INR') {
    amountStr = `INR ${contribution.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  } else {
    amountStr = `$${contribution.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  y += 8;
  doc.text('Donation Amount:', 20, y);
  doc.line(50, y + 1, 120, y + 1);
  doc.text(amountStr, 52, y - 1);

  y += 10;
  doc.text('Donation Date:', 20, y);
  doc.line(45, y + 1, 120, y + 1);
  doc.text(displayDate, 47, y - 1);

  y += 10;
  doc.text('Payment Method:', 20, y);
  
  const drawCheckbox = (cx: number, cy: number, label: string, checked: boolean) => {
    doc.rect(cx, cy - 3, 3, 3);
    if (checked) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', cx + 0.5, cy - 0.5);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(label, cx + 5, cy);
  };

  const pm = (contribution.paymentMethod || '').toLowerCase();
  drawCheckbox(50, y, 'Cash', pm.includes('cash'));
  drawCheckbox(70, y, 'Check', pm.includes('check'));
  drawCheckbox(92, y, 'Credit Card', pm.includes('card'));
  drawCheckbox(122, y, 'Other', !pm.includes('cash') && !pm.includes('check') && !pm.includes('card'));

  y += 10;
  doc.text('Received By:', 20, y);
  doc.line(42, y + 1, 120, y + 1);
  doc.text('Hope3 Administration', 44, y - 1);

  y += 12;
  doc.text('Signature:', 20, y);
  doc.line(38, y + 1, 120, y + 1);

  // Bottom text box
  y += 20;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(20, y, 170, 35);
  
  doc.setFontSize(8);
  const exemptText = 'This organization is exempt from federal income tax under Section 501(c)(3) of the Internal Revenue Code. Contributions to this organization are tax-deductible to the fullest extent permitted by law.';
  const splitExempt = doc.splitTextToSize(exemptText, 160);
  doc.text(splitExempt, 25, y + 7);

  const ackText = 'For contributions of $250 or more: This receipt serves as your written acknowledgment as required by the IRS. No goods or services were provided in return for your contribution (unless noted above).';
  const splitAck = doc.splitTextToSize(ackText, 160);
  doc.text(splitAck, 25, y + 20);

  // 10. Fluid Waves Background Graphics
  // Light gray wave (left)
  doc.setFillColor(204, 208, 213);
  doc.moveTo(0, 228);
  doc.curveTo(35, 222, 75, 235, 105, 252);
  doc.curveTo(130, 265, 155, 280, 175, 297);
  doc.lineTo(0, 297);
  doc.fill();

  // Dark charcoal wave (overlapping swoop to right)
  doc.setFillColor(48, 50, 54);
  doc.moveTo(0, 297);
  doc.curveTo(35, 282, 65, 265, 95, 263);
  doc.curveTo(125, 261, 150, 266, 175, 254);
  doc.curveTo(192, 245, 202, 232, 210, 218);
  doc.lineTo(210, 297);
  doc.lineTo(0, 297);
  doc.fill();

  if (download) {
    doc.save(`Receipt_${contribution.id}.pdf`);
  }

  return doc;
};
