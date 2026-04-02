import prisma from './prisma';
import { logger } from './logger';

export interface ComplianceInput {
  plotSize: number;      // sq.ft (Fallback if project is new/empty)
  floors: number;
  buildingHeight: number; // meters
  city: string;
}

export interface Violation {
  message: string;
  severity: 'info' | 'warning' | 'critical';
  suggestion?: string;
}

export interface ComplianceResult {
  status: 'PASS' | 'FAIL';
  violations: Violation[];
  metrics: {
    fsi: number;
    maxFsi: number;
    maxHeight: number;
    minSetback: number;
  };
}

/**
 * PRODUCTION COMPLIANCE ENGINE
 * Evaluates construction parameters against city-specific legal rules.
 * Uses real project dimensions: Plot Area and Built-up Area.
 */
export async function runComplianceCheck(
  projectId: string,
  input: Partial<ComplianceInput>
): Promise<ComplianceResult> {
  const violations: Violation[] = [];

  // 1. Fetch Real Project & Rule Data
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) throw new Error(`Project identifier ${projectId} not found.`);

  const city = project.city || input.city || 'Chennai';
  const rule = await prisma.complianceRule.findUnique({
    where: { city }
  });

  if (!rule) {
    return {
      status: 'FAIL',
      violations: [{
        message: `Regulatory protocol not found for ${city}. Municipal database unreachable.`,
        severity: 'critical',
        suggestion: 'Contact Municipal Board for local zoning regulations.'
      }],
      metrics: { fsi: 0, maxFsi: 0, maxHeight: 0, minSetback: 0 }
    };
  }

  // 2. Perform Mathematical Compliance Calculations (STRICT)
  
  // A. FSI (Floor Space Index) -> REAL ENGINEERING LOGIC
  // FSI = Built-up Area / Plot Area
  const plotArea = project.plotArea || input.plotSize || 0;
  const builtUpArea = project.builtUpArea || 0;
  
  if (plotArea === 0) {
    violations.push({ message: "Plot area not defined. Calculation aborted.", severity: 'critical' });
  }

  const calculatedFSI = plotArea > 0 ? builtUpArea / plotArea : 0;

  if (calculatedFSI > (rule as any).maxFSI) {
    violations.push({
      message: `FSI Violation: Calculated FSI is ${calculatedFSI.toFixed(2)}, exceeding the limit of ${(rule as any).maxFSI} for ${city}.`,
      severity: 'critical',
      suggestion: 'Reduce built-up area to comply with municipal FAR regulations.'
    });
  }

  // B. Height Restriction
  const height = input.buildingHeight || 0;
  if (height > (rule as any).maxHeight) {
    violations.push({
      message: `Structural Height Breach: Building height ${height}m exceeds the limit of ${(rule as any).maxHeight}m.`,
      severity: 'critical',
      suggestion: 'Reduce total storeys or optimize floor height.'
    });
  }

  // C. Setback Integrity
  if ((input.floors || 0) > 4 && (rule as any).minSetback < 3) {
     violations.push({
       message: `Setback Breach: High-rise projects in ${city} require minimum ${(rule as any).minSetback}m clear zone.`,
       severity: 'critical',
       suggestion: 'Verify boundary setbacks are clear.'
     });
  }

  const status = violations.some(v => v.severity === 'critical') ? 'FAIL' : 'PASS';

  // 3. Persist check result to DB
  await prisma.complianceCheck.create({
    data: {
      projectId,
      inputData: input as any,
      result: status,
      violations: {
        create: violations.map(v => ({
          message: v.message,
          severity: v.severity,
          suggestion: v.suggestion
        }))
      }
    }
  });

  return {
    status,
    violations,
    metrics: {
      fsi: calculatedFSI,
      maxFsi: (rule as any).maxFSI,
      maxHeight: (rule as any).maxHeight,
      minSetback: (rule as any).minSetback
    }
  };
}
