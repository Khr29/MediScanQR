// Verify QR Code data (basic validation)
const verifyQR = (qrData) => {
  if (!qrData || typeof qrData !== "string") {
    return false;
  }
  // You could add more advanced checks here (e.g., match format, decode, etc.)
  return true;
};

module.exports = verifyQR;
