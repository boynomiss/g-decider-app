/**
 * Filtering Types Index
 * 
 * Centralized export of all filtering-related types
 */

// Core filter types
export type {
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LegacyBudgetOption,
  LoadingState
} from './filter-interfaces';

// Filter configuration types
export type {
  BudgetCategory,
  MoodCategory,
  SocialContextConfig,
  TimeCategory,
  CategoryFilter,
  DistanceCategory,
  FilterConfigs,
  FilterConfigType
} from './filter-configs';

// Filter service and utility types
export type {
  FilterServiceConfig,
  FilterValidator,
  FilterConverter,
  FilterMatcher,
  FilterUtilityMethods
} from './filter-service';

// Filter result types
export type {
  PlaceResult,
  ScoredPlace,
  FilterResult,
  AdvertisedPlace,
  ReviewEntity,
  MoodAnalysisResult,
  EntityAnalysisResult
} from './filter-results';

// User filter interfaces
export type {
  UserFilters,
  SearchParams,
  ApiReadyFilterData,
  FilterApiBridge
} from './filter-interfaces';
