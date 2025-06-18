import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <>
      <Navigation />
      <StatusBar style="light" backgroundColor="#1a1a1a" />
    </>
  );
}
