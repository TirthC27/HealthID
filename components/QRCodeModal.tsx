'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { QrCode, Download, Copy, X, Clock } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
  tokenData: any;
  timeLeft: number;
  onRegenerate: () => void;
}

export function QRCodeModal({ 
  isOpen, 
  onClose, 
  qrData, 
  tokenData, 
  timeLeft, 
  onRegenerate 
}: QRCodeModalProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyToken = async () => {
    if (tokenData?.token) {
      try {
        await navigator.clipboard.writeText(tokenData.token);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy token:', err);
      }
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `health-qr-${tokenData?.hcid || 'code'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Your Health QR Code</h3>
            </div>
            <div className="flex items-center space-x-2">
              {timeLeft > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
              <Button variant="secondary" onClick={onClose} size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-6">
            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
              <QRCode
                id="qr-code-svg"
                value={qrData}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                📱 How to use this QR code:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• Show this QR code to your doctor</li>
                <li>• Doctor scans it with their device</li>
                <li>• Secure access to your health records is granted</li>
                <li>• QR code expires in 15 minutes for security</li>
              </ul>
            </div>

            {/* Token Information */}
            {tokenData && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Token Details:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HCID:</span>
                    <code className="bg-white px-2 py-1 rounded text-gray-800">
                      {tokenData.hcid}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Token:</span>
                    <div className="flex items-center space-x-1">
                      <code className="bg-white px-2 py-1 rounded text-gray-800 text-xs">
                        {tokenData.token.substring(0, 12)}...
                      </code>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyToken}
                        className="p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expires:</span>
                    <span className="text-xs text-gray-800">
                      {new Date(tokenData.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Expiration Warning */}
            {timeLeft === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">
                  ⚠️ QR code has expired
                </p>
                <p className="text-red-500 text-xs mt-1">
                  Please generate a new QR code for security
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={onRegenerate}
                variant="secondary"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>New QR Code</span>
              </Button>
              
              <Button
                onClick={handleDownloadQR}
                variant="secondary"
                className="flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}