const mongoose = require('mongoose');

const verifyQR = (qrData) => {
    if (!qrData || typeof qrData !== "string") {
        const error = new Error("Invalid QR code data: data is missing or not a string.");
        error.statusCode = 400; 
        throw error;
    }

    // Assumes QR code contains a Prescription ID
    if (!mongoose.Types.ObjectId.isValid(qrData)) {
        const error = new Error("Invalid QR code data: format does not match required ID structure.");
        error.statusCode = 400; 
        throw error;
    }

    return true;
};

module.exports = verifyQR;