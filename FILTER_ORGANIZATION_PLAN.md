# Filter Organization Plan

## Overview
This document outlines the plan for organizing all filters into a structured folder system for better navigation, maintenance, and scalability.

## Current State
- Filters are scattered across multiple files
- No centralized configuration
- Difficult to maintain and update
- Inconsistent implementations

## Proposed Folder Structure

```
filters/
├── README.md                           # Main filter documentation
├── index.ts                           # Main filter exports
├── types.ts                           # Shared filter types
├── constants.ts                       # Shared filter constants
├── utils.ts                          # Shared filter utilities
│
├── distance/                          # Distance filter
│   ├── README.md                     # Distance filter documentation
│   ├── config.ts                     # Distance configuration
│   ├── types.ts                      # Distance-specific types
│   ├── utils.ts                      # Distance utilities
│   ├── components.tsx                # Distance UI components
│   ├── hooks.ts                      # Distance hooks
│   └── tests.ts                      # Distance tests
│
├── time-of-day/                      # Time of day filter
│   ├── README.md                     # Time filter documentation
│   ├── config.ts                     # Time configuration
│   ├── types.ts                      # Time-specific types
│   ├── utils.ts                      # Time utilities
│   ├── components.tsx                # Time UI components
│   ├── hooks.ts                      # Time hooks
│   └── tests.ts                      # Time tests
│
├── mood/                             # Mood filter
│   ├── README.md                     # Mood filter documentation
│   ├── config.ts                     # Mood configuration
│   ├── types.ts                      # Mood-specific types
│   ├── utils.ts                      # Mood utilities
│   ├── components.tsx                # Mood UI components
│   ├── hooks.ts                      # Mood hooks
│   └── tests.ts                      # Mood tests
│
├── category/                         # Category filter
│   ├── README.md                     # Category filter documentation
│   ├── config.ts                     # Category configuration
│   ├── types.ts                      # Category-specific types
│   ├── utils.ts                      # Category utilities
│   ├── components.tsx                # Category UI components
│   ├── hooks.ts                      # Category hooks
│   └── tests.ts                      # Category tests
│
├── budget/                           # Budget filter
│   ├── README.md                     # Budget filter documentation
│   ├── config.ts                     # Budget configuration
│   ├── types.ts                      # Budget-specific types
│   ├── utils.ts                      # Budget utilities
│   ├── components.tsx                # Budget UI components
│   ├── hooks.ts                      # Budget hooks
│   └── tests.ts                      # Budget tests
│
├── social-context/                   # Social context filter
│   ├── README.md                     # Social context documentation
│   ├── config.ts                     # Social context configuration
│   ├── types.ts                      # Social context types
│   ├── utils.ts                      # Social context utilities
│   ├── components.tsx                # Social context UI components
│   ├── hooks.ts                      # Social context hooks
│   └── tests.ts                      # Social context tests
│
└── shared/                           # Shared filter resources
    ├── interfaces.ts                 # Shared interfaces
    ├── constants.ts                  # Shared constants
    ├── utils.ts                      # Shared utilities
    ├── components.tsx                # Shared UI components
    └── types.ts                      # Shared types
```

## Migration Plan

### Phase 1: Create Base Structure
1. Create `filters/` folder
2. Create shared files (`types.ts`, `constants.ts`, `utils.ts`)
3. Create main `index.ts` export file
4. Create `README.md` documentation

### Phase 2: Migrate Distance Filter
1. Create `filters/distance/` folder
2. Move distance-related code from `utils/distance-config.ts`
3. Update imports across codebase
4. Create distance-specific documentation

### Phase 3: Migrate Time of Day Filter
1. Create `filters/time-of-day/` folder
2. Consolidate time-related code from multiple files
3. Update imports across codebase
4. Create time-specific documentation

### Phase 4: Migrate Remaining Filters
1. Migrate mood filter
2. Migrate category filter
3. Migrate budget filter
4. Migrate social context filter

### Phase 5: Cleanup and Optimization
1. Remove old scattered files
2. Update all imports
3. Run comprehensive tests
4. Update documentation

## File Templates

### Filter Config Template
```typescript
// filters/[filter-name]/config.ts
export interface [FilterName]Config {
  // Configuration interface
}

export const [FILTER_NAME]_CONFIG: [FilterName]Config = {
  // Configuration object
};

export class [FilterName]Utils {
  // Utility functions
}
```

### Filter Types Template
```typescript
// filters/[filter-name]/types.ts
export interface [FilterName]Filter {
  // Filter-specific interface
}

export type [FilterName]Value = // Filter value type

export interface [FilterName]State {
  // State interface
}
```

### Filter Components Template
```typescript
// filters/[filter-name]/components.tsx
import React from 'react';
import { [FilterName]Config } from './config';
import { [FilterName]Filter } from './types';

export interface [FilterName]ComponentProps {
  // Component props
}

export const [FilterName]Component: React.FC<[FilterName]ComponentProps> = () => {
  // Component implementation
};
```

### Filter Hooks Template
```typescript
// filters/[filter-name]/hooks.ts
import { [FilterName]Config } from './config';
import { [FilterName]Filter } from './types';

export const use[FilterName] = () => {
  // Hook implementation
};
```

## Benefits of This Organization

### 1. **Centralized Configuration**
- All filter configurations in one place
- Easy to update and maintain
- Consistent patterns across filters

### 2. **Better Navigation**
- Clear folder structure
- Easy to find specific filter implementations
- Reduced cognitive load

### 3. **Improved Maintainability**
- Isolated filter logic
- Easier to test individual filters
- Clear separation of concerns

### 4. **Enhanced Scalability**
- Easy to add new filters
- Consistent patterns for new implementations
- Reusable components and utilities

### 5. **Better Documentation**
- Filter-specific documentation
- Clear examples and usage patterns
- Comprehensive testing

## Implementation Priority

### High Priority (Phase 1-2)
1. **Distance Filter** - Already well-organized, easy migration
2. **Time of Day Filter** - Comprehensive consolidation available

### Medium Priority (Phase 3-4)
3. **Mood Filter** - Complex implementation, needs careful migration
4. **Category Filter** - Simple structure, straightforward migration

### Low Priority (Phase 5)
5. **Budget Filter** - Simple implementation
6. **Social Context Filter** - Simple implementation

## Migration Checklist

### For Each Filter Migration:
- [ ] Create filter folder structure
- [ ] Move configuration files
- [ ] Move type definitions
- [ ] Move utility functions
- [ ] Move UI components
- [ ] Move hooks
- [ ] Update all imports
- [ ] Create comprehensive tests
- [ ] Update documentation
- [ ] Verify functionality
- [ ] Remove old files

### Post-Migration Verification:
- [ ] All tests pass
- [ ] No broken imports
- [ ] Documentation is complete
- [ ] Performance is maintained
- [ ] Code quality is improved

## Next Steps

1. **Start with Distance Filter** - Already well-organized
2. **Create base structure** - Set up shared files
3. **Migrate one filter at a time** - Ensure stability
4. **Comprehensive testing** - Verify functionality
5. **Update documentation** - Maintain clear references

This organization will significantly improve code maintainability and developer experience. 