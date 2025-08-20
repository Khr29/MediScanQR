const QRCode = require("qrcode");

const generateQR = async (text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text);
    return qrDataUrl;
  } catch (err) {
    console.error("QR generation error:", err);
    throw err;
  }
};

module.exports = generateQR;
