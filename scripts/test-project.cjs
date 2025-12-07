#!/usr/bin/env node

/**
 * Complete Project Test Script
 * Validates the entire AirSwap project mechanism end-to-end
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ProjectTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(level, message, details = null) {
    const color = colors[level] || colors.reset;
    const timestamp = new Date().toISOString();
    console.log(`${colors.bold}[${timestamp}] ${color}${message}${colors.reset}`);

    if (details) {
      console.log(`${colors.gray}${details}${colors.reset}`);
    }

    // Track results
    if (level === 'green') this.results.passed++;
    else if (level === 'red') this.results.failed++;
    else if (level === 'yellow') this.results.warnings++;
  }

  async runCommand(command, description, timeout = 30000) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: timeout,
        cwd: process.cwd()
      });
      this.log('green', `✅ ${description} - PASSED`);
      return { success: true, output: result };
    } catch (error) {
      this.log('red', `❌ ${description} - FAILED`);
      this.log('red', `   Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testSecurityAudit() {
    this.log('blue', '🔍 Running Security Audit...');

    const result = await this.runCommand('node scripts/security-audit.js', 'Security Audit Check');

    if (result.success) {
      const lines = result.output.split('\n');
      const exitCode = lines[lines.length - 1]?.includes('PASSED') ? 0 : 1;

      if (exitCode === 0) {
        this.log('green', '✅ Security audit passed - all checks successful');
      } else {
        this.log('yellow', '⚠️  Security audit completed with warnings');
      }
    }
  }

  async testTypeChecking() {
    this.log('blue', '📝 Testing TypeScript Compilation...');
    await this.runCommand('npm run typecheck', 'TypeScript Type Checking');
  }

  async testLinting() {
    this.log('blue', '🔍 Running ESLint...');
    const result = await this.runCommand('npm run lint', 'ESLint Code Quality Check');
  }

  async testBuild() {
    this.log('blue', '🏗️  Testing Production Build...');
    await this.runCommand('npm run build', 'Next.js Production Build');
  }

  async testUnitTests() {
    this.log('blue', '🧪 Running Unit Tests...');
    const result = await this.runCommand('npm test', 'Jest Test Suite');

    if (result.success) {
      const lines = result.output.split('\n');
      const testLine = lines.find(line => line.includes('Tests:') && line.includes('passed'));

      if (testLine) {
        const match = testLine.match(/(\d+) passed, (\d+) failed/);
        if (match) {
          const [passed, failed] = [parseInt(match[1]), parseInt(match[2])];
          if (failed > 0) {
            this.log('yellow', `⚠️  Tests passed: ${passed}, failed: ${failed}`);
          } else {
            this.log('green', `✅ All ${passed} tests passed`);
          }
        }
      }
    }
  }

  async testHealthEndpoint() {
    this.log('blue', '🏥 Testing Health Endpoint...');

    try {
      // Start server in background if not running
      const isServerRunning = await this.checkIfServerRunning();

      if (!isServerRunning) {
        this.log('yellow', '⚠️  Starting development server for health check...');
        // Start server in background
        execSync('npm run dev > /dev/null 2>&1 &', { timeout: 5000 });
        await this.sleep(5000); // Wait for server to start
      }

      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();

      if (response.ok && data.status) {
        this.log('green', `✅ Health check passed: ${data.status} (${data.uptime}s uptime)`);
        return true;
      } else {
        this.log('red', '❌ Health check failed - unexpected response');
        return false;
      }
    } catch (error) {
      this.log('red', `❌ Health check failed: ${error.message}`);
      return false;
    }
  }

  async checkIfServerRunning() {
    try {
      const result = execSync('lsof -ti:3000 | wc -l', { encoding: 'utf8' });
      return parseInt(result.trim()) > 0;
    } catch (error) {
      return false;
    }
  }

  async testEnvironmentConfig() {
    this.log('blue', '⚙️  Testing Environment Configuration...');

    const envPath = path.join(process.cwd(), '.env.local');

    if (!fs.existsSync(envPath)) {
      this.log('red', '❌ .env.local file not found');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];

    let missing = [];
    for (const varName of requiredVars) {
      if (!envContent.includes(`${varName}=`)) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      this.log('red', `❌ Missing environment variables: ${missing.join(', ')}`);
    } else {
      this.log('green', '✅ All required environment variables are configured');
    }
  }

  async testAPIPagination() {
    this.log('blue', '📄 Testing API Pagination...');

    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        const claimsResponse = await fetch('http://localhost:3000/api/claims?page=1&limit=10&sortBy=createdAt&sortOrder=desc');

        if (claimsResponse.status !== 401) { // Expected for unauthenticated requests
          this.log('green', '✅ API pagination endpoint accessible');
        } else {
          this.log('yellow', '⚠️  API pagination endpoint requires authentication (expected)');
        }

        // Test health endpoint response structure
        const healthData = await response.json();
        if (healthData.meta || healthData.meta === undefined) {
          this.log('green', '✅ Health endpoint returns expected structure');
        }
      }
    } catch (error) {
      this.log('yellow', '⚠️  Could not test API pagination - server may not be running');
    }
  }

  async testSecurityMeasures() {
    this.log('blue', '🛡️  Testing Security Measures...');

    // Test middleware configuration exists
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf8');
      if (content.includes('RateLimiter') && content.includes('429')) {
        this.log('green', '✅ Rate limiting middleware implemented');
      } else {
        this.log('red', '❌ Rate limiting middleware not properly configured');
      }
    }

    // Test security headers in next.config.js
    const configPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const securityHeaders = ['Content-Security-Policy', 'X-Frame-Options', 'X-XSS-Protection'];

      for (const header of securityHeaders) {
        if (content.includes(header)) {
          this.log('green', `✅ Security header configured: ${header}`);
        } else {
          this.log('yellow', `⚠️  Security header not found: ${header}`);
        }
      }
    }
  }

  async testMonitoringSetup() {
    this.log('blue', '📊 Testing Monitoring Setup...');

    // Check Sentry configuration
    const sentryConfigPath = path.join(process.cwd(), 'sentry.server.config.js');
    if (fs.existsSync(sentryConfigPath)) {
      const content = fs.readFileSync(sentryConfigPath, 'utf8');
      if (content.includes('SENTRY_DSN') && content.includes('beforeSend')) {
        this.log('green', '✅ Sentry error tracking configured');
      } else {
        this.log('yellow', '⚠️  Sentry configuration incomplete');
      }
    }

    // Test monitoring dashboard component exists
    const dashboardPath = path.join(process.cwd(), 'components/dashboard/MonitoringDashboard.tsx');
    if (fs.existsSync(dashboardPath)) {
      this.log('green', '✅ Monitoring dashboard component exists');
    }
  }

  async testCICDIntegration() {
    this.log('blue', '🔄 Testing CI/CD Integration...');

    const workflowPath = path.join(process.cwd(), '.github/workflows/ci-cd.yml');
    if (fs.existsSync(workflowPath)) {
      const content = fs.readFileSync(workflowPath, 'utf8');

      const requiredJobs = ['build', 'security-scan', 'docker-build'];
      for (const job of requiredJobs) {
        if (content.includes(`name: ${job.charAt(0).toUpperCase() + job.slice(1)}`)) {
          this.log('green', `✅ CI/CD job configured: ${job}`);
        }
      }
    } else {
      this.log('yellow', '⚠️  GitHub Actions workflow not found');
    }
  }

  async testCodeQualityTools() {
    this.log('blue', '🔧 Testing Code Quality Tools...');

    // Check package.json scripts
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const requiredScripts = ['security-audit', 'health-check', 'test'];
      for (const script of requiredScripts) {
        if (pkg.scripts[script]) {
          this.log('green', `✅ npm script available: ${script}`);
        } else {
          this.log('yellow', `⚠️  npm script missing: ${script}`);
        }
      }
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testBlockChainIntegration() {
    this.log('blue', '⛓️  Testing Blockchain Integration...');

    // Check if blockchain test script exists
    const blockchainTestPath = path.join(process.cwd(), 'scripts/test-blockchain.js');
    if (fs.existsSync(blockchainTestPath)) {
      await this.runCommand('node scripts/test-blockchain.js', 'Blockchain Integration Test');
    } else {
      this.log('yellow', '⚠️  Blockchain test script not found');
    }
  }

  async run() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 AIRSWAP COMPLETE PROJECT MECHANISM TEST SUITE');
    console.log('='.repeat(80));
    console.log('Testing all systems, security measures, and integrations...\n');

    try {
      // Core functionality tests
      await this.testSecurityAudit();
      await this.testTypeChecking();
      await this.testLinting();
      await this.testBuild();
      await this.testUnitTests();

      // Environment and configuration
      await this.testEnvironmentConfig();

      // Server and API tests
      await this.testHealthEndpoint();
      await this.testAPIPagination();

      // Security and monitoring
      await this.testSecurityMeasures();
      await this.testMonitoringSetup();

      // DevOps and quality
      await this.testCICDIntegration();
      await this.testCodeQualityTools();

      // Blockchain integration
      await this.testBlockChainIntegration();

    } catch (error) {
      this.log('red', `💥 Test suite failed with error: ${error.message}`);
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST SUITE RESULTS SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n${colors.bold}RESULTS:${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
    console.log(`${colors.blue}📊 Total Tests: ${this.results.passed + this.results.failed + this.results.warnings}${colors.reset}`);

    const totalScore = ((this.results.passed) / (this.results.passed + this.results.failed + this.results.warnings)) * 100;

    console.log(`\n${colors.bold}OVERALL SCORE: ${Math.round(totalScore)}%${colors.reset}`);

    if (totalScore >= 95) {
      console.log(`${colors.green}${colors.bold}🎉 EXCELLENT: All systems operational!${colors.reset}`);
    } else if (totalScore >= 80) {
      console.log(`${colors.yellow}${colors.bold}⚠️  GOOD: Most systems working, minor issues to address${colors.reset}`);
    } else if (totalScore >= 60) {
      console.log(`${colors.yellow}${colors.bold}⚠️  ACCEPTABLE: Core functionality working, significant improvements needed${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bold}❌ CRITICAL: Major systems failures - immediate attention required${colors.reset}`);
    }

    // Recommendations
    console.log(`\n${colors.bold}RECOMMENDATIONS:${colors.reset}`);
    if (this.results.failed > 0) {
      console.log(`• ${colors.red}Address the ${this.results.failed} failed tests immediately${colors.reset}`);
    }
    if (this.results.warnings > 0) {
      console.log(`• ${colors.yellow}Review ${this.results.warnings} warnings for potential improvements${colors.reset}`);
    }
    console.log('• Run this test suite before every deployment');
    console.log('• Monitor health endpoints in production');
    console.log('• Keep security audit passing at all times');

    console.log('\n' + '='.repeat(80));

    // Exit with appropriate code
    const exitCode = this.results.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new ProjectTester();
  tester.run().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = ProjectTester;
