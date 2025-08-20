import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { X, RotateCcw, Heart } from 'lucide-react-native';

interface ResultActionBarProps {
  onPass?: (() => void) | undefined;
  onRestart?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
  isSaved?: boolean;
}

function ResultActionBarBase({ onPass, onRestart, onSave, isSaved = false }: ResultActionBarProps) {
  return (
    <View style={styles.actionButtonsRow} testID="action-buttons-row">
      <TouchableOpacity 
        testID="pass-button"
        style={[styles.actionButton, styles.passButton]} 
        onPress={onPass}
        activeOpacity={0.7}
      >
        <X size={24} color="#FF6B6B" />
        <Text style={[styles.actionText, { color: '#FF6B6B', fontWeight: '600' }]}>Pass</Text>
      </TouchableOpacity>

      {onRestart ? (
        <TouchableOpacity
          testID="restart-button"
          style={[styles.actionButton, styles.restartButton]}
          onPress={onRestart}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Restart"
        >
          <RotateCcw size={24} color="#808080" />
          <Text style={[styles.actionText, { color: '#808080', fontWeight: '600' }]}>Restart</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity 
        testID="save-button"
        style={[styles.actionButton, isSaved ? styles.savedButton : styles.saveButton]} 
        onPress={onSave}
        activeOpacity={0.7}
      >
        <Heart 
          size={24} 
          color="#4CAF50" 
          fill={isSaved ? '#4CAF50' : 'transparent'}
        />
        <Text style={[styles.actionText, { color: '#4CAF50', fontWeight: '600' }]}>
          {isSaved ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const ResultActionBar = memo(ResultActionBarBase);

const styles = StyleSheet.create({
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8, // Reduced from 12
    paddingHorizontal: 12,
    paddingVertical: 2, // Reduced from 4
    backgroundColor: 'transparent',
    minHeight: 44, // Reduced from 52
    borderRadius: 8,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4, // Reduced from 6
    borderRadius: 8,
    gap: 3 as const, // Reduced from 4
    backgroundColor: 'transparent',
    flex: 1,
    minWidth: 0,
  },
  actionText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
    textAlign: 'center',
  },
  passButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6, // Reduced from 8
    borderRadius: 25,
  },
  restartButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6, // Reduced from 8
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6, // Reduced from 8
    borderRadius: 25,
  },
  savedButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6, // Reduced from 8
    borderRadius: 25,
  },
});
