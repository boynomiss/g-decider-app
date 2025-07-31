import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Users, File, Check, Clock, AlertCircle, Star, Settings, Globe } from 'lucide-react-native';
import { useAIProjectAgent } from '../hooks/use-ai-project-agent';

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  category: 'feature' | 'bug' | 'improvement' | 'research';
  estimatedHours: number;
  dependencies: string[];
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PRD {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  technicalRequirements: string[];
  risks: string[];
  successMetrics: string[];
  createdAt: Date;
}

export const AIProjectManager: React.FC = () => {
  const [featureRequest, setFeatureRequest] = useState('');
  const [activeTab, setActiveTab] = useState<'prd' | 'tasks' | 'analysis'>('prd');
  
  const {
    generatePRD,
    breakDownPRDIntoTasks,
    updateTaskStatus,
    getTaskRecommendations,
    analyzeProjectState,
    getProjectSummary,
    addInsight,
    isLoading,
    error,
    currentPRD,
    currentTasks
  } = useAIProjectAgent();

  const handleGeneratePRD = async () => {
    if (!featureRequest.trim()) {
      Alert.alert('Error', 'Please enter a feature request');
      return;
    }

    try {
      const prd = await generatePRD(featureRequest);
      Alert.alert('Success', `Generated PRD: ${prd.title}`);
      setActiveTab('tasks');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PRD');
    }
  };

  const handleBreakDownTasks = async () => {
    if (!currentPRD) {
      Alert.alert('Error', 'No PRD available. Generate a PRD first.');
      return;
    }

    try {
      const tasks = await breakDownPRDIntoTasks(currentPRD);
      Alert.alert('Success', `Generated ${tasks.length} tasks`);
    } catch (error) {
      Alert.alert('Error', 'Failed to break down PRD into tasks');
    }
  };

  const handleAnalyzeProject = async () => {
    try {
      const recommendations = await analyzeProjectState();
      Alert.alert('Analysis Complete', `${recommendations.length} recommendations generated`);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze project state');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'blocked': return '#FF6B6B';
      case 'pending': return '#FFA500';
      default: return '#666';
    }
  };

  const projectSummary = getProjectSummary();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Users size={24} color="#8B5FBF" />
        <Text style={styles.title}>AI Project Manager</Text>
      </View>

      {/* Project Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{projectSummary.totalTasks}</Text>
            <Text style={styles.summaryLabel}>Total Tasks</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{projectSummary.completedTasks}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{projectSummary.pendingTasks}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{projectSummary.progress.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Progress</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prd' && styles.activeTab]}
          onPress={() => setActiveTab('prd')}
        >
          <File size={16} color={activeTab === 'prd' ? '#8B5FBF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'prd' && styles.activeTabText]}>PRD</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Check size={16} color={activeTab === 'tasks' ? '#8B5FBF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Globe size={16} color={activeTab === 'analysis' ? '#8B5FBF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>Analysis</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'prd' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Generate PRD</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe the feature you want to build..."
              value={featureRequest}
              onChangeText={setFeatureRequest}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleGeneratePRD}
              disabled={isLoading}
            >
              <Users size={16} color="#FFF" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Generating PRD...' : 'Generate PRD'}
              </Text>
            </TouchableOpacity>

            {currentPRD && (
              <View style={styles.prdContainer}>
                <Text style={styles.prdTitle}>{currentPRD.title}</Text>
                <Text style={styles.prdDescription}>{currentPRD.description}</Text>
                
                <Text style={styles.prdSectionTitle}>Objectives:</Text>
                {currentPRD.objectives.map((objective, index) => (
                  <Text key={index} style={styles.prdItem}>• {objective}</Text>
                ))}
                
                <Text style={styles.prdSectionTitle}>User Stories:</Text>
                {currentPRD.userStories.map((story, index) => (
                  <Text key={index} style={styles.prdItem}>• {story}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Task Management</Text>
            
            {currentPRD && currentTasks.length === 0 && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleBreakDownTasks}
              >
                <Globe size={16} color="#FFF" />
                <Text style={styles.buttonText}>Break Down PRD into Tasks</Text>
              </TouchableOpacity>
            )}

            {currentTasks.length > 0 && (
              <View style={styles.tasksContainer}>
                {currentTasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.taskBadges}>
                        <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                          <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                            {task.priority}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                          <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
                            {task.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskFooter}>
                      <Clock size={12} color="#666" />
                      <Text style={styles.taskHours}>{task.estimatedHours}h</Text>
                      <Text style={styles.taskCategory}>{task.category}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'analysis' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Project Analysis</Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleAnalyzeProject}
            >
              <Globe size={16} color="#FFF" />
              <Text style={styles.buttonText}>Analyze Project State</Text>
            </TouchableOpacity>

            {projectSummary.nextSteps.length > 0 && (
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisTitle}>Recommended Next Steps:</Text>
                {projectSummary.nextSteps.map((step, index) => (
                  <Text key={index} style={styles.analysisItem}>• {step}</Text>
                ))}
              </View>
            )}

            {projectSummary.insights.length > 0 && (
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisTitle}>Recent Insights:</Text>
                {projectSummary.insights.map((insight, index) => (
                  <Text key={index} style={styles.analysisItem}>• {insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5FBF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F0F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#8B5FBF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5FBF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  prdContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  prdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  prdDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  prdSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  prdItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tasksContainer: {
    marginTop: 16,
  },
  taskCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskHours: {
    fontSize: 12,
    color: '#666',
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  analysisContainer: {
    marginTop: 16,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  analysisItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
}); 