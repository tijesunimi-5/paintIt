import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const modelsPath = path.join(process.cwd(), 'public', 'models');

    if (!fs.existsSync(modelsPath)) {
      return NextResponse.json({ models: [] });
    }

    const files = fs.readdirSync(modelsPath);
    const glbFiles = files.filter(f => f.toLowerCase().endsWith('.glb'));

    return NextResponse.json({ models: glbFiles });
  } catch (error) {
    console.error('Failed listing GLB models:', error);
    return NextResponse.json({ models: [] }, { status: 500 });
  }
}
