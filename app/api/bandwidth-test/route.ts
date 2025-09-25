import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create a 1MB test file (same size as defined in bandwidth-detection.ts)
    const testFileSize = 1 * 1024 * 1024; // 1MB
    const testData = new Uint8Array(testFileSize);
    
    // Fill with random data to prevent compression
    for (let i = 0; i < testFileSize; i++) {
      testData[i] = Math.floor(Math.random() * 256);
    }

    return new NextResponse(testData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": testFileSize.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error generating bandwidth test file:", error);
    return new NextResponse("Error generating test file", { status: 500 });
  }
} 