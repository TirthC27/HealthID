'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useToast } from './ui/Toast';
import { verifyQRToken } from '@/utils/qr';
import { detectQRCode, detectQRCodeWithBarcodeAPI } from '@/utils/qr-detector';
import { Camera, QrCode } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (hcid: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showToast } = useToast();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Manual input received:', manualToken);
      
      // Try to parse as QR data first
      let token = manualToken.trim();
      let inputType = 'token';
      
      try {
        const qrData = JSON.parse(manualToken);
        token = qrData.token;
        inputType = 'qr-json';
        console.log('Parsed QR JSON:', qrData);
      } catch {
        // If not JSON, check if it's an HCID or token
        if (token.startsWith('HCID-')) {
          // Direct HCID input
          onScanSuccess(token);
          setManualToken('');
          showToast('success', 'HCID accepted successfully!');
          return;
        }
        // Treat as token directly
        inputType = 'direct-token';
      }
      
      console.log('Verifying token:', token, 'Type:', inputType);
      const hcid = verifyQRToken(token);
      console.log('Verification result:', hcid);
      
      if (hcid) {
        onScanSuccess(hcid);
        setManualToken('');
        showToast('success', `QR token verified successfully! Patient HCID: ${hcid}`);
      } else {
        showToast('error', 'Invalid or expired QR token. Please generate a new QR code.');
      }
    } catch (error) {
      console.error('QR processing error:', error);
      showToast('error', 'Invalid QR data format');
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning for QR codes
        startQRDetection();
      }
      
      showToast('info', 'Camera started. Position QR code in view to scan automatically.');
    } catch (error) {
      showToast('error', 'Could not access camera. Please use manual entry.');
      setIsScanning(false);
    }
  };

  const startQRDetection = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let scanCount = 0;
    
    const scanFrame = async () => {
      if (!isScanning || !video.videoWidth) {
        setTimeout(scanFrame, 100);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);

      scanCount++;
      
      // Try BarcodeDetector API first (if available)
      try {
        const barcodeResult = await detectQRCodeWithBarcodeAPI(video);
        if (barcodeResult.found) {
          handleQRDetection(barcodeResult.data);
          return;
        }
      } catch (error) {
        // BarcodeDetector not available, continue with image analysis
      }

      // Try image analysis every 10 frames to avoid performance issues
      if (scanCount % 10 === 0) {
        try {
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const result = detectQRCode(imageData);
            if (result.found) {
              handleQRDetection(result.data);
              return;
            }
          }
        } catch (error) {
          console.log('QR detection error:', error);
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    const handleQRDetection = (qrData: string) => {
      console.log('QR Code detected:', qrData);
      
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(qrData);
        if (parsed.token) {
          setManualToken(parsed.token);
          showToast('success', 'QR Code detected! Token filled automatically.');
        } else if (parsed.hcid) {
          setManualToken(parsed.hcid);
          showToast('success', 'QR Code detected! HCID filled automatically.');
        }
      } catch {
        // If not JSON, treat as direct token or HCID
        setManualToken(qrData);
        showToast('success', 'QR Code detected! Data filled automatically.');
      }
      
      // Stop scanning after detection
      stopCamera();
    };

    video.addEventListener('loadedmetadata', () => {
      scanFrame();
    });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopCamera();
      }
    };
  }, [isScanning]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <QrCode className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Scan Patient QR Code</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Camera Scanner */}
          <div>
            <h4 className="font-medium mb-3">Camera Scanner</h4>
            {!isScanning ? (
              <Button
                onClick={startCamera}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </Button>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-100 rounded-lg mb-3"
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none mb-3">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    {/* Scanning Frame */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                      <div className="animate-pulse bg-blue-500 h-0.5 w-full absolute top-1/2 opacity-50"></div>
                    </div>
                    
                    {/* Instructions */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                      Position QR code in the frame
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={stopCamera}
                  variant="secondary"
                  className="w-full"
                >
                  Stop Camera
                </Button>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Camera will automatically detect QR codes. 
                  Detected data will be filled in the manual entry field below.
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">Manual Entry</h4>
            <form onSubmit={handleManualSubmit}>
              <Input
                label="Patient HCID or QR Token"
                value={manualToken}
                onChange={setManualToken}
                placeholder="Enter HCID-XXXX-XXXX or QR token data"
                required
              />
              <Button type="submit" className="w-full">
                Verify Access
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
