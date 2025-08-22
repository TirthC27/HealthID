'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { QRCodeModal } from './QRCodeModal';
import { generateQRCode } from '@/utils/qr';
import { QrCode, Sparkles } from 'lucide-react';

interface QRCodeDisplayProps {
  hcid: string;
  onGenerate: () => void;
}

export function QRCodeDisplay({ hcid, onGenerate }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [tokenData, setTokenData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const generateNew = async () => {
    try {
      console.log('Button clicked! Generating QR code for HCID:', hcid);
      setIsGenerating(true);
      
      const data = generateQRCode(hcid);
      console.log('Generated QR data:', data);
      
      const parsedData = JSON.parse(data);
      console.log('Parsed QR data:', parsedData);
      
      setQrData(data);
      setTokenData(parsedData);
      setTimeLeft(15 * 60); // 15 minutes in seconds
      setShowModal(true); // Show the popup modal
      
      onGenerate();
      console.log('QR Code generation completed successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRegenerate = () => {
    generateNew();
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold">Generate QR Code</h3>
            </div>
            {timeLeft > 0 && (
              <span className="text-sm text-orange-600 font-medium">
                Expires in: {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-3">
                <QrCode className="w-12 h-12 text-orange-600" />
              </div>
              <p className="text-gray-600 text-sm">
                Generate a secure QR code to share your health record access with doctors.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={generateNew}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={isGenerating}
              >
                <QrCode className="w-4 h-4" />
                <span>{isGenerating ? 'Generating...' : 'Generate QR Code'}</span>
              </Button>
              
              {qrData && (
                <Button
                  onClick={() => setShowModal(true)}
                  variant="secondary"
                  className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-orange-600 border-orange-200"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Display QR Code</span>
                </Button>
              )}
            </div>

            {timeLeft === 0 && qrData && (
              <p className="text-red-600 text-xs mt-3">
                QR code has expired. Please generate a new one.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        qrData={qrData}
        tokenData={tokenData}
        timeLeft={timeLeft}
        onRegenerate={handleRegenerate}
      />
    </>
  );
}
