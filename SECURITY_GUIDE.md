# Security Best Practices Guide

This document outlines security best practices implemented in the Forensics application and recommendations for ongoing security maintenance.

## Implemented Security Measures

### 1. Authentication & Authorization
- ✅ Admin wallet addresses moved to environment variables
- ✅ Middleware-based route protection
- ✅ Role-based access control

### 2. API Security
- ✅ Input validation for Solana addresses
- ✅ Rate limiting implementation
- ✅ Sanitized error responses
- ✅ Request validation middleware

### 3. Security Headers
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer Policy

### 4. Environment Security
- ✅ .env.example template
- ✅ Secure environment variable usage
- ✅ Proper .gitignore configuration

### 5. Dependency Security
- ✅ Automated vulnerability scanning
- ✅ Updated Next.js to resolve security issues
- ✅ Security-focused ESLint rules

## Security Commands

### Run Security Audit
```bash
npm run security:audit
```

### Check for Vulnerabilities
```bash
npm audit
```

### Fix Known Vulnerabilities
```bash
npm audit fix
```

## Environment Variables

### Required Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# External APIs
ARKHAM_API_KEY=your_arkham_key
ARKHAM_API_SECRET=your_arkham_secret
NEXT_PUBLIC_QUICKNODE_RPC_URL=your_rpc_url

# Security
ADMIN_WALLET_ADDRESS=your_admin_wallet
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=your_admin_wallet
```

### Environment Variable Security
- Never commit `.env*` files to version control
- Use different keys for development/production
- Rotate API keys regularly
- Monitor for exposed credentials

## API Security

### Input Validation
All API endpoints validate input parameters:
- Solana addresses: Base58 format, 32-44 characters
- Rate limiting: 60 requests per minute per IP
- Request validation: Content-type and user-agent checks

### Error Handling
- Generic error messages for external users
- Detailed logging for internal monitoring
- No sensitive information in responses

## Client-Side Security

### Authentication
- Wallet-based authentication via Phantom
- Token-based session management
- Role-based UI rendering

### XSS Prevention
- React's built-in XSS protection
- No dangerouslySetInnerHTML usage
- Input sanitization utilities

## Security Monitoring

### Logging
Security events are logged for:
- Rate limit violations
- Invalid input attempts
- Authentication failures
- API errors

### Monitoring Checklist
- [ ] Set up log aggregation (e.g., Winston, Sentry)
- [ ] Monitor failed authentication attempts
- [ ] Track API usage patterns
- [ ] Set up alerting for security events

## Ongoing Security Tasks

### Daily
- Monitor application logs for security events
- Check for new security advisories

### Weekly
- Run `npm audit` to check for new vulnerabilities
- Review failed authentication attempts
- Check rate limiting effectiveness

### Monthly
- Review and rotate API keys
- Update dependencies with security patches
- Conduct security configuration review

### Quarterly
- Comprehensive security audit
- Penetration testing
- Security training for team

## Security Tools Integration

### Recommended Tools
1. **SAST (Static Analysis)**
   - ESLint with security rules ✅
   - SonarQube or CodeQL
   - Semgrep

2. **Dependency Scanning**
   - npm audit ✅
   - Snyk
   - OWASP Dependency Check

3. **Runtime Security**
   - OWASP ZAP for API testing
   - Content Security Policy monitoring
   - Real-time vulnerability scanning

### CI/CD Integration
Add to your CI/CD pipeline:
```yaml
- name: Security Audit
  run: npm audit --audit-level moderate
  
- name: Security Analysis
  run: npm run security:audit
  
- name: Dependency Check
  run: npm run security:dependencies
```

## Incident Response

### Security Incident Checklist
1. **Immediate Response**
   - Identify and contain the breach
   - Collect evidence
   - Notify stakeholders

2. **Investigation**
   - Analyze logs and traces
   - Determine impact and scope
   - Document findings

3. **Recovery**
   - Apply fixes and patches
   - Verify system integrity
   - Monitor for continued threats

4. **Post-Incident**
   - Update security measures
   - Document lessons learned
   - Update incident response plan

## Compliance Considerations

### Data Protection
- Implement data minimization
- Ensure secure data storage
- Provide data deletion capabilities
- Document data flows

### Financial Regulations
- Implement audit trails
- Ensure transaction integrity
- Maintain compliance documentation
- Regular compliance assessments

---

**Last Updated**: $(date)
**Security Contact**: [Your Security Team Email]
**Escalation**: [Emergency Security Contact]