import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma, { initializeSystem } from '@/lib/db'
import { logger } from '@/lib/logger'
import { runComplianceCheck } from '@/lib/complianceEngine'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import fs from 'fs'

export async function GET(req: Request) {
  try {
    // 1. Initialize System Check
    await initializeSystem();
    
    logger.info("API CALL: Protocol GENERATE-APPROVAL");

    const { userId: clerkId } = auth()
    if (!clerkId) {
      logger.warn("AUTH FAILURE: Restricted Zone GENERATE-APPROVAL");
      return new Response('Unauthorized Protocol', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const city = searchParams.get('city') || 'Chennai'
    const plotSize = parseFloat(searchParams.get('plotSize') || '2400')
    const floors = parseInt(searchParams.get('floors') || '2')
    const height = parseFloat(searchParams.get('height') || '7')

    if (!projectId) {
      logger.error("VALIDATION FAILURE: Project ID Required");
      return new Response('Project ID Required', { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      logger.error(`NOT FOUND: Project ${projectId}`);
      return new Response('Project Ident Not Found', { status: 404 })
    }

    // 2. Localhost Verification Scan
    logger.info(`VERIFYING COMPLIANCE BEFORE APPROVAL: Project ${project.name}`);
    const complianceResult = await runComplianceCheck(projectId, {
      plotSize,
      floors,
      buildingHeight: height,
      city
    });
    
    logger.success(`COMPLIANCE VERIFIED: Status ${complianceResult.status}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 50px; color: #1a1a1a; }
          .header { text-align: center; border-bottom: 8px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
          .stamp { border: 6px double ${complianceResult.status === 'PASS' ? 'green' : 'red'}; color: ${complianceResult.status === 'PASS' ? 'green' : 'red'}; font-weight: 900; padding: 15px; display: inline-block; transform: rotate(-10deg); text-transform: uppercase; margin-bottom: 30px; }
          .content { line-height: 1.8; }
          .section { margin-top: 40px; }
          .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
          .item { border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
          .label { font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 14px; font-weight: bold; margin-top: 5px; }
          .violation { background: #fff5f5; border-left: 5px solid red; padding: 15px; margin-bottom: 10px; font-size: 12px; }
          .footer { margin-top: 80px; border-top: 2px solid #000; padding-top: 20px; font-size: 9px; text-align: center; font-weight: bold; text-transform: uppercase; color: #888; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="stamp">${complianceResult.status === 'PASS' ? 'Municipal Approved (IQ)' : 'Compliance Rejected'}</div>
          <h1 style="margin: 0; font-size: 40px; letter-spacing: -2px; font-weight: 900;">OFFICIAL BUILDING PERMIT</h1>
          <p style="font-size: 12px; font-weight: bold; color: #777; margin-top: 5px;">MUNICIPAL INFRASTRUCTURE & PLANNING AUTHORITY</p>
        </div>

        <div class="content">
          <p>Project Identifier <strong>${project.id}</strong> (${project.name}) has undergone automated structural and regulatory audit via ConstructIQ AI Protocol.</p>
          
          <div class="section">
            <div class="section-title">Site Parameters Audit</div>
            <div class="grid">
              <div class="item"><div class="label">Primary Sector</div><div class="value">${project.location || 'Central Sector'}</div></div>
              <div class="item"><div class="label">Regulatory Zone</div><div class="value">${city}</div></div>
              <div class="item"><div class="label">Audit Timestamp</div><div class="value">${new Date().toISOString()}</div></div>
              <div class="item"><div class="label">Compliance Status</div><div class="value" style="color: ${complianceResult.status === 'PASS' ? 'green' : 'red'}">${complianceResult.status}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Compliance Metrics</div>
            <div class="grid">
              <div class="item"><div class="label">Calculated FSI</div><div class="value">${complianceResult.metrics.fsi.toFixed(2)} / ${complianceResult.metrics.maxFsi} Max</div></div>
              <div class="item"><div class="label">Verified Height</div><div class="value">${height}m / ${complianceResult.metrics.maxHeight}m Max</div></div>
            </div>
          </div>

          ${complianceResult.violations.length > 0 ? `
            <div class="section">
              <div class="section-title">Operational Integrity Violations</div>
              ${complianceResult.violations.map(v => `
                <div class="violation">
                  <strong>${v.severity.toUpperCase()}:</strong> ${v.message}
                  <p style="margin: 5px 0 0 0; color: #444; font-style: italic;">Remediation Path: ${v.suggestion}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="footer">
          ConstructIQ Infrastructure Protocol IQ-V5 • Powered by Phase-5 Precision Intelligence • Official Digital Asset
        </div>
      </body>
      </html>
    `

    // 3. Robust Puppeteer Path Handling for localhost environments
    logger.info("INITIALIZING PDF GENERATOR: Protocol CHROMIUM-V5");
    let executablePath = await chromium.executablePath()
    
    // Fallback for local Mac/Windows environments
    if (!executablePath || !fs.existsSync(executablePath)) {
      const paths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      ];
      executablePath = paths.find(p => fs.existsSync(p)) || '';
    }

    if (!executablePath) {
      logger.error("SYSTEM FAILURE: Chromium executable path not found.");
      return new Response('Permit Protocol Error: Chromium Path Missing', { status: 500 })
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.args.includes('--use-gl=swiftshader') ? chromium.defaultViewport : null,
      executablePath,
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    })

    await browser.close()
    logger.success("PDF PERMIT GENERATED SUCCESSFULLY");

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PERMIT_${project.name.replace(/\s+/g, '_')}.pdf"`
      },
      status: 200
    })

  } catch (error) {
    logger.error('CRITICAL API PROTOCOL FAILURE: GENERATE-APPROVAL', error)
    return new Response('Permit Protocol Error: Internal Intelligence Engine Offline', { status: 500 })
  }
}
