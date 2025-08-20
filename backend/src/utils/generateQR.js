const QRCode = require("qrcode");

// generate a QR code from text (like prescription ID or URL)
const generateQR = async (text) => {
  try {
    const qrDataURL = await QRCode.toDataURL(text);
    return qrDataURL;
  } catch (err) {
    console.error("QR generation error:", err);
    throw err;
  }
};

module.exports = generateQR;
