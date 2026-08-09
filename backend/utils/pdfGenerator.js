const PDFDocument = require("pdfkit");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "../assets/mediscanqr-logo.png");

// MediScanQR brand system (must match frontend/tailwind.config.js).
const BRAND_PINK = "#E9005B";
const ACCENT_CYAN = "#16A9E0";
const INK = "#171717";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const PANEL = "#F8FAFC";

const STATUS_COLORS = {
  ACTIVE: ACCENT_CYAN,
  DISPENSED: "#16A34A",
  EXPIRED: "#DC2626",
  CANCELLED: "#64748B",
};

// Converts a `data:image/png;base64,....` string into a Buffer pdfkit can embed.
const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const base64 = dataUrl.split(",")[1];
  if (!base64) return null;
  try {
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
};

// The source PNG is a 1280x720 canvas with a small wordmark centered in a
// sea of whitespace - naively `fit`-ing the whole canvas into a header-sized
// box would shrink the visible logo to near-nothing. Instead we clip to a
// header-sized rect and draw the full image scaled/positioned so only the
// wordmark's own bounding box lands inside it (pre-measured from the PNG).
const LOGO_BOX = { minX: 380, minY: 306, maxX: 841, maxY: 404 };
const LOGO_NATURAL_WIDTH = 1280;

