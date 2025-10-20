// Test file for Queue Reset Service functionality
// This file can be used to manually test the missed appointment functionality

import queueResetService from "../shared/services/queueResetService.js";
import queueService from "../shared/services/queueService.js";

// Test the queue reset service functionality
class QueueResetTest {
  constructor() {
    this.testResults = [];
  }

  // Log test results
  log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const result = {
      timestamp,
      message,
      type: isError ? "ERROR" : "INFO",
    };
    this.testResults.push(result);
    console.log(`[${timestamp}] ${isError ? "ERROR" : "INFO"}: ${message}`);
  }

  // Test 1: Check if service can initialize properly
  async testServiceInitialization() {
    try {
      this.log("Testing queue reset service initialization...");

      // Initialize the service
      queueResetService.initialize();

      this.log("✅ Queue reset service initialized successfully");
      return true;
    } catch (error) {
      this.log(
        `❌ Failed to initialize queue reset service: ${error.message}`,
        true
      );
      return false;
    }
  }

  // Test 2: Manually trigger missed appointment check
  async testMissedAppointmentCheck() {
    try {
      this.log("Testing manual missed appointment check...");

      const result =
        await queueResetService.checkAndProcessMissedAppointments();

      this.log(`✅ Missed appointment check completed: ${result.message}`);
      this.log(`   - Processed count: ${result.processedCount}`);

      return true;
    } catch (error) {
      this.log(`❌ Failed missed appointment check: ${error.message}`, true);
      return false;
    }
  }

  // Test 3: Get missed appointment statistics
  async testMissedAppointmentStats() {
    try {
      this.log("Testing missed appointment statistics...");

      const stats = await queueResetService.getMissedAppointmentStats(7);

      this.log(`✅ Retrieved missed appointment stats:`);
      this.log(`   - Total missed: ${stats.totalMissed}`);
      this.log(`   - Recent missed (7 days): ${stats.recentMissed}`);
      this.log(`   - Auto-marked: ${stats.autoMissed}`);
      this.log(`   - Manual marked: ${stats.manualMissed}`);

      return true;
    } catch (error) {
      this.log(
        `❌ Failed to get missed appointment stats: ${error.message}`,
        true
      );
      return false;
    }
  }

  // Test 4: Test queue service integration
  async testQueueServiceIntegration() {
    try {
      this.log("Testing queue service integration...");

      // Test if queue service has the new methods
      const hasMissedCheck =
        typeof queueService.checkForMissedAppointments === "function";
      const hasMissedStats =
        typeof queueService.getMissedAppointmentStats === "function";
      const hasDateSpecific =
        typeof queueService.markMissedAppointmentsForDate === "function";

      this.log(`✅ Queue service integration check:`);
      this.log(
        `   - checkForMissedAppointments: ${
          hasMissedCheck ? "Available" : "Missing"
        }`
      );
      this.log(
        `   - getMissedAppointmentStats: ${
          hasMissedStats ? "Available" : "Missing"
        }`
      );
      this.log(
        `   - markMissedAppointmentsForDate: ${
          hasDateSpecific ? "Available" : "Missing"
        }`
      );

      return hasMissedCheck && hasMissedStats && hasDateSpecific;
    } catch (error) {
      this.log(
        `❌ Failed queue service integration test: ${error.message}`,
        true
      );
      return false;
    }
  }

  // Test 5: Simulate date change scenario
  async testDateChangeScenario() {
    try {
      this.log("Testing date change scenario simulation...");

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      this.log(`Checking for missed appointments from ${yesterdayString}...`);

      const result = await queueResetService.markMissedAppointmentsForDate(
        yesterdayString
      );

      this.log(`✅ Date change scenario test completed:`);
      this.log(`   - ${result.message}`);

      return true;
    } catch (error) {
      this.log(`❌ Failed date change scenario test: ${error.message}`, true);
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    this.log("🚀 Starting Queue Reset Service Tests...");

    const tests = [
      {
        name: "Service Initialization",
        test: () => this.testServiceInitialization(),
      },
      {
        name: "Missed Appointment Check",
        test: () => this.testMissedAppointmentCheck(),
      },
      {
        name: "Missed Appointment Stats",
        test: () => this.testMissedAppointmentStats(),
      },
      {
        name: "Queue Service Integration",
        test: () => this.testQueueServiceIntegration(),
      },
      {
        name: "Date Change Scenario",
        test: () => this.testDateChangeScenario(),
      },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const { name, test } of tests) {
      this.log(`\n📋 Running test: ${name}`);
      try {
        const result = await test();
        if (result) {
          passedTests++;
          this.log(`✅ Test passed: ${name}`);
        } else {
          this.log(`❌ Test failed: ${name}`, true);
        }
      } catch (error) {
        this.log(`💥 Test crashed: ${name} - ${error.message}`, true);
      }
    }

    this.log(`\n🏁 Test Summary:`);
    this.log(`   - Total tests: ${totalTests}`);
    this.log(`   - Passed: ${passedTests}`);
    this.log(`   - Failed: ${totalTests - passedTests}`);
    this.log(
      `   - Success rate: ${Math.round((passedTests / totalTests) * 100)}%`
    );

    // Clean up
    queueResetService.cleanup();

    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      results: this.testResults,
    };
  }
}

// Export for use in browser console or other test runners
window.QueueResetTest = QueueResetTest;

// Auto-run tests if this file is imported in development
if (process.env.NODE_ENV === "development") {
  console.log(
    "Queue Reset Test module loaded. Use `new QueueResetTest().runAllTests()` to run tests."
  );
}

export default QueueResetTest;
