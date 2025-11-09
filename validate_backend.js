/**
 * Backend Validation Script
 * Validates that all live scoring endpoints and middleware are properly configured
 */

const fs = require('fs');
const path = require('path');

class BackendValidator {
  constructor() {
    this.basePath = path.join(__dirname, 'backend');
    this.results = {
      models: {},
      controllers: {},
      routes: {},
      middleware: {},
      server: {}
    };
  }

  // Check if file exists and read content
  readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Validate match model
  validateMatchModel() {
    console.log('📋 Validating Match Model...');
    
    const modelPath = path.join(this.basePath, 'models', 'match.js');
    const content = this.readFile(modelPath);
    
    if (!content) {
      this.results.models.match = { status: 'MISSING', issues: ['File not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /cricketScore.*runs/, description: 'Cricket runs field' },
      { pattern: /cricketScore.*wickets/, description: 'Cricket wickets field' },
      { pattern: /cricketScore.*overs/, description: 'Cricket overs field' },
      { pattern: /cricketScore.*balls/, description: 'Cricket balls field' },
      { pattern: /cricketScore.*extras/, description: 'Cricket extras field' },
      { pattern: /footballScore/, description: 'Football score field' },
      { pattern: /basketballScore/, description: 'Basketball score field' },
      { pattern: /liveUpdates/, description: 'Live updates array' },
      { pattern: /matchConfig/, description: 'Match configuration' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.models.match = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.models.match.status === 'VALID' ? '✅' : '⚠️'} Match Model: ${this.results.models.match.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Validate match controller
  validateMatchController() {
    console.log('🎮 Validating Match Controller...');
    
    const controllerPath = path.join(this.basePath, 'controllers', 'matchController.js');
    const content = this.readFile(controllerPath);
    
    if (!content) {
      this.results.controllers.match = { status: 'MISSING', issues: ['File not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /updateLiveScore/, description: 'updateLiveScore function' },
      { pattern: /cricket.*validation/i, description: 'Cricket validation logic' },
      { pattern: /wickets.*<=.*10/, description: 'Wickets validation (≤10)' },
      { pattern: /balls.*<=.*5/, description: 'Balls validation (≤5)' },
      { pattern: /sport.*toLowerCase/, description: 'Sport type checking' },
      { pattern: /liveUpdates.*push/, description: 'Live updates logging' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.controllers.match = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.controllers.match.status === 'VALID' ? '✅' : '⚠️'} Match Controller: ${this.results.controllers.match.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Validate match routes
  validateMatchRoutes() {
    console.log('🛣️ Validating Match Routes...');
    
    const routesPath = path.join(this.basePath, 'routes', 'matches.js');
    const content = this.readFile(routesPath);
    
    if (!content) {
      this.results.routes.matches = { status: 'MISSING', issues: ['File not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /live-score.*post/i, description: 'Live score POST endpoint' },
      { pattern: /updateLiveScore/, description: 'updateLiveScore controller reference' },
      { pattern: /authMiddleware/, description: 'Authentication middleware' },
      { pattern: /admin.*student_head/i, description: 'Role-based authorization' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.routes.matches = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.routes.matches.status === 'VALID' ? '✅' : '⚠️'} Match Routes: ${this.results.routes.matches.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Validate auth middleware
  validateAuthMiddleware() {
    console.log('🔒 Validating Auth Middleware...');
    
    const middlewarePath = path.join(this.basePath, 'middleware', 'authMiddleware.js');
    const content = this.readFile(middlewarePath);
    
    if (!content) {
      this.results.middleware.auth = { status: 'MISSING', issues: ['File not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /jwt\.verify/, description: 'JWT verification' },
      { pattern: /role.*admin.*student_head/i, description: 'Role checking for admin/student_head' },
      { pattern: /authorization/i, description: 'Authorization header checking' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.middleware.auth = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.middleware.auth.status === 'VALID' ? '✅' : '⚠️'} Auth Middleware: ${this.results.middleware.auth.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Validate server configuration
  validateServerConfig() {
    console.log('🖥️ Validating Server Configuration...');
    
    const serverPath = path.join(this.basePath, 'server.js');
    const content = this.readFile(serverPath);
    
    if (!content) {
      this.results.server.config = { status: 'MISSING', issues: ['File not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /matches.*router/i, description: 'Matches router registration' },
      { pattern: /cors/, description: 'CORS configuration' },
      { pattern: /express\.json/, description: 'JSON body parsing' },
      { pattern: /mongoose.*connect/, description: 'MongoDB connection' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.server.config = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.server.config.status === 'VALID' ? '✅' : '⚠️'} Server Config: ${this.results.server.config.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Check frontend API service
  validateFrontendAPI() {
    console.log('🌐 Validating Frontend API Service...');
    
    const apiServicePath = path.join(__dirname, 'src', 'services', 'matchService.js');
    const content = this.readFile(apiServicePath);
    
    if (!content) {
      this.results.frontend = { status: 'MISSING', issues: ['matchService.js not found'] };
      return;
    }

    const issues = [];
    const checks = [
      { pattern: /updateLiveScore/, description: 'updateLiveScore API function' },
      { pattern: /live-score/, description: 'Live score endpoint' },
      { pattern: /authorization/i, description: 'Authorization header' },
      { pattern: /axios.*post/i, description: 'POST request configuration' }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(content)) {
        issues.push(`Missing: ${check.description}`);
      }
    });

    this.results.frontend = {
      status: issues.length === 0 ? 'VALID' : 'ISSUES',
      issues
    };

    console.log(`   ${this.results.frontend.status === 'VALID' ? '✅' : '⚠️'} Frontend API: ${this.results.frontend.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
  }

  // Generate summary report
  generateReport() {
    console.log('\n📊 Validation Summary Report');
    console.log('='.repeat(50));
    
    let totalComponents = 0;
    let validComponents = 0;
    let issues = [];

    Object.entries(this.results).forEach(([category, components]) => {
      console.log(`\n${category.toUpperCase()}:`);
      
      Object.entries(components).forEach(([component, result]) => {
        totalComponents++;
        if (result.status === 'VALID') validComponents++;
        
        console.log(`  ${result.status === 'VALID' ? '✅' : result.status === 'MISSING' ? '❌' : '⚠️'} ${component}: ${result.status}`);
        
        if (result.issues && result.issues.length > 0) {
          result.issues.forEach(issue => {
            console.log(`     - ${issue}`);
            issues.push(`${category}/${component}: ${issue}`);
          });
        }
      });
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Overall Status: ${validComponents}/${totalComponents} components valid`);
    
    if (issues.length === 0) {
      console.log('🎉 All components are properly configured for live scoring!');
    } else {
      console.log(`⚠️ ${issues.length} issues found that may affect live scoring functionality:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    console.log('\nNext steps:');
    console.log('1. Fix any issues found above');
    console.log('2. Run the live scoring test suite (test_live_scoring.js)');
    console.log('3. Test the UI components in the browser');
    console.log('4. Verify permissions work correctly for different user roles');
  }

  // Run all validations
  runValidation() {
    console.log('🔍 Backend Live Scoring Validation\n');
    
    this.validateMatchModel();
    this.validateMatchController();
    this.validateMatchRoutes();
    this.validateAuthMiddleware();
    this.validateServerConfig();
    this.validateFrontendAPI();
    
    this.generateReport();
  }
}

// Run validation
const validator = new BackendValidator();
validator.runValidation();