// Draws the real MediScanQR logo at the given width (height follows the
// wordmark's own aspect ratio). Returns the rendered height. Falls back to a
// plain-text wordmark if the asset can't be read, so a missing/corrupt file
// never breaks prescription PDF generation.
const drawLogo = (doc, x, y, width) => {
  const boxW = LOGO_BOX.maxX - LOGO_BOX.minX;
  const boxH = LOGO_BOX.maxY - LOGO_BOX.minY;
  const scale = width / boxW;
  const height = boxH * scale;
  try {
    doc.save();
    doc.rect(x, y, width, height).clip();
    doc.image(LOGO_PATH, x - LOGO_BOX.minX * scale, y - LOGO_BOX.minY * scale, {
      width: LOGO_NATURAL_WIDTH * scale,
    });
    doc.restore();
  } catch {
    doc
      .fontSize(16)
      .fillColor(INK)
      .font("Helvetica-Bold")
      .text("Medi", x, y, { continued: true })
      .fillColor(BRAND_PINK)
      .text("Scan", { continued: true })
      .fillColor(INK)
      .text("QR");
  }
  return height;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

/**
 * Build a professionally laid-out Prescription PDF.
 * @param {Object} prescription - Prescription database object (plain object or Mongoose doc)
 * @returns {Promise<Buffer>} PDF Buffer
 */
const createPrescriptionPDF = (prescription) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 48 });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const left = doc.page.margins.left;

      // ---- Header ----
      const logoHeight = drawLogo(doc, left, 36, 130);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(MUTED)
        .text("Secure QR-Based Digital Prescription", left, 36 + logoHeight + 6);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(INK)
        .text("Digital Prescription", left, 100);

      const statusColor = STATUS_COLORS[prescription.status] || MUTED;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(statusColor)
        .text(`STATUS: ${prescription.status}`, left, 128);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(`Prescription ID: ${prescription.prescriptionId}`, left, 145)
        .text(`Issued: ${formatDate(prescription.createdAt)}`, left, 158);

      doc.moveTo(left, 182).lineTo(left + pageWidth, 182).strokeColor(BORDER).lineWidth(1).stroke();

      // ---- Doctor / Patient panels ----
      const panelTop = 198;
      const panelWidth = (pageWidth - 16) / 2;
      const panelHeight = 92;

      doc.roundedRect(left, panelTop, panelWidth, panelHeight, 6).fillColor(PANEL).fill();
      doc.roundedRect(left + panelWidth + 16, panelTop, panelWidth, panelHeight, 6).fillColor(PANEL).fill();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(MUTED)
        .text("PRESCRIBING DOCTOR", left + 14, panelTop + 12);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(INK)
        .text(`Dr. ${prescription.doctorName || "Unknown"}`, left + 14, panelTop + 27);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(`License: ${prescription.doctorLicenseNumber || "N/A"}`, left + 14, panelTop + 46)
        .text(`Specialization: ${prescription.doctorSpecialization || "N/A"}`, left + 14, panelTop + 60);

      const rightPanelX = left + panelWidth + 30;
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(MUTED)
        .text("PATIENT", rightPanelX, panelTop + 12);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(INK)
        .text(prescription.patientName || "Unknown", rightPanelX, panelTop + 27);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(`Age: ${prescription.patientAge ?? "N/A"}`, rightPanelX, panelTop + 46);

      // ---- Medicines table ----
      let y = panelTop + panelHeight + 28;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(INK).text("Prescribed Medications", left, y);
      y += 20;

      const cols = [
        { label: "Medicine", width: pageWidth * 0.3 },
        { label: "Dosage", width: pageWidth * 0.15 },
        { label: "Frequency", width: pageWidth * 0.18 },
        { label: "Duration", width: pageWidth * 0.15 },
        { label: "Instructions", width: pageWidth * 0.22 },
      ];

      const drawRow = (values, opts = {}) => {
        let x = left;
        const rowFont = opts.header ? "Helvetica-Bold" : "Helvetica";
        const rowColor = opts.header ? INK : MUTED;
        const fontSize = opts.header ? 9 : 9;
        cols.forEach((col, i) => {
          doc
            .font(rowFont)
            .fontSize(fontSize)
            .fillColor(i === 0 && !opts.header ? INK : rowColor)
            .text(values[i] || "-", x, y, { width: col.width - 6 });
          x += col.width;
        });
      };

      doc.rect(left, y - 6, pageWidth, 20).fillColor(PANEL).fill();
      drawRow(cols.map((c) => c.label), { header: true });
      y += 22;

      (prescription.medicines || []).forEach((med) => {
        const rowHeight = Math.max(
          16,
          doc.heightOfString(med.instructions || "-", { width: cols[4].width - 6, fontSize: 9 }),
        );
        drawRow([med.name, med.dosage, med.frequency, med.duration || "-", med.instructions || "-"]);
        y += rowHeight + 8;
        doc.moveTo(left, y - 4).lineTo(left + pageWidth, y - 4).strokeColor(BORDER).lineWidth(0.5).stroke();
      });

      if (prescription.notes) {
        y += 10;
        doc.fontSize(9).font("Helvetica-Bold").fillColor(INK).text("Clinical Notes", left, y);
        y += 14;
        doc.fontSize(9).font("Helvetica").fillColor(MUTED).text(prescription.notes, left, y, { width: pageWidth });
        y += doc.heightOfString(prescription.notes, { width: pageWidth }) + 10;
      }

      if (prescription.status === "DISPENSED") {
        y += 10;
        doc.roundedRect(left, y, pageWidth, 44, 6).fillColor("#ECFDF5").fill();
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#065F46")
          .text("DISPENSED", left + 14, y + 10)
          .font("Helvetica")
          .fontSize(8)
          .text(
            `${formatDateTime(prescription.dispensedAt)}${
              prescription.dispensedBy ? `  •  Dispensed by ${prescription.dispensedBy}` : ""
            }`,
            left + 14,
            y + 24,
          );
        y += 58;
      } else if (prescription.status === "CANCELLED") {
        y += 10;
        doc.roundedRect(left, y, pageWidth, 30, 6).fillColor("#F1F5F9").fill();
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(MUTED)
          .text(`CANCELLED${prescription.cancelledAt ? ` on ${formatDate(prescription.cancelledAt)}` : ""}`, left + 14, y + 10);
        y += 44;
      }

      // ---- Signature + QR ----
      y += 12;
      const blockTop = y;
      doc.fontSize(8).font("Helvetica-Bold").fillColor(MUTED).text("DOCTOR SIGNATURE", left, blockTop);
      const sigBuffer = dataUrlToBuffer(prescription.doctorSignature);
      if (sigBuffer) {
        try {
          doc.image(sigBuffer, left, blockTop + 14, { fit: [160, 60] });
        } catch {
          doc.fontSize(9).font("Helvetica-Oblique").fillColor(MUTED).text("Signature unavailable", left, blockTop + 14);
        }
      } else {
        doc.fontSize(9).font("Helvetica-Oblique").fillColor(MUTED).text("No signature on file", left, blockTop + 14);
      }
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(`Signed by Dr. ${prescription.doctorName || "the prescribing doctor"}. This is a visual record, not a cryptographic signature.`, left, blockTop + 78, {
          width: 260,
        });

      const qrBuffer = dataUrlToBuffer(prescription.qrCode);
      const qrX = left + pageWidth - 100;
      doc.fontSize(8).font("Helvetica-Bold").fillColor(MUTED).text("VERIFICATION QR", qrX, blockTop, { width: 100, align: "right" });
      if (qrBuffer) {
        try {
          doc.image(qrBuffer, qrX, blockTop + 14, { fit: [100, 100] });
        } catch {
          // ignore - QR is optional in the PDF if the image can't be decoded
        }
      }

      // ---- Footer ----
      const footerY = doc.page.height - doc.page.margins.bottom - 40;
      doc.moveTo(left, footerY).lineTo(left + pageWidth, footerY).strokeColor(BORDER).lineWidth(1).stroke();
      doc
        .fontSize(7.5)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(
          `Verify this prescription at any time by scanning the QR code, or by its Prescription ID (${prescription.prescriptionId}) through MediScanQR.`,
          left,
          footerY + 8,
          { width: pageWidth },
        )
        .text(`Generated ${formatDateTime(new Date())} • MediScanQR Digital Prescription Platform`, left, footerY + 20, {
          width: pageWidth,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createPrescriptionPDF };
