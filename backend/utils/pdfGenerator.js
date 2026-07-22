const PDFDocument = require('pdfkit');

/**
 * Build a Prescription PDF Buffer
 * @param {Object} prescription - Prescription database object
 * @returns {Promise<Buffer>} PDF Buffer
 */
const createPrescriptionPDF = (prescription) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(22).fillColor('#0284C7').text('MediScanQR - Official Prescription', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666666').text(`Prescription ID: ${prescription.prescriptionId}`, { align: 'center' });
      doc.moveDown(1.5);

      // Meta Info Table
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Doctor: ${prescription.doctorName}`);
      doc.text(`Patient: ${prescription.patientName} (Age: ${prescription.patientAge})`);
      doc.text(`Issued Date: ${new Date(prescription.createdAt || Date.now()).toLocaleDateString()}`);
      doc.text(`Status: ${prescription.status}`);
      doc.moveDown(1.5);

      // Medicines
      doc.fontSize(14).fillColor('#0284C7').text('Prescribed Medications:');
      doc.moveDown(0.5);

      prescription.medicines.forEach((med, index) => {
        doc.fontSize(11).fillColor('#000000').text(`${index + 1}. ${med.name} — ${med.dosage} (${med.frequency})`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createPrescriptionPDF };//INIT