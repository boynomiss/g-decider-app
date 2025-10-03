/**
 * MVP Layout - Simple navigation for MVP screens
 */

import React from 'react';
import { Stack } from 'expo-router';

export default function MVPLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="mvp-home"
        options={{
          title: 'G-Decider MVP',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mvp-results"
        options={{
          title: 'Places Found',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mvp-admin"
        options={{
          title: 'Admin Panel',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
