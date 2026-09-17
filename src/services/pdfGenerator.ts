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
        const month = dateObj.toLocaleString('en-US', { month: 'long' });
        const year = dateObj.getFullYear();
        return `${day} ${month}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'long' });
      const year = d.getFullYear();
      return `${day} ${month}, ${year}`;
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

  // 1. Top Right - Hope3 Logo & Branding (Aligned with INVOICE)
  const logoSize = 22;
  const logoX = 134;
  const logoY = 16;

  try {
    const logoImg = await loadImage('/hope3_logo-removebg-preview.png');
    doc.addImage(logoImg, 'PNG', logoX, logoY, logoSize, logoSize);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(24, 24, 27);
    doc.text('HOPE3', logoX + logoSize + 3, logoY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('FOUNDATION', logoX + logoSize + 3, logoY + 16);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text('HOPE3', 190, 24, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('FOUNDATION', 190, 30, { align: 'right' });
  }

  // 2. Main Title - INVOICE (Moved higher, aligned horizontally with logo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(24, 24, 27);
  doc.text('INVOICE', 20, 33);

  // 3. Date
  const displayDate = formatDate(contribution.date);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Date: ', 20, 45);
  const datePrefixW = doc.getTextWidth('Date: ');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(displayDate, 20 + datePrefixW, 45);

  // 4. Two Columns - Billed to: and From:
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Billed to:', 20, 60);
  doc.text('From:', 115, 60);

  // Left Column - Billed to details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  let by = 66;
  const donorName = donor?.name || contribution.donorName || 'Valued Supporter';
  doc.text(donorName, 20, by);
  by += 4.8;

  if (donor?.organizationName && donor.organizationName !== 'N/A') {
    doc.text(donor.organizationName, 20, by);
    by += 4.8;
  }

  if (donor?.address && donor.address !== 'N/A') {
    const splitAddr = doc.splitTextToSize(donor.address, 80);
    doc.text(splitAddr, 20, by);
    by += splitAddr.length * 4.8;
  }

  if (donor?.email && donor.email !== 'N/A') {
    doc.text(donor.email, 20, by);
    by += 4.8;
  }

  if (donor?.phone && donor.phone !== 'N/A') {
    doc.text(donor.phone, 20, by);
    by += 4.8;
  }

  // Right Column - From details (Hope3 Foundation)
  let fy = 66;
  doc.text('Hope3 Foundation', 115, fy);
  fy += 4.8;
  doc.text('18129 NE 111th st, Redmond, WA 98052 US', 115, fy);
  fy += 4.8;
  doc.text('+1 4258181900', 115, fy);
  fy += 4.8;
  doc.text('treasurer@hope3.org', 115, fy);
  fy += 4.8;
  doc.text('www.hope3.org', 115, fy);

  // 5. Currency & Amount String Calculation
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

  // 6. Table
  const tableStartY = Math.max(98, by + 6, fy + 6);
  const notesText = contribution.notes ? `\nNote: ${contribution.notes}` : '';
  const itemDescription = `Donation Contribution\nThis receipt acknowledges your generous donation to HOPE3 org. We would like to thank you with sincere gratitude. This letter will serve as your receipt for tax purposes and certify that you did not receive any goods or services in exchange for your donation.${notesText}`;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 20, right: 20 },
    theme: 'plain',
    head: [['Item', 'Quantity', 'Price', 'Amount']],
    body: [
      [
        { content: itemDescription },
        '1',
        amountStr,
        amountStr
      ]
    ],
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [31, 41, 55],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }
    },
    styles: {
      fontSize: 9,
      textColor: [55, 65, 81],
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      lineColor: [229, 231, 235]
    },
    columnStyles: {
      0: { cellWidth: 76, halign: 'left' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 145;

  // 7. Divider Line under Table
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(20, finalY + 4, 190, finalY + 4);

  // 8. Total Line
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Total', 150, finalY + 13, { align: 'right' });
  doc.text(amountStr, 190, finalY + 13, { align: 'right' });

  // 9. Payment Method & Note
  const metaY = finalY + 28;
  const paymentMethod = contribution.paymentMethod || 'Cash';
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Payment method: ', 20, metaY);
  const pmW = doc.getTextWidth('Payment method: ');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(paymentMethod, 20 + pmW, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Note: ', 20, metaY + 6.5);
  const noteW = doc.getTextWidth('Note: ');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  const noteText = 'Thank you for choosing us! HOPE3 Foundation (EIN: 83-4354101) is a 501(c)(3) tax exempt non-profit organization.';
  const splitNote = doc.splitTextToSize(noteText, 145);
  doc.text(splitNote, 20 + noteW, metaY + 6.5);

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
    doc.save(`Invoice_${contribution.id}.pdf`);
  }

  return doc;
};
