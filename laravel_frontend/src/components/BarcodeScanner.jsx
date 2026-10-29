import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, AlertCircle } from 'lucide-react';

function BarcodeScanner({ onScan, onClose }) {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [scanAttempts, setScanAttempts] = useState(0);
  const scannerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Configure scanner with specific hints for better detection
    const hints = new Map();
    const formats = [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.QR_CODE
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    scannerRef.current = new BrowserMultiFormatReader(hints);
    
    const scanBarcode = async () => {
      if (!isScanning || !webcamRef.current) return;

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
          return;
        }

        setScanAttempts(prev => prev + 1);

        const result = await scannerRef.current.decodeFromImageUrl(imageSrc);
        
        if (result && result.text && result.text !== lastScanned) {
          console.log('Barcode detected:', result.text);
          setLastScanned(result.text);
          setError('');
          
          // Call the onScan callback with the barcode
          onScan(result.text);
          
          // Small delay before allowing next scan
          setIsScanning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          setTimeout(() => {
            setIsScanning(true);
            setLastScanned('');
          }, 1500);
        }
      } catch (err) {
        // Silently continue scanning if no barcode found
        if (scanAttempts > 100 && scanAttempts % 50 === 0) {
          console.log('Still scanning... attempts:', scanAttempts);
        }
      }
    };

    // Start scanning with interval
    intervalRef.current = setInterval(scanBarcode, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (scannerRef.current) {
        scannerRef.current.reset();
      }
    };
  }, [isScanning, lastScanned, onScan, scanAttempts]);

  const videoConstraints = {
    facingMode: 'environment', // Use back camera on mobile
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Camera className="h-6 w-6 text-primary-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Scan Barcode</h3>
              <p className="text-sm text-gray-600">Position barcode within the frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black rounded-b-2xl overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={videoConstraints}
            className="w-full h-auto"
            onUserMediaError={(err) => {
              console.error('Camera error:', err);
              setError('Unable to access camera. Please check permissions.');
            }}
          />

          {/* Scanning Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-3/4 aspect-video">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-green-400 animate-scan-line"></div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {isScanning ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">Scanning... (Attempts: {scanAttempts})</span>
                </div>
                <p className="text-white text-xs mt-2">
                  Hold barcode steady and ensure good lighting
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full">
                  <span className="font-medium">✓ Barcode detected!</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Tip:</strong> Hold the barcode steady within the frame for best results. If not working, close and use manual input.
          </p>
        </div>
      </div>

      {/* CSS for scanning animation */}
      <style>{`
        @keyframes scan-line {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
