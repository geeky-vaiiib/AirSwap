#!/usr/bin/env node

/**
 * Production Security Audit Script
 * Comprehensive security checks for AirSwap production deployment
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class SecurityAuditor {
  constructor() {
    this.warnings = [];
    this.errors = [];
    this.info = [];
  }

  log(level, message) {
    const color = colors[level] || colors.reset;
    const prefix = `[${new Date().toISOString()}]`;
    console.log(`${colors.bold}${prefix}${color} ${message}${colors.reset}`);

    if (level === 'red') this.errors.push(message);
    else if (level === 'yellow') this.warnings.push(message);
    else if (level === 'blue') this.info.push(message);
  }

  checkEnvFile() {
    this.log('blue', '🔍 Checking environment variables...');

    const envPath = path.join(process.cwd(), '.env.local');

    if (!fs.existsSync(envPath)) {
      this.log('red', '❌ Critical: .env.local file not found!');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'SENTRY_DSN',
      'NEXT_PUBLIC_SENTRY_DSN'
    ];

    const criticalVars = ['JWT_SECRET', 'MONGODB_URI'];

    // Check for critical security variables
    for (const varName of criticalVars) {
      if (!envContent.includes(`${varName}=`)) {
        this.log('red', `❌ Critical: ${varName} not found in .env.local`);
      } else {
        this.log('green', `✅ ${varName} is configured`);
      }
    }

    // Check for development values in production
    if (process.env.NODE_ENV === 'production') {
      const devPatterns = [
        /JWT_SECRET=(test-|dev-|)/i,
        /MONGODB_URI=(mongodb:\/\/localhost|mongodb:\/\/127\.0\.0\.1)/i
      ];

      for (const pattern of devPatterns) {
        if (pattern.test(envContent)) {
          this.log('red', `❌ Security Risk: Found development values in production for ${pattern.toString()}`);
        }
      }
    }

    // Check for exposed secrets (weak patterns)
    const secretPatterns = [
      /password=123/i,
      /secret=password/i,
      /JWT_SECRET=your-secret/i,
      /API_KEY=test/i
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(envContent)) {
        this.log('red', `❌ Security Risk: Weak secret pattern detected: ${pattern.toString()}`);
      }
    }
  }

  checkDependencies() {
    this.log('blue', '🔍 Checking dependencies for security vulnerabilities...');

    try {
      const auditOutput = execSync('npm audit --json --silent', { encoding: 'utf8' });
      const audit = JSON.parse(auditOutput);

      if (audit.metadata.vulnerabilities.total > 0) {
        this.log('red', `❌ Security vulnerabilities found: ${audit.metadata.vulnerabilities.total} total`);
        this.log('red', `   High: ${audit.metadata.vulnerabilities.high || 0}`);
        this.log('red', `   Moderate: ${audit.metadata.vulnerabilities.moderate || 0}`);
        this.log('yellow', `   Low: ${audit.metadata.vulnerabilities.low || 0}`);
      } else {
        this.log('green', '✅ No security vulnerabilities found in dependencies');
      }
    } catch (error) {
      this.log('yellow', '⚠️  Could not run npm audit, install dependencies first');
    }
  }

  checkConfigFiles() {
    this.log('blue', '🔍 Checking configuration files...');

    const requiredFiles = [
      'next.config.js',
      'middleware.ts',
      'lib/auth.ts'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        this.log('red', `❌ Critical: Required security file missing: ${file}`);
      } else {
        this.log('green', `✅ ${file} exists`);
      }
    }
  }

  checkServerConfig() {
    this.log('blue', '🔍 Checking server security configuration...');

    // Check Next.js config for security headers
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');

      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy'
      ];

      for (const header of requiredHeaders) {
        if (!configContent.includes(header)) {
          this.log('yellow', `⚠️  Security header not found: ${header}`);
        } else {
          this.log('green', `✅ Security header configured: ${header}`);
        }
      }
    }

    // Check middleware for rate limiting
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

      if (middlewareContent.includes('RateLimiter') && middlewareContent.includes('429')) {
        this.log('green', '✅ Rate limiting implemented in middleware');
      } else {
        this.log('red', '❌ Rate limiting not properly implemented');
      }
    }
  }

  checkAuthSecurity() {
    this.log('blue', '🔍 Checking authentication security...');

    const authPath = path.join(process.cwd(), 'lib/auth.ts');
    if (!fs.existsSync(authPath)) {
      this.log('red', '❌ Critical: Auth file missing');
      return;
    }

    const authContent = fs.readFileSync(authPath, 'utf8');

    // Check for secure password hashing
    if (authContent.includes('bcrypt') && authContent.includes('saltRounds >= 12')) {
      this.log('green', '✅ Secure password hashing implemented (bcrypt with sufficient rounds)');
    } else {
      this.log('yellow', '⚠️  Password hashing may not be secure enough');
    }

    // Check for JWT secret validation
    if (authContent.includes('getJWTSecret()') && authContent.includes('throw new Error')) {
      this.log('green', '✅ JWT secret validation implemented');
    } else {
      this.log('red', '❌ JWT secret validation not properly implemented');
    }

    // Check for session security
    if (authContent.includes('SameSite=Strict') && authContent.includes('HttpOnly')) {
      this.log('green', '✅ Secure session cookies configured');
    } else {
      this.log('yellow', '⚠️  Session cookies may not be secure');
    }
  }

  generateReport() {
    this.log('blue', '📊 Generating security audit report...');

    console.log('\n' + '='.repeat(60));
    console.log('AIRSWAP PRODUCTION SECURITY AUDIT REPORT');
    console.log('='.repeat(60));

    console.log(`\n${colors.bold}AUDIT SUMMARY${colors.reset}`);
    console.log(`Errors: ${colors.red}${this.errors.length}${colors.reset}`);
    console.log(`Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);
    console.log(`Info: ${colors.blue}${this.info.length}${colors.reset}`);

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bold}CRITICAL ISSUES (Must Fix):${colors.reset}`);
      this.errors.forEach(error => console.log(`  ❌ ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}WARNINGS (Should Fix):${colors.reset}`);
      this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    }

    console.log(`\n${colors.bold}RECOMMENDATIONS:${colors.reset}`);
    console.log('• Run this audit before every production deployment');
    console.log('• Keep dependencies updated and patched');
    console.log('• Monitor Sentry for runtime security issues');
    console.log('• Regularly rotate JWT secrets and API keys');
    console.log('• Use HTTPS in production at all times');

    if (this.errors.length === 0) {
      console.log(`\n${colors.green}${colors.bold}✅ PASSED SECURITY AUDIT${colors.reset}`);
      return 0;
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ FAILED SECURITY AUDIT${colors.reset}`);
      return 1;
    }
  }

  async run() {
    this.log('blue', '🚀 Starting AirSwap Production Security Audit...');

    try {
      this.checkEnvFile();
      this.checkDependencies();
      this.checkConfigFiles();
      this.checkServerConfig();
      this.checkAuthSecurity();

      return this.generateReport();
    } catch (error) {
      this.log('red', `💥 Audit failed with error: ${error.message}`);
      return 1;
    }
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  process.exit(auditor.run());
}

module.exports = SecurityAuditor;
