import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vítejte v ServisKol!</Text>
      <Text style={styles.emoji}>🚲🌱🏆</Text>
      <Text style={styles.text}>Spravujte svá kola, servisní historii, sbírejte <Text style={{color:'#22c55e', fontWeight:'bold'}}>body</Text> a soutěžte v žebříčku. Aktivujte si <Text style={{color:'#22c55e'}}>2FA</Text> a <Text style={{color:'#22c55e'}}>notifikace</Text> pro maximální bezpečnost a přehled.</Text>
      <Button title="Začít" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#e6f4ea' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#22c55e', textShadowColor:'#b6e4c6', textShadowOffset:{width:2,height:2}, textShadowRadius:4 },
  emoji: { fontSize: 40, marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 32, textAlign: 'center' }
});
