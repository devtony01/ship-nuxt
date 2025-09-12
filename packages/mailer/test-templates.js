#!/usr/bin/env node

/**
 * Simple test runner for email templates
 * This script tests individual templates and generates preview files
 */

const { renderEmailHtml } = require('./dist/index.cjs');
const { Template } = require('./dist/index.cjs');
const fs = require('fs');
const path = require('path');

// Test data for each template
const testData = {
  [Template.VERIFY_EMAIL]: {
    firstName: 'John',
    href: 'https://ship-nuxt.paracelsus.com/verify-email?token=test-token-123'
  },
  [Template.SIGN_UP_WELCOME]: {
    firstName: 'Jane',
    href: 'https://ship-nuxt.paracelsus.com/dashboard'
  },
  [Template.RESET_PASSWORD]: {
    firstName: 'Bob',
    href: 'https://ship-nuxt.paracelsus.com/reset-password?token=reset-token-456'
  }
};

async function testTemplate(template, params) {
  console.log(`Testing ${template}...`);
  
  try {
    const html = await renderEmailHtml({ template, params });
    
    // Basic validation
    if (!html || html.length === 0) {
      throw new Error('Empty HTML output');
    }
    
    if (!html.includes('<!DOCTYPE html>')) {
      throw new Error('Missing DOCTYPE');
    }
    
    console.log(`✅ ${template} - OK (${html.length} chars)`);
    
    // Save preview file
    const outputDir = path.join(__dirname, 'previews');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `${template.toLowerCase().replace(/_/g, '-')}.html`;
    fs.writeFileSync(path.join(outputDir, filename), html);
    
    return true;
  } catch (error) {
    console.log(`❌ ${template} - FAILED: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Email Templates');
  console.log('==========================');
  
  let passed = 0;
  let total = 0;
  
  for (const [template, params] of Object.entries(testData)) {
    total++;
    if (await testTemplate(template, params)) {
      passed++;
    }
  }
  
  console.log('==========================');
  console.log(`Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All templates working!');
    console.log('📁 Preview files saved to: packages/mailer/previews/');
    process.exit(0);
  } else {
    console.log('💥 Some templates failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}