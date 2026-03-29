// AI Agent for Project Management
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

interface MemoryBank {
  projectContext: string;
  completedTasks: ProjectTask[];
  currentTasks: ProjectTask[];
  insights: string[];
  decisions: string[];
  lessonsLearned: string[];
  nextSteps: string[];
}

export class AIProjectAgent {
  private static instance: AIProjectAgent;
  private memoryBank: MemoryBank;
  private GEMINI_API_KEY: string;

  private constructor() {
    this.GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    this.memoryBank = this.initializeMemoryBank();
  }

  static getInstance(): AIProjectAgent {
    if (!AIProjectAgent.instance) {
      AIProjectAgent.instance = new AIProjectAgent();
    }
    return AIProjectAgent.instance;
  }

  /**
   * Initialize the memory bank with project context
   */
  private initializeMemoryBank(): MemoryBank {
    return {
      projectContext: `Restaurant Decider App - A React Native application that helps users discover restaurants based on preferences like budget, mood, location, and social context. Features include AI-powered descriptions, booking integration, and smart filtering.`,
      completedTasks: [],
      currentTasks: [],
      insights: [],
      decisions: [],
      lessonsLearned: [],
      nextSteps: []
    };
  }

  /**
   * Generate a comprehensive PRD for a new feature or improvement
   */
  async generatePRD(featureRequest: string): Promise<PRD> {
    try {
      const prompt = this.buildPRDPrompt(featureRequest);
      const response = await this.callGeminiAPI(prompt);
      
      // Parse the response into PRD structure
      const prd = this.parsePRDResponse(response);
      
      // Log the PRD generation
      this.memoryBank.insights.push(`Generated PRD for: ${featureRequest}`);
      
      return prd;
    } catch (error) {
      console.error('❌ Failed to generate PRD:', error);
      throw error;
    }
  }

  /**
   * Break down a PRD into actionable tasks
   */
  async breakDownPRDIntoTasks(prd: PRD): Promise<ProjectTask[]> {
    try {
      const prompt = this.buildTaskBreakdownPrompt(prd);
      const response = await this.callGeminiAPI(prompt);
      
      // Parse the response into task structure
      const tasks = this.parseTaskResponse(response);
      
      // Add tasks to memory bank
      this.memoryBank.currentTasks.push(...tasks);
      
      console.log(`📋 Generated ${tasks.length} tasks from PRD`);
      return tasks;
    } catch (error) {
      console.error('❌ Failed to break down PRD into tasks:', error);
      throw error;
    }
  }

  /**
   * Analyze current project state and suggest next steps
   */
  async analyzeProjectState(): Promise<string[]> {
    try {
      const prompt = this.buildAnalysisPrompt();
      const response = await this.callGeminiAPI(prompt);
      
      const suggestions = response.split('\n').filter(line => line.trim());
      this.memoryBank.nextSteps = suggestions;
      
      return suggestions;
    } catch (error) {
      console.error('❌ Failed to analyze project state:', error);
      return [];
    }
  }

  /**
   * Get intelligent task recommendations
   */
  async getTaskRecommendations(): Promise<ProjectTask[]> {
    try {
      const prompt = this.buildRecommendationPrompt();
      const response = await this.callGeminiAPI(prompt);
      
      const recommendations = this.parseTaskResponse(response);
      return recommendations;
    } catch (error) {
      console.error('❌ Failed to get task recommendations:', error);
      return [];
    }
  }

