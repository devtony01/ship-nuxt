#!/usr/bin/env node

/**
 * Test script for the mailer package
 * This script tests email template rendering and validates the output
 */

const { renderEmailHtml } = require('./dist/index.cjs');
const { Template } = require('./dist/index.cjs');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Validate HTML output
 */
function validateHtml(html, templateName) {
  const validations = [];

  // Check if HTML is not empty
  if (!html || html.trim().length === 0) {
    validations.push('HTML is empty');
  }

  // Check for basic HTML structure
  if (!html.includes('<!DOCTYPE html>')) {
    validations.push('Missing DOCTYPE declaration');
  }

  if (!html.includes('<html>') || !html.includes('</html>')) {
    validations.push('Missing HTML tags');
  }

  if (!html.includes('<head>') || !html.includes('</head>')) {
    validations.push('Missing HEAD tags');
  }

  if (!html.includes('<body>') || !html.includes('</body>')) {
    validations.push('Missing BODY tags');
  }

  // Check for meta charset
  if (!html.includes('charset="utf-8"')) {
    validations.push('Missing UTF-8 charset declaration');
  }

  // Check for viewport meta tag
  if (!html.includes('viewport')) {
    validations.push('Missing viewport meta tag');
  }

  // Template-specific validations
  switch (templateName) {
    case Template.VERIFY_EMAIL:
      if (!html.includes('Verify Email') && !html.includes('verify')) {
        validations.push('Missing verification content');
      }
      break;
    case Template.SIGN_UP_WELCOME:
      if (!html.includes('Welcome') && !html.includes('welcome')) {
        validations.push('Missing welcome content');
      }
      break;
    case Template.RESET_PASSWORD:
      if (!html.includes('Reset') && !html.includes('password')) {
        validations.push('Missing reset password content');
      }
      break;
  }

  return validations;
}

/**
 * Test individual template
 */
async function testTemplate(template, params, templateName) {
  try {
    logInfo(`Testing ${templateName} template...`);
    
    const startTime = Date.now();
    const html = await renderEmailHtml({ template, params });
    const renderTime = Date.now() - startTime;
    
    // Validate the HTML
    const validationErrors = validateHtml(html, template);
    
    if (validationErrors.length > 0) {
      logError(`${templateName} validation failed:`);
      validationErrors.forEach(error => log(`  - ${error}`, 'red'));
      return false;
    }
    
    logSuccess(`${templateName} rendered successfully (${renderTime}ms)`);
    log(`  Length: ${html.length} characters`, 'cyan');
    
    // Save to file for inspection
    const outputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `${templateName.toLowerCase().replace(/_/g, '-')}.html`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, html);
    log(`  Saved to: ${filepath}`, 'cyan');
    
    return true;
  } catch (error) {
    logError(`${templateName} failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  log('🚀 Starting Mailer Package Tests', 'bright');
  log('=====================================', 'bright');
  
  const testCases = [
    {
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: 'John',
        href: 'https://ship-nuxt.paracelsus.com/verify-email?token=test-token-123'
      },
      name: 'VERIFY_EMAIL'
    },
    {
      template: Template.SIGN_UP_WELCOME,
      params: {
        firstName: 'Jane',
        href: 'https://ship-nuxt.paracelsus.com/dashboard'
      },
      name: 'SIGN_UP_WELCOME'
    },
    {
      template: Template.RESET_PASSWORD,
      params: {
        firstName: 'Bob',
        href: 'https://ship-nuxt.paracelsus.com/reset-password?token=reset-token-456'
      },
      name: 'RESET_PASSWORD'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const success = await testTemplate(
      testCase.template,
      testCase.params,
      testCase.name
    );
    
    if (success) {
      passedTests++;
    }
    
    log(''); // Empty line for readability
  }
  
  // Summary
  log('=====================================', 'bright');
  log('📊 Test Summary', 'bright');
  log(`Total tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('💥 Some tests failed!', 'red');
    process.exit(1);
  }
}

/**
 * Test with edge cases
 */
async function testEdgeCases() {
  log('🧪 Testing Edge Cases', 'bright');
  log('=====================', 'bright');
  
  // Test with empty firstName
  try {
    await renderEmailHtml({
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: '',
        href: 'https://example.com'
      }
    });
    logSuccess('Empty firstName handled correctly');
  } catch (error) {
    logError(`Empty firstName test failed: ${error.message}`);
  }
  
  // Test with very long firstName
  try {
    await renderEmailHtml({
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: 'A'.repeat(100),
        href: 'https://example.com'
      }
    });
    logSuccess('Long firstName handled correctly');
  } catch (error) {
    logError(`Long firstName test failed: ${error.message}`);
  }
  
  // Test with special characters in firstName
  try {
    await renderEmailHtml({
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: 'José María',
        href: 'https://example.com'
      }
    });
    logSuccess('Special characters in firstName handled correctly');
  } catch (error) {
    logError(`Special characters test failed: ${error.message}`);
  }
  
  // Test with invalid template
  try {
    await renderEmailHtml({
      template: 'INVALID_TEMPLATE',
      params: {
        firstName: 'John',
        href: 'https://example.com'
      }
    });
    logError('Invalid template should have thrown an error');
  } catch (error) {
    logSuccess('Invalid template correctly rejected');
  }
  
  log('');
}

// Run the tests
if (require.main === module) {
  (async () => {
    try {
      await runTests();
      await testEdgeCases();
    } catch (error) {
      logError(`Test runner failed: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testTemplate,
  validateHtml,
  runTests,
  testEdgeCases
};