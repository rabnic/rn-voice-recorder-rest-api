import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NoRecordings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Recordings</Text>
      <MaterialCommunityIcons name="waveform" size={44} color="#b2b1b1" />
    </View>
  )
}

export default NoRecordings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#b2b1b1',
        fontSize: 22,
        marginBottom: 10,
    }
})