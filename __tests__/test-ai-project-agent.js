// Test script for AI Project Agent
// Run with: node test-ai-project-agent.js

const { aiProjectAgent } = require('./utils/ai-project-agent');

async function testAIProjectAgent() {
  console.log('🧠 Testing AI Project Agent...\n');

  try {
    // Test 1: Generate PRD
    console.log('📋 Test 1: Generating PRD...');
    const prd = await aiProjectAgent.generatePRD(
      "Add a social sharing feature that allows users to share restaurant recommendations with friends"
    );
    console.log('✅ Generated PRD:', prd.title);
    console.log('   Description:', prd.description);
    console.log('   Objectives:', prd.objectives.length);
    console.log('   User Stories:', prd.userStories.length);
    console.log('   Acceptance Criteria:', prd.acceptanceCriteria.length);
    console.log('   Technical Requirements:', prd.technicalRequirements.length);
    console.log('   Risks:', prd.risks.length);
    console.log('   Success Metrics:', prd.successMetrics.length);
    console.log('');

    // Test 2: Break down PRD into tasks
    console.log('📋 Test 2: Breaking down PRD into tasks...');
    const tasks = await aiProjectAgent.breakDownPRDIntoTasks(prd);
    console.log('✅ Generated tasks:', tasks.length);
    
    // Show task details
    tasks.forEach((task, index) => {
      console.log(`   Task ${index + 1}: ${task.title}`);
      console.log(`     Priority: ${task.priority}`);
      console.log(`     Category: ${task.category}`);
      console.log(`     Estimated Hours: ${task.estimatedHours}`);
      console.log(`     Status: ${task.status}`);
    });
    console.log('');

    // Test 3: Project analysis
    console.log('📊 Test 3: Analyzing project state...');
    const recommendations = await aiProjectAgent.analyzeProjectState();
    console.log('✅ Project analysis complete:', recommendations.length, 'recommendations');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');

    // Test 4: Get project summary
    console.log('📈 Test 4: Getting project summary...');
    const summary = aiProjectAgent.getProjectSummary();
    console.log('✅ Project Summary:');
    console.log(`   Total Tasks: ${summary.totalTasks}`);
    console.log(`   Completed: ${summary.completedTasks}`);
    console.log(`   Pending: ${summary.pendingTasks}`);
    console.log(`   Progress: ${summary.progress.toFixed(1)}%`);
    console.log(`   Recent Insights: ${summary.insights.length}`);
    console.log(`   Next Steps: ${summary.nextSteps.length}`);
    console.log('');

    // Test 5: Add insights and update task status
    console.log('💡 Test 5: Adding insights and updating task status...');
    aiProjectAgent.addInsight('AI agent is working well for project planning');
    aiProjectAgent.addInsight('PRD generation quality is high');
    
    if (tasks.length > 0) {
      aiProjectAgent.updateTaskStatus(tasks[0].id, 'in-progress', 'Started implementation');
      console.log('✅ Updated first task to in-progress');
    }
    console.log('');

    // Test 6: Get updated summary
    console.log('📈 Test 6: Getting updated project summary...');
    const updatedSummary = aiProjectAgent.getProjectSummary();
    console.log('✅ Updated Project Summary:');
    console.log(`   Total Tasks: ${updatedSummary.totalTasks}`);
    console.log(`   Completed: ${updatedSummary.completedTasks}`);
    console.log(`   Pending: ${updatedSummary.pendingTasks}`);
    console.log(`   Progress: ${updatedSummary.progress.toFixed(1)}%`);
    console.log(`   Recent Insights: ${updatedSummary.insights.length}`);
    console.log(`   Next Steps: ${updatedSummary.nextSteps.length}`);
    console.log('');

    console.log('🎉 All AI Project Agent tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ PRD Generation: Working');
    console.log('   ✅ Task Breakdown: Working');
    console.log('   ✅ Project Analysis: Working');
    console.log('   ✅ Memory Bank: Working');
    console.log('   ✅ Status Updates: Working');
    console.log('   ✅ Insights Tracking: Working');

  } catch (error) {
    console.error('❌ AI Project Agent test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAIProjectAgent(); 