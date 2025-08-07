export interface FilteringStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  resultsCount?: number;
}

export const FILTERING_STEPS: FilteringStep[] = [
  {
    step: 1,
    name: 'Gathering Places',
    description: 'Finding all places within your distance range',
    status: 'pending'
  },
  {
    step: 2,
    name: 'Mood Filtering',
    description: 'Filtering by your mood preferences',
    status: 'pending'
  },
  {
    step: 3,
    name: 'Budget Filtering',
    description: 'Filtering by your budget range',
    status: 'pending'
  },
  {
    step: 4,
    name: 'Social Context',
    description: 'Filtering by social context (solo, date, group)',
    status: 'pending'
  },
  {
    step: 5,
    name: 'Time of Day',
    description: 'Filtering by time of day preferences',
    status: 'pending'
  }
];

export const updateFilteringProgress = (
  steps: FilteringStep[],
  stepNumber: number,
  status: FilteringStep['status'],
  resultsCount?: number
): FilteringStep[] => {
  return steps.map(step => 
    step.step === stepNumber 
      ? { ...step, status, ...(resultsCount !== undefined && { resultsCount }) }
      : step
  );
}; 