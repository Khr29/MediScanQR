const QRCode = require("qrcode");

// Generate QR code
const generateQR = async (data) => {
  try {
    // Creates QR Code as a string (base64 image)
    const qrCode = await QRCode.toDataURL(data);
    return qrCode;
  } catch (err) {
    console.error("QR Code generation failed:", err);
    throw err;
  }
};

module.exports = generateQR;
