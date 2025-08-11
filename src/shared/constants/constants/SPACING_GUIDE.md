# Spacing System Guide

## Overview
The app now uses a centralized spacing system to ensure consistent layout across all components.

## Constants

### SPACING Object
```typescript
import { SPACING } from '../shared/constants/constants';

// Use individual values
marginHorizontal: SPACING.CONTAINER_MARGIN,  // 8px
padding: SPACING.CONTAINER_PADDING,          // 16px
marginBottom: SPACING.SECTION_SPACING,       // 16px
```

### Individual Exports
```typescript
import { CONTAINER_MARGIN, CONTAINER_PADDING, SECTION_SPACING } from '../shared/constants/constants';

// Use directly
marginHorizontal: CONTAINER_MARGIN,  // 8px
padding: CONTAINER_PADDING,          // 16px
marginBottom: SECTION_SPACING,       // 16px
```

## Spacing Values

| Constant | Value | Usage |
|----------|-------|-------|
| `SPACING.SMALL` | 8px | Tight spacing, small margins |
| `SPACING.MEDIUM` | 16px | Standard spacing, container padding |
| `SPACING.LARGE` | 20px | Prominent elements, section padding |
| `SPACING.XLARGE` | 24px | Major sections, large spacing |
| `SPACING.CONTAINER_PADDING_VERTICAL` | 16px | Consistent vertical padding for all containers |

## Container Spacing

### Standard Container
```typescript
import { containerSpacing } from '../shared/utils/core/spacing-utils';

const styles = StyleSheet.create({
  container: {
    ...containerSpacing,
    backgroundColor: 'white',
    borderRadius: 20,
  },
});
```

### Header Container
```typescript
import { headerSpacing } from '../shared/utils/core/spacing-utils';

const styles = StyleSheet.create({
  header: {
    ...headerSpacing,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

### Card Container
```typescript
import { cardSpacing } from '../shared/utils/core/spacing-utils';

const styles = StyleSheet.create({
  card: {
    ...cardSpacing,
    backgroundColor: 'white',
    borderRadius: 16,
  },
});
```

## Migration

### Before (Hard-coded values)
```typescript
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
  },
});
```

### After (Using constants)
```typescript
import { SPACING } from '../shared/constants/constants';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.CONTAINER_MARGIN,  // 8px
    padding: SPACING.CONTAINER_PADDING,          // 16px
    marginBottom: SPACING.SECTION_SPACING,       // 16px
  },
});
```

### After (Using utility functions)
```typescript
import { containerSpacing } from '../shared/utils/core/spacing-utils';

const styles = StyleSheet.create({
  container: {
    ...containerSpacing,
    backgroundColor: 'white',
    borderRadius: 20,
  },
});
```

## Benefits

1. **Consistency**: All components use the same spacing values
2. **Maintainability**: Change spacing in one place, updates everywhere
3. **Scalability**: Easy to adjust spacing for different screen sizes
4. **Developer Experience**: Clear, documented spacing system
5. **Design System**: Professional, consistent app appearance

## Best Practices

1. **Always use constants** instead of hard-coded values
2. **Use utility functions** for common patterns
3. **Keep spacing consistent** across similar components
4. **Document custom spacing** when deviating from standards
5. **Test on different screen sizes** to ensure spacing works well
