import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { registerForPushNotificationsAsync } from '../utils/push';

export default function DashboardScreen({ navigation }) {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚲🌱</Text>
      <Text style={styles.title}>ServisKol – Dashboard</Text>
      <Text style={styles.subtitle}>Sbírej body za servis, feedback a věrnost!</Text>
      <Button title="Žebříček" onPress={() => navigation.navigate('Leaderboard')} />
      <Button title="Odměny" onPress={() => navigation.navigate('Rewards')} />
      <Button title="Profil" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#e6f4ea' },
  emoji: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#22c55e', textShadowColor:'#b6e4c6', textShadowOffset:{width:2,height:2}, textShadowRadius:4 },
  subtitle: { fontSize: 16, color: '#22c55e', marginBottom: 16, textAlign: 'center' }
});
