#!/usr/bin/env node

/**
 * Security Audit Tool for Forensics Application
 * Scans the codebase for common security vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.findings = [];
    this.severityLevels = {
      CRITICAL: 'CRITICAL',
      HIGH: 'HIGH', 
      MEDIUM: 'MEDIUM',
      LOW: 'LOW',
      INFO: 'INFO'
    };
    
    // Patterns for security issues
    this.patterns = {
      hardcodedSecrets: [
        /(?:password|passwd|pwd)\s*[=:]\s*["']([^"']+)["']/gi,
        /(?:secret|api_?key|token)\s*[=:]\s*["']([^"']+)["']/gi,
        /(?:auth_?token|access_?token)\s*[=:]\s*["']([^"']+)["']/gi,
        /(?:private_?key|secret_?key)\s*[=:]\s*["']([^"']+)["']/gi,
      ],
      hardcodedAddresses: [
        /[A-Za-z0-9]{32,44}/g, // Solana wallet addresses
      ],
      localStorage: [
        /localStorage\.(setItem|getItem|removeItem)/gi,
        /sessionStorage\.(setItem|getItem|removeItem)/gi,
      ],
      sqlInjection: [
        /\$\{[^}]*\}/g, // Template literals that might contain user input
        /\+\s*req\.(query|params|body)/gi,
        /["'].*?\+.*?["']/g,
      ],
      xss: [
        /dangerouslySetInnerHTML/gi,
        /innerHTML\s*=/gi,
        /document\.write/gi,
        /eval\s*\(/gi,
      ],
      insecureHttp: [
        /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
      ],
      weakCrypto: [
        /md5|sha1(?!256|512)/gi,
        /Math\.random\(\)/gi,
      ],
      authIssues: [
        /auth.*localStorage/gi,
        /token.*localStorage/gi,
        /role.*localStorage/gi,
      ]
    };
  }

  async audit() {
    console.log('🔍 Starting Security Audit...\n');
    
    // Scan source code files
    await this.scanDirectory('.');
    
    // Check package.json for vulnerabilities
    await this.checkDependencies();
    
    // Check configuration files
    await this.checkConfigurations();
    
    // Generate report
    this.generateReport();
  }

  async scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip certain directories
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          continue;
        }
        await this.scanDirectory(fullPath);
      } else if (entry.isFile()) {
        // Only scan source code files
        if (/\.(ts|tsx|js|jsx|json|env|config\.js)$/i.test(entry.name)) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative('.', filePath);
      
      // Check for hardcoded secrets
      this.checkHardcodedSecrets(content, relativePath);
      
      // Check for authentication issues
      this.checkAuthenticationIssues(content, relativePath);
      
      // Check for XSS vulnerabilities
      this.checkXSSVulnerabilities(content, relativePath);
      
      // Check for SQL injection
      this.checkSQLInjection(content, relativePath);
      
      // Check for insecure HTTP
      this.checkInsecureHttp(content, relativePath);
      
      // Check for weak crypto
      this.checkWeakCrypto(content, relativePath);
      
      // Check for localStorage usage
      this.checkClientSideStorage(content, relativePath);
      
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  checkHardcodedSecrets(content, filePath) {
    // Check for hardcoded admin wallet
    if (content.includes('AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F')) {
      this.addFinding({
        severity: this.severityLevels.CRITICAL,
        category: 'Hardcoded Credentials',
        file: filePath,
        description: 'Hardcoded admin wallet address found',
        details: 'Admin wallet address "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F" is hardcoded in source code',
        remediation: 'Move admin wallet address to environment variables',
        cwe: 'CWE-798'
      });
    }

    // Check for other hardcoded secrets
    this.patterns.hardcodedSecrets.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addFinding({
            severity: this.severityLevels.HIGH,
            category: 'Hardcoded Secrets',
            file: filePath,
            description: 'Potential hardcoded secret found',
            details: `Found pattern: ${match.substring(0, 50)}...`,
            remediation: 'Use environment variables for sensitive data',
            cwe: 'CWE-798'
          });
        });
      }
    });
  }

  checkAuthenticationIssues(content, filePath) {
    // Check for localStorage auth usage
    if (/localStorage.*auth|auth.*localStorage/gi.test(content)) {
      this.addFinding({
        severity: this.severityLevels.HIGH,
        category: 'Authentication',
        file: filePath,
        description: 'Authentication data stored in localStorage',
        details: 'localStorage is vulnerable to XSS attacks',
        remediation: 'Use secure HTTP-only cookies for authentication',
        cwe: 'CWE-922'
      });
    }

    // Check for role-based access control issues
    if (/role.*localStorage|localStorage.*role/gi.test(content)) {
      this.addFinding({
        severity: this.severityLevels.HIGH,
        category: 'Authorization',
        file: filePath,
        description: 'User roles stored in client-side storage',
        details: 'Client-side role storage can be manipulated by users',
        remediation: 'Validate roles server-side only',
        cwe: 'CWE-602'
      });
    }

    // Check for predictable token generation
    if (/Date\.now\(\).*token|token.*Date\.now\(\)/gi.test(content)) {
      this.addFinding({
        severity: this.severityLevels.MEDIUM,
        category: 'Authentication',
        file: filePath,
        description: 'Predictable token generation',
        details: 'Tokens generated using timestamps are predictable',
        remediation: 'Use cryptographically secure random token generation',
        cwe: 'CWE-330'
      });
    }
  }

  checkXSSVulnerabilities(content, filePath) {
    this.patterns.xss.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        this.addFinding({
          severity: this.severityLevels.HIGH,
          category: 'Cross-Site Scripting (XSS)',
          file: filePath,
          description: 'Potential XSS vulnerability',
          details: `Found dangerous pattern: ${matches[0]}`,
          remediation: 'Use proper input sanitization and output encoding',
          cwe: 'CWE-79'
        });
      }
    });
  }

  checkSQLInjection(content, filePath) {
    // Check for template literals with user input
    if (/\$\{.*req\.(query|params|body)/gi.test(content)) {
      this.addFinding({
        severity: this.severityLevels.HIGH,
        category: 'SQL Injection',
        file: filePath,
        description: 'Potential SQL injection via template literals',
        details: 'User input directly interpolated in template literals',
        remediation: 'Use parameterized queries or input validation',
        cwe: 'CWE-89'
      });
    }
  }

  checkInsecureHttp(content, filePath) {
    const matches = content.match(this.patterns.insecureHttp[0]);
    if (matches) {
      this.addFinding({
        severity: this.severityLevels.MEDIUM,
        category: 'Insecure Transport',
        file: filePath,
        description: 'Insecure HTTP URL found',
        details: `Found: ${matches[0]}`,
        remediation: 'Use HTTPS for all external communications',
        cwe: 'CWE-319'
      });
    }
  }

  checkWeakCrypto(content, filePath) {
    if (/Math\.random\(\)/gi.test(content) && /password|token|key|secret/gi.test(content)) {
      this.addFinding({
        severity: this.severityLevels.MEDIUM,
        category: 'Weak Cryptography',
        file: filePath,
        description: 'Weak random number generation',
        details: 'Math.random() is not cryptographically secure',
        remediation: 'Use crypto.randomBytes() or crypto.getRandomValues()',
        cwe: 'CWE-338'
      });
    }
  }

  checkClientSideStorage(content, filePath) {
    if (/localStorage|sessionStorage/gi.test(content)) {
      // Skip if already flagged as auth issue
      if (!/auth|token|role/gi.test(content)) {
        this.addFinding({
          severity: this.severityLevels.LOW,
          category: 'Data Storage',
          file: filePath,
          description: 'Client-side storage usage detected',
          details: 'Client-side storage can be accessed by malicious scripts',
          remediation: 'Consider security implications of stored data',
          cwe: 'CWE-922'
        });
      }
    }
  }

  async checkDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check for known vulnerable packages (simplified check)
      const knownVulnerable = {
        'next': '15.2.4', // Has known vulnerabilities as per npm audit
      };

      Object.entries(packageJson.dependencies || {}).forEach(([pkg, version]) => {
        if (knownVulnerable[pkg]) {
          this.addFinding({
            severity: this.severityLevels.MEDIUM,
            category: 'Vulnerable Dependencies',
            file: 'package.json',
            description: `Vulnerable package detected: ${pkg}`,
            details: `Version ${version} has known security vulnerabilities`,
            remediation: 'Update to latest secure version',
            cwe: 'CWE-1104'
          });
        }
      });

      // Check for "latest" versions which could introduce vulnerabilities
      Object.entries({...packageJson.dependencies, ...packageJson.devDependencies}).forEach(([pkg, version]) => {
        if (version === 'latest') {
          this.addFinding({
            severity: this.severityLevels.LOW,
            category: 'Dependency Management',
            file: 'package.json',
            description: `Package pinned to "latest": ${pkg}`,
            details: 'Using "latest" can introduce breaking changes and vulnerabilities',
            remediation: 'Pin to specific versions',
            cwe: 'CWE-1104'
          });
        }
      });

    } catch (error) {
      console.error('Error checking dependencies:', error.message);
    }
  }

  async checkConfigurations() {
    // Check Next.js config
    try {
      const nextConfigContent = fs.readFileSync('next.config.mjs', 'utf8');
      
      if (/ignoreBuildErrors:\s*true/gi.test(nextConfigContent)) {
        this.addFinding({
          severity: this.severityLevels.MEDIUM,
          category: 'Build Configuration',
          file: 'next.config.mjs',
          description: 'TypeScript build errors are ignored',
          details: 'Ignoring build errors can hide security-related warnings',
          remediation: 'Fix TypeScript errors instead of ignoring them',
          cwe: 'CWE-1127'
        });
      }

      if (/ignoreDuringBuilds:\s*true/gi.test(nextConfigContent)) {
        this.addFinding({
          severity: this.severityLevels.MEDIUM,
          category: 'Build Configuration',
          file: 'next.config.mjs',
          description: 'ESLint errors are ignored during builds',
          details: 'Ignoring ESLint errors can hide security-related warnings',
          remediation: 'Fix ESLint errors instead of ignoring them',
          cwe: 'CWE-1127'
        });
      }

    } catch (error) {
      // File might not exist
    }

    // Check for missing security headers
    if (!fs.existsSync('middleware.ts') || !fs.readFileSync('middleware.ts', 'utf8').includes('X-Frame-Options')) {
      this.addFinding({
        severity: this.severityLevels.MEDIUM,
        category: 'Security Headers',
        file: 'middleware.ts',
        description: 'Missing security headers',
        details: 'Security headers like X-Frame-Options, CSP are not set',
        remediation: 'Add security headers in middleware',
        cwe: 'CWE-1021'
      });
    }
  }

  addFinding(finding) {
    this.findings.push({
      ...finding,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    console.log('\n🔒 SECURITY AUDIT REPORT');
    console.log('=' .repeat(50));
    
    const summary = this.generateSummary();
    console.log('\n📊 SUMMARY');
    console.log('-'.repeat(20));
    console.log(`Total Issues Found: ${this.findings.length}`);
    console.log(`Critical: ${summary.critical}`);
    console.log(`High: ${summary.high}`);
    console.log(`Medium: ${summary.medium}`);
    console.log(`Low: ${summary.low}`);
    console.log(`Info: ${summary.info}`);

    console.log('\n🚨 DETAILED FINDINGS');
    console.log('-'.repeat(30));

    // Group by severity
    const bySeverity = this.groupBySeverity();
    
    Object.keys(bySeverity).forEach(severity => {
      if (bySeverity[severity].length > 0) {
        console.log(`\n${this.getSeverityIcon(severity)} ${severity} ISSUES (${bySeverity[severity].length})`);
        console.log('='.repeat(40));
        
        bySeverity[severity].forEach((finding, index) => {
          console.log(`\n${index + 1}. ${finding.description}`);
          console.log(`   File: ${finding.file}`);
          console.log(`   Category: ${finding.category}`);
          console.log(`   Details: ${finding.details}`);
          console.log(`   Remediation: ${finding.remediation}`);
          console.log(`   CWE: ${finding.cwe || 'N/A'}`);
        });
      }
    });

    // Save report to file
    this.saveReportToFile();
    
    console.log('\n✅ Security audit complete!');
    console.log(`📄 Detailed report saved to: security-audit-report.json`);
    
    if (summary.critical > 0 || summary.high > 0) {
      console.log('\n⚠️  CRITICAL/HIGH severity issues found. Please address immediately!');
      process.exit(1);
    }
  }

  generateSummary() {
    return {
      critical: this.findings.filter(f => f.severity === this.severityLevels.CRITICAL).length,
      high: this.findings.filter(f => f.severity === this.severityLevels.HIGH).length,
      medium: this.findings.filter(f => f.severity === this.severityLevels.MEDIUM).length,
      low: this.findings.filter(f => f.severity === this.severityLevels.LOW).length,
      info: this.findings.filter(f => f.severity === this.severityLevels.INFO).length,
    };
  }

  groupBySeverity() {
    const groups = {
      [this.severityLevels.CRITICAL]: [],
      [this.severityLevels.HIGH]: [],
      [this.severityLevels.MEDIUM]: [],
      [this.severityLevels.LOW]: [],
      [this.severityLevels.INFO]: [],
    };

    this.findings.forEach(finding => {
      groups[finding.severity].push(finding);
    });

    return groups;
  }

  getSeverityIcon(severity) {
    const icons = {
      [this.severityLevels.CRITICAL]: '🔴',
      [this.severityLevels.HIGH]: '🟠',
      [this.severityLevels.MEDIUM]: '🟡',
      [this.severityLevels.LOW]: '🔵',
      [this.severityLevels.INFO]: 'ℹ️',
    };
    return icons[severity] || '⚫';
  }

  saveReportToFile() {
    const report = {
      summary: this.generateSummary(),
      timestamp: new Date().toISOString(),
      findings: this.findings,
      recommendations: this.getRecommendations()
    };

    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
  }

  getRecommendations() {
    return [
      {
        priority: 'Critical',
        action: 'Move hardcoded admin wallet address to environment variables',
        description: 'The admin wallet address should never be in source code'
      },
      {
        priority: 'High',
        action: 'Implement secure authentication using HTTP-only cookies',
        description: 'Replace localStorage authentication with secure server-side sessions'
      },
      {
        priority: 'High',
        action: 'Add server-side role validation',
        description: 'Never trust client-side role information'
      },
      {
        priority: 'Medium',
        action: 'Update vulnerable dependencies',
        description: 'Run npm audit fix and update to secure versions'
      },
      {
        priority: 'Medium',
        action: 'Add security headers',
        description: 'Implement CSP, X-Frame-Options, and other security headers'
      },
      {
        priority: 'Medium',
        action: 'Fix build configuration',
        description: 'Remove ignored TypeScript and ESLint errors'
      }
    ];
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.audit().catch(console.error);
}

module.exports = SecurityAuditor;