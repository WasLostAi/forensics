#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Security Analysis...\n');

// Check for common security issues
const securityChecks = [
  {
    name: 'Environment Files Check',
    check: () => {
      const envFiles = ['.env', '.env.local', '.env.production'];
      const foundFiles = envFiles.filter(file => fs.existsSync(file));
      if (foundFiles.length > 0) {
        console.log('⚠️  Found environment files:', foundFiles.join(', '));
        console.log('   Make sure these are in .gitignore and contain no hardcoded secrets');
      } else {
        console.log('✅ No environment files found in repository');
      }
    }
  },
  {
    name: 'Hardcoded Secrets Check',
    check: () => {
      const patterns = [
        /api[_-]?key/i,
        /secret/i,
        /password/i,
        /token/i,
        /auth[_-]?key/i
      ];
      
      let issuesFound = 0;
      
      function scanFile(filePath) {
        if (filePath.includes('node_modules') || 
            filePath.includes('.git') || 
            filePath.includes('scripts/security-check.js') ||
            filePath.includes('SECURITY_ANALYSIS.md')) return;
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          patterns.forEach(pattern => {
            if (pattern.test(content) && !content.includes('process.env')) {
              const lines = content.split('\n');
              lines.forEach((line, index) => {
                if (pattern.test(line) && !line.includes('process.env') && !line.trim().startsWith('//')) {
                  console.log(`⚠️  Possible hardcoded secret in ${filePath}:${index + 1}`);
                  console.log(`   ${line.trim()}`);
                  issuesFound++;
                }
              });
            }
          });
        } catch (err) {
          // Skip files we can't read
        }
      }
      
      function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
            scanFile(filePath);
          }
        });
      }
      
      walkDir('.');
      
      if (issuesFound === 0) {
        console.log('✅ No obvious hardcoded secrets found');
      }
    }
  },
  {
    name: 'Security Headers Check',
    check: () => {
      const nextConfigPath = 'next.config.mjs';
      if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8');
        const hasSecurityHeaders = content.includes('X-Frame-Options') && 
                                 content.includes('Content-Security-Policy');
        if (hasSecurityHeaders) {
          console.log('✅ Security headers configured in Next.js config');
        } else {
          console.log('⚠️  Missing security headers in Next.js config');
        }
      }
    }
  },
  {
    name: 'Input Validation Check',
    check: () => {
      let validationFound = false;
      
      function checkApiRoute(filePath) {
        if (filePath.includes('/api/') && filePath.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('searchParams.get') && 
                (content.includes('test(') || content.includes('validate') || content.includes('sanitize'))) {
              validationFound = true;
            }
          } catch (err) {
            // Skip
          }
        }
      }
      
      function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else {
            checkApiRoute(filePath);
          }
        });
      }
      
      walkDir('app');
      
      if (validationFound) {
        console.log('✅ Input validation found in API routes');
      } else {
        console.log('⚠️  No input validation detected in API routes');
      }
    }
  }
];

// Run all checks
securityChecks.forEach(check => {
  console.log(`\n📋 ${check.name}`);
  check.check();
});

console.log('\n🔒 Security Analysis Complete');
console.log('\nRecommendations:');
console.log('- Review all ⚠️  warnings above');
console.log('- Run npm audit regularly');
console.log('- Keep dependencies updated');
console.log('- Follow OWASP security guidelines');
console.log('- Consider automated security scanning in CI/CD');