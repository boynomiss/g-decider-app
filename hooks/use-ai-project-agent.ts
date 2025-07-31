import { useState, useCallback } from 'react';
import { aiProjectAgent } from '../utils/ai-project-agent';

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

interface UseAIProjectAgentReturn {
  // PRD Management
  generatePRD: (featureRequest: string) => Promise<PRD>;
  breakDownPRDIntoTasks: (prd: PRD) => Promise<ProjectTask[]>;
  
  // Task Management
  updateTaskStatus: (taskId: string, status: ProjectTask['status'], notes?: string) => void;
  getTaskRecommendations: () => Promise<ProjectTask[]>;
  
  // Project Analysis
  analyzeProjectState: () => Promise<string[]>;
  getProjectSummary: () => {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    progress: number;
    insights: string[];
    nextSteps: string[];
  };
  
  // Memory Bank
  addInsight: (insight: string) => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  currentPRD: PRD | null;
  currentTasks: ProjectTask[];
}

export const useAIProjectAgent = (): UseAIProjectAgentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPRD, setCurrentPRD] = useState<PRD | null>(null);
  const [currentTasks, setCurrentTasks] = useState<ProjectTask[]>([]);

  const generatePRD = useCallback(async (featureRequest: string): Promise<PRD> => {
    setIsLoading(true);
    setError(null);

    try {
      const prd = await aiProjectAgent.generatePRD(featureRequest);
      setCurrentPRD(prd);
      
      console.log('📋 Generated PRD:', prd.title);
      return prd;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PRD';
      setError(errorMessage);
      console.error('❌ PRD generation failed:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const breakDownPRDIntoTasks = useCallback(async (prd: PRD): Promise<ProjectTask[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await aiProjectAgent.breakDownPRDIntoTasks(prd);
      setCurrentTasks(tasks);
      
      console.log('📋 Generated tasks from PRD:', tasks.length);
      return tasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to break down PRD into tasks';
      setError(errorMessage);
      console.error('❌ Task breakdown failed:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: ProjectTask['status'], notes?: string) => {
    aiProjectAgent.updateTaskStatus(taskId, status, notes);
    
    // Update local state
    setCurrentTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status, updatedAt: new Date() }
          : task
      )
    );
    
    console.log(`✅ Updated task ${taskId} to ${status}`);
  }, []);

  const getTaskRecommendations = useCallback(async (): Promise<ProjectTask[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await aiProjectAgent.getTaskRecommendations();
      
      console.log('🎯 Got task recommendations:', recommendations.length);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get task recommendations';
      setError(errorMessage);
      console.error('❌ Task recommendations failed:', errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeProjectState = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await aiProjectAgent.analyzeProjectState();
      
      console.log('📊 Project analysis complete:', recommendations.length, 'recommendations');
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze project state';
      setError(errorMessage);
      console.error('❌ Project analysis failed:', errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProjectSummary = useCallback(() => {
    return aiProjectAgent.getProjectSummary();
  }, []);

  const addInsight = useCallback((insight: string) => {
    aiProjectAgent.addInsight(insight);
    console.log('💡 Added insight:', insight);
  }, []);

  return {
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
  };
}; 