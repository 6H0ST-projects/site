/**
 * This file serves as a reference point for the Product Health Analyzer.
 * When users visit the health-analyzer URL, they will be redirected to the dedicated project page.
 */

import { redirect } from 'next/navigation';

export function redirectToHealthAnalyzer() {
  redirect('/projects/project-529');
} 