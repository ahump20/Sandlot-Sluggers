/**
 * MMI Formula Validation Tests
 * Verifies calculation accuracy across different scenarios
 */

// Test scenarios
const scenarios = {
  average: {
    name: "Average Situation",
    leverageIndex: 1.0,
    pressure: 50,
    fatigue: 50,
    execution: 50,
    bio: 50,
    expectedMMI: 50,
    tolerance: 5
  },
  elitePressure: {
    name: "Elite Pressure (Bases Loaded, Full Count, 9th Inning)",
    leverageIndex: 4.0,  // Bases loaded, 2 outs, tie game, 9th inning
    pressure: 85,        // Full count + late inning + 2 outs
    fatigue: 70,         // 100+ pitches
    execution: 80,       // 3-2 count difficulty
    bio: 75,             // Multiple mound visits
    expectedMMI: 84,
    tolerance: 5
  },
  routine: {
    name: "Routine (0-2 Count, 0 Outs, Blowout)",
    leverageIndex: 0.3,  // Low leverage (blowout)
    pressure: 25,        // Pitcher's count, early game
    fatigue: 30,         // Fresh pitcher
    execution: 30,       // Easy pitch location
    bio: 40,             // Normal tempo
    expectedMMI: 33,
    tolerance: 5
  },
  highDifficulty: {
    name: "High Difficulty (Runner on 3rd, 2 Outs, 7th Inning)",
    leverageIndex: 2.5,
    pressure: 70,
    fatigue: 60,
    execution: 65,
    bio: 60,
    expectedMMI: 67,
    tolerance: 5
  },
  maxFatigue: {
    name: "Max Fatigue (120 Pitches, No Rest)",
    leverageIndex: 2.0,
    pressure: 65,
    fatigue: 95,  // Extreme fatigue
    execution: 60,
    bio: 80,      // Struggling
    expectedMMI: 67,
    tolerance: 5
  }
};

// Normalization parameters (must match worker-mmi-engine.js)
const NORMALIZATION_PARAMS = {
  leverageIndex: { mean: 1.0, stdDev: 0.8 },
  pressure: { mean: 50, stdDev: 25 },
  fatigue: { mean: 50, stdDev: 20 },
  execution: { mean: 50, stdDev: 15 },
  bio: { mean: 50, stdDev: 10 }
};

// Weights (must match worker-mmi-engine.js)
const WEIGHTS = {
  leverageIndex: 0.35,
  pressure: 0.20,
  fatigue: 0.20,
  execution: 0.15,
  bio: 0.10
};

/**
 * Calculate z-score
 */
function calculateZScore(value, params) {
  return (value - params.mean) / params.stdDev;
}

/**
 * Calculate MMI score
 */
function calculateMMI(scenario) {
  // Calculate z-scores
  const zScores = {
    leverageIndex: calculateZScore(scenario.leverageIndex, NORMALIZATION_PARAMS.leverageIndex),
    pressure: calculateZScore(scenario.pressure, NORMALIZATION_PARAMS.pressure),
    fatigue: calculateZScore(scenario.fatigue, NORMALIZATION_PARAMS.fatigue),
    execution: calculateZScore(scenario.execution, NORMALIZATION_PARAMS.execution),
    bio: calculateZScore(scenario.bio, NORMALIZATION_PARAMS.bio)
  };

  // Calculate weighted sum
  const mmiRaw = (
    zScores.leverageIndex * WEIGHTS.leverageIndex +
    zScores.pressure * WEIGHTS.pressure +
    zScores.fatigue * WEIGHTS.fatigue +
    zScores.execution * WEIGHTS.execution +
    zScores.bio * WEIGHTS.bio
  );

  // Transform to 0-100 scale (mean=50, stdDev=15)
  const mmi = Math.max(0, Math.min(100, 50 + (mmiRaw * 15)));

  return {
    mmi: Math.round(mmi * 10) / 10,
    zScores,
    rawScore: mmiRaw
  };
}

/**
 * Get MMI category
 */
function getMmiCategory(mmi) {
  if (mmi >= 70) return 'Elite Pressure';
  if (mmi >= 55) return 'High Difficulty';
  if (mmi >= 40) return 'Moderate';
  return 'Routine';
}

/**
 * Run all tests
 */