  /**
   * Update task status and log progress
   */
  updateTaskStatus(taskId: string, status: ProjectTask['status'], notes?: string): void {
    const task = this.memoryBank.currentTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      
      if (status === 'completed') {
        this.memoryBank.completedTasks.push(task);
        this.memoryBank.currentTasks = this.memoryBank.currentTasks.filter(t => t.id !== taskId);
        this.memoryBank.lessonsLearned.push(`Completed: ${task.title}`);
      }
      
      if (notes) {
        this.memoryBank.insights.push(`Task ${taskId}: ${notes}`);
      }
    }
  }

  /**
   * Add new insight or decision to memory bank
   */
  addInsight(insight: string): void {
    this.memoryBank.insights.push(insight);
  }

  /**
   * Get project summary and progress
   */
  getProjectSummary(): {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    progress: number;
    insights: string[];
    nextSteps: string[];
  } {
    const totalTasks = this.memoryBank.completedTasks.length + this.memoryBank.currentTasks.length;
    const completedTasks = this.memoryBank.completedTasks.length;
    const pendingTasks = this.memoryBank.currentTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      progress,
      insights: this.memoryBank.insights.slice(-10), // Last 10 insights
      nextSteps: this.memoryBank.nextSteps
    };
  }

  /**
   * Call Gemini API for AI processing
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    const response = await fetch(`${GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    return generatedText.trim();
  }

  /**
   * Build PRD generation prompt
   */
  private buildPRDPrompt(featureRequest: string): string {
    return `You are an expert Product Manager. Generate a comprehensive PRD (Product Requirements Document) for the following feature request in a React Native restaurant discovery app:

FEATURE REQUEST: ${featureRequest}

PROJECT CONTEXT: ${this.memoryBank.projectContext}

Please provide a structured PRD with the following sections:

1. TITLE: [Feature name]
2. DESCRIPTION: [Clear feature description]
3. OBJECTIVES: [List of 3-5 key objectives]
4. USER STORIES: [List of 3-5 user stories in "As a... I want... So that..." format]
5. ACCEPTANCE CRITERIA: [List of 5-8 acceptance criteria]
6. TECHNICAL REQUIREMENTS: [List of technical requirements]
7. RISKS: [List of potential risks and mitigation strategies]
8. SUCCESS METRICS: [List of 3-5 measurable success metrics]

Format the response as a structured document with clear sections.`;
  }

  /**
   * Build task breakdown prompt
   */
  private buildTaskBreakdownPrompt(prd: PRD): string {
    return `You are an expert Technical Project Manager. Break down the following PRD into specific, actionable development tasks:

PRD TITLE: ${prd.title}
PRD DESCRIPTION: ${prd.description}
OBJECTIVES: ${prd.objectives.join(', ')}
TECHNICAL REQUIREMENTS: ${prd.technicalRequirements.join(', ')}

Create a list of development tasks with the following format for each task:
- TASK_ID: [unique identifier]
- TITLE: [task title]
- DESCRIPTION: [detailed description]
- PRIORITY: [high/medium/low]
- CATEGORY: [feature/bug/improvement/research]
- ESTIMATED_HOURS: [number]
- DEPENDENCIES: [list of task IDs this depends on]

Break down into 8-15 specific tasks covering:
1. Frontend development
2. Backend/API integration
3. UI/UX design
4. Testing
5. Documentation
6. Deployment

Format as a structured list.`;
  }

  /**
   * Build project analysis prompt
   */
  private buildAnalysisPrompt(): string {
    const summary = this.getProjectSummary();
    
    return `You are an expert Project Manager. Analyze the current state of this React Native restaurant discovery app project and provide strategic recommendations:

PROJECT CONTEXT: ${this.memoryBank.projectContext}

CURRENT STATUS:
- Total Tasks: ${summary.totalTasks}
- Completed: ${summary.completedTasks}
- Pending: ${summary.pendingTasks}
- Progress: ${summary.progress.toFixed(1)}%

RECENT INSIGHTS: ${this.memoryBank.insights.slice(-5).join(', ')}

Provide 5-8 strategic recommendations for next steps, considering:
1. High-impact, low-effort improvements
2. Technical debt reduction
3. User experience enhancements
4. Performance optimizations
5. Feature prioritization

Format as a numbered list of actionable recommendations.`;
  }

  /**
   * Build task recommendation prompt
   */
  private buildRecommendationPrompt(): string {
    return `You are an expert Technical Lead. Based on the current project state, recommend the next 3-5 tasks that should be prioritized:

PROJECT CONTEXT: ${this.memoryBank.projectContext}

CURRENT TASKS: ${this.memoryBank.currentTasks.map(t => `${t.title} (${t.status})`).join(', ')}

RECENT INSIGHTS: ${this.memoryBank.insights.slice(-3).join(', ')}

Recommend tasks that:
1. Have the highest business impact
2. Are technically feasible
3. Can be completed quickly
4. Reduce technical risk
5. Improve user experience

Format as a structured list of recommended tasks.`;
  }

  /**
   * Parse PRD response from AI
   */
  private parsePRDResponse(response: string): PRD {
    // This is a simplified parser - in production, you'd want more robust parsing
    const lines = response.split('\n');
    
    return {
      id: `prd_${Date.now()}`,
      title: lines.find(line => line.includes('TITLE:'))?.split(':')[1]?.trim() || 'New Feature',
      description: lines.find(line => line.includes('DESCRIPTION:'))?.split(':')[1]?.trim() || '',
      objectives: lines.filter(line => line.includes('OBJECTIVE:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      userStories: lines.filter(line => line.includes('USER STORY:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      acceptanceCriteria: lines.filter(line => line.includes('ACCEPTANCE CRITERIA:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      technicalRequirements: lines.filter(line => line.includes('TECHNICAL REQUIREMENT:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      risks: lines.filter(line => line.includes('RISK:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      successMetrics: lines.filter(line => line.includes('SUCCESS METRIC:')).map(line => line.split(':')[1]?.trim()).filter((item): item is string => Boolean(item)),
      createdAt: new Date()
    };
  }

  /**
   * Parse task response from AI
   */
  private parseTaskResponse(response: string): ProjectTask[] {
    // This is a simplified parser - in production, you'd want more robust parsing
    const tasks: ProjectTask[] = [];
    const lines = response.split('\n');
    
    let currentTask: Partial<ProjectTask> = {};
    
    for (const line of lines) {
      if (line.includes('TASK_ID:')) {
        if (currentTask.id) {
          tasks.push(currentTask as ProjectTask);
        }
        currentTask = {
          id: line.split(':')[1]?.trim() || `task_${Date.now()}`,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (line.includes('TITLE:')) {
        currentTask.title = line.split(':')[1]?.trim() || '';
      } else if (line.includes('DESCRIPTION:')) {
        currentTask.description = line.split(':')[1]?.trim() || '';
      } else if (line.includes('PRIORITY:')) {
        currentTask.priority = (line.split(':')[1]?.trim() as 'high' | 'medium' | 'low') || 'medium';
      } else if (line.includes('CATEGORY:')) {
        currentTask.category = (line.split(':')[1]?.trim() as 'feature' | 'bug' | 'improvement' | 'research') || 'feature';
      } else if (line.includes('ESTIMATED_HOURS:')) {
        const hoursStr = line.split(':')[1]?.trim();
        currentTask.estimatedHours = hoursStr ? parseInt(hoursStr) || 2 : 2;
      } else if (line.includes('DEPENDENCIES:')) {
        const depsStr = line.split(':')[1]?.trim();
        if (depsStr) {
          currentTask.dependencies = depsStr.split(',').map(d => d.trim()).filter(Boolean);
        } else {
          currentTask.dependencies = [];
        }
      }
    }
    
    if (currentTask.id) {
      tasks.push(currentTask as ProjectTask);
    }
    
    return tasks;
  }
}

// Export singleton instance
export const aiProjectAgent = AIProjectAgent.getInstance(); 