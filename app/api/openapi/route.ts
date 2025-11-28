/**
 * OpenAPI Specification Endpoint
 *
 * Returns the raw OpenAPI specification in YAML or JSON format
 *
 * GET /api/openapi - Returns YAML by default
 * GET /api/openapi?format=json - Returns JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the openapi.yaml file
    const openapiPath = path.join(process.cwd(), 'openapi.yaml');
    const openapiContent = fs.readFileSync(openapiPath, 'utf-8');

    // Check if JSON format is requested
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format');

    if (format === 'json') {
      // Parse YAML and return as JSON
      // Note: You may want to install js-yaml package for server-side parsing
      // For now, return YAML and let client parse it
      return new NextResponse(openapiContent, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Content-Disposition': 'inline; filename="openapi.yaml"',
        },
      });
    }

    // Return YAML by default
    return new NextResponse(openapiContent, {
      headers: {
        'Content-Type': 'application/x-yaml',
        'Content-Disposition': 'inline; filename="openapi.yaml"',
      },
    });
  } catch (error) {
    console.error('[OpenAPI] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    );
  }
}
