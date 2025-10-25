const QRCode = require("qrcode");

const generateQR = async (data) => {
    if (!data) {
        const error = new Error("QR Code generation requires data to encode.");
        error.statusCode = 400; 
        throw error;
    }

    const options = {
        type: 'image/png',
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    };

    try {
        const qrCode = await QRCode.toDataURL(data, options);
        return qrCode;
    } catch (err) {
        console.error(`[QR Generator] Failed to generate QR code for data: ${data.substring(0, 30)}...`);
        err.statusCode = 500;
        throw err;
    }
};

module.exports = generateQR;