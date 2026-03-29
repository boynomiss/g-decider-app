/**
 * Spacing Constants
 * 
 * Centralized spacing values for consistent layout across the app
 */

export const SPACING = {
  // Container margins (horizontal spacing from screen edges)
  CONTAINER_MARGIN: 0, // Removed container margin for edge-to-edge layout
  
  // Container padding (internal spacing within containers)
  CONTAINER_PADDING: 16,
  
  // Section spacing (vertical spacing between components)
  SECTION_SPACING: 16,
  
  // Vertical padding for containers (top and bottom)
  CONTAINER_PADDING_VERTICAL: 16,
  
  // Small spacing for tight layouts
  SMALL: 8,
  
  // Medium spacing for standard layouts
  MEDIUM: 16,
  
  // Large spacing for prominent elements
  LARGE: 20,
  
  // Extra large spacing for major sections
  XLARGE: 24,
} as const;

// Legacy support - export individual values
export const CONTAINER_MARGIN = SPACING.CONTAINER_MARGIN;
export const CONTAINER_PADDING = SPACING.CONTAINER_PADDING;
export const SECTION_SPACING = SPACING.SECTION_SPACING;
