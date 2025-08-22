'use client';

import React, { useState } from 'react';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function TestQRPage() {
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleQRGenerate = () => {
    setQrGenerated(true);
    console.log('QR Code generated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center">QR Code Generator Test</h1>
            <p className="text-gray-600 text-center">
              Testing the QR code generation functionality with real QR codes
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                This page tests the QR code generator with a sample HCID
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <QRCodeDisplay 
            hcid="HCID-TEST-001" 
            onGenerate={handleQRGenerate}
          />
          
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Test Instructions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Step 1: Generate QR Code</h4>
                  <p className="text-blue-800 text-sm">
                    Click "Generate QR Code" to create a real, scannable QR code using the qrcode library.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Step 2: Test Scanning</h4>
                  <p className="text-green-800 text-sm">
                    Use any QR code scanner app on your phone to scan the generated QR code. 
                    It should display the JSON data containing the token, HCID, and expiration time.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Step 3: Verify Data</h4>
                  <p className="text-purple-800 text-sm">
                    The QR code contains JSON data with a secure token that can be used for patient access.
                    The token data is also displayed below the QR code for testing purposes.
                  </p>
                </div>
                
                {qrGenerated && (
                  <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-green-800 font-medium">✅ QR Code Generated Successfully!</p>
                    <p className="text-green-700 text-sm mt-1">
                      The QR code is now ready for scanning and testing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}