function runTests() {
  console.log('\n🧪 MMI Formula Validation Tests\n');
  console.log('Formula: z(LI)·35% + z(Pressure)·20% + z(Fatigue)·20% + z(Execution)·15% + z(Bio)·10%\n');
  console.log('═'.repeat(80));

  let passed = 0;
  let failed = 0;

  Object.entries(scenarios).forEach(([key, scenario]) => {
    const result = calculateMMI(scenario);
    const category = getMmiCategory(result.mmi);
    const diff = Math.abs(result.mmi - scenario.expectedMMI);
    const isPass = diff <= scenario.tolerance;

    if (isPass) {
      passed++;
      console.log(`\n✅ PASS: ${scenario.name}`);
    } else {
      failed++;
      console.log(`\n❌ FAIL: ${scenario.name}`);
    }

    console.log(`   Expected: ${scenario.expectedMMI.toFixed(1)} (±${scenario.tolerance})`);
    console.log(`   Actual:   ${result.mmi} (${category})`);
    console.log(`   Diff:     ${diff.toFixed(1)}`);
    
    console.log('\n   Input Components:');
    console.log(`     • Leverage Index: ${scenario.leverageIndex.toFixed(2)}`);
    console.log(`     • Pressure:       ${scenario.pressure.toFixed(2)}`);
    console.log(`     • Fatigue:        ${scenario.fatigue.toFixed(2)}`);
    console.log(`     • Execution:      ${scenario.execution.toFixed(2)}`);
    console.log(`     • Bio-proxies:    ${scenario.bio.toFixed(2)}`);
    
    console.log('\n   Z-Scores:');
    console.log(`     • Leverage Index: ${result.zScores.leverageIndex.toFixed(3)}`);
    console.log(`     • Pressure:       ${result.zScores.pressure.toFixed(3)}`);
    console.log(`     • Fatigue:        ${result.zScores.fatigue.toFixed(3)}`);
    console.log(`     • Execution:      ${result.zScores.execution.toFixed(3)}`);
    console.log(`     • Bio-proxies:    ${result.zScores.bio.toFixed(3)}`);
    console.log(`     • Raw Score:      ${result.rawScore.toFixed(3)}`);
    
    console.log('   ─'.repeat(40));
  });

  console.log('\n' + '═'.repeat(80));
  console.log('\n📊 Test Summary:');
  console.log(`   Total:  ${passed + failed}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
  
  // Validate weights sum to 1.0
  const weightSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  console.log(`\n🔢 Weight Validation: ${(weightSum * 100).toFixed(1)}% ${Math.abs(weightSum - 1.0) < 0.001 ? '✅' : '❌'}`);
  
  console.log('\n' + '═'.repeat(80) + '\n');

  return { passed, failed };
}

/**
 * Test MMI distribution
 */
function testDistribution() {
  console.log('\n📈 MMI Distribution Test\n');
  console.log('Testing 1000 random scenarios to verify proper distribution...\n');

  const samples = 1000;
  const results = [];

  for (let i = 0; i < samples; i++) {
    const scenario = {
      leverageIndex: Math.random() * 5,
      pressure: Math.random() * 100,
      fatigue: Math.random() * 100,
      execution: Math.random() * 100,
      bio: Math.random() * 100
    };

    const result = calculateMMI(scenario);
    results.push(result.mmi);
  }

  // Calculate statistics
  const mean = results.reduce((a, b) => a + b, 0) / samples;
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...results);
  const max = Math.max(...results);

  // Count by category
  const categories = {
    'Routine (0-40)': results.filter(r => r < 40).length,
    'Moderate (40-55)': results.filter(r => r >= 40 && r < 55).length,
    'High Difficulty (55-70)': results.filter(r => r >= 55 && r < 70).length,
    'Elite Pressure (70-100)': results.filter(r => r >= 70).length
  };

  console.log('Statistics:');
  console.log(`  Mean:     ${mean.toFixed(2)}`);
  console.log(`  Std Dev:  ${stdDev.toFixed(2)}`);
  console.log(`  Min:      ${min.toFixed(2)}`);
  console.log(`  Max:      ${max.toFixed(2)}`);
  console.log('\nDistribution:');
  Object.entries(categories).forEach(([cat, count]) => {
    const pct = (count / samples * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / samples * 50));
    console.log(`  ${cat.padEnd(30)} ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  });

  console.log('\n' + '═'.repeat(80) + '\n');
}

// Run tests (auto-execute when run directly)
const { passed, failed } = runTests();
testDistribution();

console.log('💡 Interpretation Guide:');
console.log('   • 70-100: Elite Pressure (Top 10% difficulty)');
console.log('   • 55-70:  High Difficulty (Elevated pressure)');
console.log('   • 40-55:  Moderate (League-average difficulty)');
console.log('   • 0-40:   Routine (Low-leverage, comfortable)\n');

process.exit(failed > 0 ? 1 : 0);
