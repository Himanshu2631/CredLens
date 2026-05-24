import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- START DASHBOARD COMPILATION TESTS ---');

const expectedFiles = [
  'components/dashboard/MetricCard.jsx',
  'components/dashboard/TelemetryChart.jsx',
  'components/dashboard/RedundancyAlerts.jsx',
  'components/dashboard/InsightFeed.jsx',
  'app/dashboard/page.js'
];

function runTests() {
  try {
    // 1. Check if files exist and are non-empty
    console.log('Verifying dashboard component paths and existence...');
    for (const relPath of expectedFiles) {
      const absPath = path.resolve(process.cwd(), relPath);
      if (!fs.existsSync(absPath)) {
        console.error(`✗ Failure: Expected file does not exist: ${relPath}`);
        setTimeout(() => process.exit(1), 100);
        return;
      }
      const content = fs.readFileSync(absPath, 'utf8');
      if (!content || content.trim().length === 0) {
        console.error(`✗ Failure: File is empty: ${relPath}`);
        setTimeout(() => process.exit(1), 100);
        return;
      }
      console.log(`✓ Success: Found non-empty component: ${relPath}`);
    }

    // 2. Run ESLint synchronously to guarantee JSX syntax and style validity
    console.log('\nRunning ESLint verification on dashboard components...');
    try {
      execSync('npx eslint app/dashboard/page.js components/dashboard/', {
        stdio: 'inherit',
        env: process.env
      });
      console.log('✓ Success: ESLint verification passed with 0 errors.');
    } catch (eslintErr) {
      console.error('✗ Failure: ESLint verification failed.');
      setTimeout(() => process.exit(1), 100);
      return;
    }

  } catch (err) {
    console.error('✗ Unexpected test runner crash:', err);
    setTimeout(() => process.exit(1), 100);
    return;
  }

  console.log('\n--- DASHBOARD COMPILATION TESTS PASSED ---');
  setTimeout(() => process.exit(0), 100);
}

runTests();
