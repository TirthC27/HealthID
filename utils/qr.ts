import { QRToken } from '@/types';
import { generateToken, generateId } from './auth';
import { pushItem, findItemBy, filterItems } from './storage';

export function generateQRCode(hcid: string): string {
  const token = generateToken();
  const qrToken: QRToken = {
    token,
    hcid,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    createdAt: new Date().toISOString()
  };
  
  pushItem('qrTokens', qrToken);
  
  // Return QR data as JSON string
  return JSON.stringify({
    token,
    hcid,
    expiresAt: qrToken.expiresAt
  });
}

export async function generateQRCodeSVG(data: string): Promise<string> {
  // Only run on client side to avoid server-side bundling issues
  if (typeof window === 'undefined') {
    return getFallbackSvg(data);
  }

  try {
    // Dynamic import to ensure client-side only execution
    const QRCode = await import('qrcode');
    
    // Generate actual QR code SVG using the qrcode library
    const svg = await QRCode.default.toString(data, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    return getFallbackSvg(data);
  }
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  // Only run on client side to avoid server-side bundling issues
  if (typeof window === 'undefined') {
    return 'data:image/svg+xml;base64,' + btoa(getFallbackSvg(data));
  }

  try {
    // Dynamic import to ensure client-side only execution
    const QRCode = await import('qrcode');
    
    return await QRCode.default.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    return 'data:image/svg+xml;base64,' + btoa(getFallbackSvg(data));
  }
}

function getFallbackSvg(data: string): string {
  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white" stroke="#e5e7eb" stroke-width="2"/>
    <text x="100" y="90" text-anchor="middle" fill="black" font-size="14">QR Code Error</text>
    <text x="100" y="110" text-anchor="middle" fill="gray" font-size="10">Failed to generate</text>
    <text x="100" y="130" text-anchor="middle" fill="gray" font-size="8">${data.substring(0, 20)}...</text>
  </svg>`;
}

export function verifyQRToken(token: string): string | null {
  const qrToken = findItemBy<QRToken>('qrTokens', t => t.token === token);
  
  if (!qrToken) {
    return null;
  }
  
  if (new Date(qrToken.expiresAt) < new Date()) {
    return null;
  }
  
  return qrToken.hcid;
}

export function cleanExpiredTokens() {
  const tokens = filterItems<QRToken>('qrTokens', t => new Date(t.expiresAt) > new Date());
  localStorage.setItem('qrTokens', JSON.stringify(tokens));
}
