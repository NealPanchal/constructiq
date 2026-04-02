import prisma from './prisma';
import { logger } from './logger';

export interface MaterialEstimation {
  cement: number;  // Bags (50kg)
  steel: number;   // Tons
  bricks: number;  // Count
  sand: number;    // Cubic Feet
  costPerSqFt: number;
  totalCost: number;
}

/**
 * PRODUCTION COST ESTIMATION ENGINE
 * Uses Indian Standard building material ratios based on Built-up Area.
 * Scale: Structure + Basic Finish.
 */
export async function getMaterialEstimate(
  projectId: string,
  builtUpArea: number
): Promise<MaterialEstimation> {
  const totalArea = builtUpArea || 0;

  if (totalArea === 0) {
    throw new Error('Built-up area not defined for project. Material estimation aborted.');
  }

  // Engineering Ratios (Standard)
  const cementPerSqFt = 0.45; // bags
  const steelPerSqFt = 0.003; // tons
  const bricksPerSqFt = 22;   // units
  const sandPerSqFt = 1.3;    // cu.ft

  // Estimate volumes
  const cement = totalArea * cementPerSqFt;
  const steel = totalArea * steelPerSqFt;
  const bricks = totalArea * bricksPerSqFt;
  const sand = totalArea * sandPerSqFt;

  // Real-world Market Rates (Approximate INR)
  const cementPrice = 410;   // per bag
  const steelPrice = 78000;  // per ton
  const brickPrice = 14;     // per unit
  const sandPrice = 65;      // per cu.ft

  const totalCost = (cement * cementPrice) + (steel * steelPrice) + (bricks * brickPrice) + (sand * sandPrice);
  const costPerSqFt = totalCost / totalArea;

  // Persist structured estimate to DB
  await prisma.materialEstimate.create({
    data: {
      projectId,
      cement,
      steel,
      bricks,
      totalCost,
    }
  });

  return {
    cement,
    steel,
    bricks,
    sand,
    costPerSqFt,
    totalCost,
  };
}
