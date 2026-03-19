import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants';

export function DragHandle() {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: Colors.g300,
  },
});
