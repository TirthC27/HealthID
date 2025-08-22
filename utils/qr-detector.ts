// QR Code Detection Utility
// This is a simplified QR detection for demo purposes
// In production, use libraries like @zxing/browser or qr-scanner

export interface QRDetectionResult {
  data: string;
  found: boolean;
}

export function detectQRCode(imageData: ImageData): QRDetectionResult {
  // Simplified QR detection algorithm
  // In a real app, this would use actual QR detection
  
  const { data, width, height } = imageData;
  
  // Look for QR-like patterns (simplified)
  const result = analyzeImageForQR(data, width, height);
  
  if (result.found) {
    return {
      data: result.data,
      found: true
    };
  }
  
  return { data: '', found: false };
}

function analyzeImageForQR(data: Uint8ClampedArray, width: number, height: number): QRDetectionResult {
  // Simplified pattern detection
  // Look for dark/light patterns that might indicate a QR code
  
  let darkPixels = 0;
  let lightPixels = 0;
  let patterns = 0;
  
  // Sample pixels in a grid pattern
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const i = (y * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (brightness < 128) {
        darkPixels++;
      } else {
        lightPixels++;
      }
      
      // Look for alternating patterns
      if (x > 0 && y > 0) {
        const prevI = (y * width + (x - 10)) * 4;
        const prevBrightness = (data[prevI] + data[prevI + 1] + data[prevI + 2]) / 3;
        
        if (Math.abs(brightness - prevBrightness) > 64) {
          patterns++;
        }
      }
    }
  }
  
  // Heuristic: QR codes have roughly balanced dark/light pixels and many patterns
  const totalPixels = darkPixels + lightPixels;
  const balanceRatio = Math.min(darkPixels, lightPixels) / totalPixels;
  const patternDensity = patterns / totalPixels;
  
  // Simulate QR detection after sufficient patterns
  if (balanceRatio > 0.3 && patternDensity > 0.1 && patterns > 20) {
    // Simulate finding a QR code with sample data
    // In real implementation, this would decode actual QR content
    return {
      data: JSON.stringify({
        token: `detected-${Date.now()}`,
        hcid: "HCID-CAM-SCAN",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }),
      found: true
    };
  }
  
  return { data: '', found: false };
}

// Alternative: Use BarcodeDetector API if available
export async function detectQRCodeWithBarcodeAPI(video: HTMLVideoElement): Promise<QRDetectionResult> {
  if ('BarcodeDetector' in window) {
    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });
      
      const barcodes = await barcodeDetector.detect(video);
      
      if (barcodes.length > 0) {
        return {
          data: barcodes[0].rawValue,
          found: true
        };
      }
    } catch (error) {
      console.log('BarcodeDetector not available or failed:', error);
    }
  }
  
  return { data: '', found: false };
}
