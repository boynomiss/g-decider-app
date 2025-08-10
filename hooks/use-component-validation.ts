import * as React from 'react';

/**
 * Hook for runtime component validation
 * Helps catch undefined components early in development
 */

interface ComponentValidationOptions {
  componentName: string;
  required?: boolean;
  fallback?: React.ComponentType<any>;
}

/**
 * Validates that a component is properly defined
 * @param Component - The component to validate
 * @param options - Validation options
 * @returns The validated component or fallback
 */
export function useComponentValidation<T extends React.ComponentType<any>>(
  Component: T | undefined,
  options: ComponentValidationOptions
): T {
  const { componentName, required = true, fallback } = options;

  React.useEffect(() => {
    if (Component === undefined) {
      const errorMessage = `Component validation failed: ${componentName} is undefined`;
      
      if (required) {
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      } else {
        console.warn(`⚠️ ${errorMessage}`);
      }
    } else {
      console.log(`✅ Component validation passed: ${componentName} is properly defined`);
    }
  }, [Component, componentName, required]);

  if (Component === undefined && fallback) {
    console.warn(`🔄 Using fallback component for ${componentName}`);
    return fallback as T;
  }

  return Component as T;
}

/**
 * Higher-order component that validates components at render time
 */
export function withComponentValidation<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  const ValidatedComponent = React.forwardRef<any, any>((props, ref) => {
    if (Component === undefined) {
      console.error(`❌ Component validation failed: ${componentName} is undefined`);
      return React.createElement('div', { 
        style: { 
          padding: 20, 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          border: '1px solid #ef5350',
          borderRadius: 4
        } 
      }, `Error: ${componentName} is not properly exported`);
    }

    return React.createElement(Component, { ...props, ref });
  });

  ValidatedComponent.displayName = `Validated(${componentName})`;
  return ValidatedComponent as unknown as T;
}

/**
 * Hook to validate multiple components at once
 */
export function useMultipleComponentValidation(components: Record<string, React.ComponentType<any> | undefined>) {
  const validationResults = React.useMemo(() => {
    const results: Record<string, boolean> = {};
    
    Object.entries(components).forEach(([name, component]) => {
      results[name] = component !== undefined;
      
      if (component === undefined) {
        console.error(`❌ Component validation failed: ${name} is undefined`);
      } else {
        console.log(`✅ Component validation passed: ${name} is properly defined`);
      }
    });
    
    return results;
  }, [components]);

  return validationResults;
}

/**
 * Utility to check if all required components are available
 */
export function useRequiredComponentsValidation(
  components: Record<string, React.ComponentType<any> | undefined>
): boolean {
  const validationResults = useMultipleComponentValidation(components);
  
  return React.useMemo(() => {
    return Object.values(validationResults).every(result => result === true);
  }, [validationResults]);
}

/**
 * Debug hook to log component availability
 */
export function useComponentDebug(components: Record<string, React.ComponentType<any> | undefined>) {
  React.useEffect(() => {
    console.log('🔍 Component Debug Information:');
    Object.entries(components).forEach(([name, component]) => {
      const status = component !== undefined ? '✅ Available' : '❌ Missing';
      const type = component ? typeof component : 'undefined';
      console.log(`  ${name}: ${status} (${type})`);
    });
  }, [components]);
} 