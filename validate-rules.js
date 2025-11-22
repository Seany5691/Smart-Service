/**
 * Simple validation script for Firestore Security Rules
 * This checks basic syntax and structure
 */

const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, 'firestore.rules');

console.log('🔍 Validating Firestore Security Rules...\n');

try {
  // Read the rules file
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Basic validation checks
  const checks = [
    {
      name: 'File exists',
      test: () => rulesContent.length > 0,
      message: 'Rules file is not empty'
    },
    {
      name: 'Rules version',
      test: () => rulesContent.includes("rules_version = '2'"),
      message: 'Rules version 2 is specified'
    },
    {
      name: 'Service declaration',
      test: () => rulesContent.includes('service cloud.firestore'),
      message: 'Firestore service is declared'
    },
    {
      name: 'Users collection',
      test: () => rulesContent.includes('match /users/{userId}'),
      message: 'Users collection rules defined'
    },
    {
      name: 'User Preferences collection',
      test: () => rulesContent.includes('match /userPreferences/{userId}'),
      message: 'User Preferences collection rules defined'
    },
    {
      name: 'Invoices collection',
      test: () => rulesContent.includes('match /invoices/{invoiceId}'),
      message: 'Invoices collection rules defined'
    },
    {
      name: 'Inventory collection',
      test: () => rulesContent.includes('match /inventory/{itemId}'),
      message: 'Inventory collection rules defined'
    },
    {
      name: 'Authentication check',
      test: () => rulesContent.includes('isAuthenticated()'),
      message: 'Authentication helper function used'
    },
    {
      name: 'Owner check',
      test: () => rulesContent.includes('isOwner('),
      message: 'Owner helper function used'
    },
    {
      name: 'Balanced braces',
      test: () => {
        const openBraces = (rulesContent.match(/{/g) || []).length;
        const closeBraces = (rulesContent.match(/}/g) || []).length;
        return openBraces === closeBraces;
      },
      message: 'Braces are balanced'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    try {
      if (check.test()) {
        console.log(`✅ ${check.name}: ${check.message}`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: Failed`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: Error - ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('✨ All validation checks passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Deploy rules: firebase deploy --only firestore:rules');
    console.log('   2. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('   3. Test in application');
    console.log('\n📖 See SECURITY_RULES_IMPLEMENTATION.md for detailed instructions\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some validation checks failed. Please review the rules file.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error reading rules file:', error.message);
  process.exit(1);
}
