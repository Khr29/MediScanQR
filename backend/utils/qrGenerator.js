const QRCode = require("qrcode");

/**
 * Generate a Data URL (Base64 string) for a QR Code
 * @param {Object|String} payload - Data to encode inside the QR
 * @returns {Promise<String>} Base64 Data URL string
 */
const generateQRCode = async (payload) => {
  try {
    const dataString =
      typeof payload === "object" ? JSON.stringify(payload) : String(payload);
    const qrDataUrl = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: "H", // High error tolerance
      margin: 2,
      width: 300,
      color: {
        dark: "#000000", // Medical theme blue primary
        light: "#FFFFFF",
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("QR Generation Error:", error);
    throw new Error("Failed to generate QR code");
  }
};

module.exports = { generateQRCode };
