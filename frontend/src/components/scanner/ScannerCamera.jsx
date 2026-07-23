import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera } from "lucide-react";

const ScannerCamera = ({ onScanSuccess, onScanError }) => {
  const qrRef = useRef(null);

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("camera-reader");
        qrRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        console.log("Available cameras:", cameras);

        if (!cameras || cameras.length === 0) {
          throw new Error("No camera found.");
        }

        await html5QrCode.start(
          {
            deviceId: {
              exact: cameras[0].id,
            },
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            console.log("QR Scanned:", decodedText);

            await html5QrCode.stop();

            if (onScanSuccess) {
              onScanSuccess(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore continuous scan failures
            // Uncomment if you want to debug:
            // console.log(errorMessage);
          }
        );
      } catch (err) {
        console.error("Scanner failed:", err);

        if (onScanError) {
          onScanError(err);
        }
      }
    };

    startScanner();

    return () => {
      if (
        qrRef.current &&
        qrRef.current.isScanning
      ) {
        qrRef.current
          .stop()
          .then(() => qrRef.current.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
        <Camera className="h-4 w-4 text-sky-600" />
        <span>Live Camera Scanner</span>
      </div>

      <div
        id="camera-reader"
        className="rounded-lg border border-slate-200"
      />
    </div>
  );
};

export default ScannerCamera;