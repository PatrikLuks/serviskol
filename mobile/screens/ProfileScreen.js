import React from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [analyticsOptOut, setAnalyticsOptOut] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('analyticsOptOut').then(val => setAnalyticsOptOut(val === 'true'));
  }, []);

  const handleOptOut = async (value) => {
    setAnalyticsOptOut(value);
    await AsyncStorage.setItem('analyticsOptOut', value ? 'true' : 'false');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil uživatele</Text>
      <Button title="Odhlásit se" onPress={() => navigation.replace('Login')} />
      <Button title="Nastavení 2FA" onPress={() => navigation.navigate('TwoFASettings')} />
      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 14 }}>Neposílat anonymizovaná analytická data (opt-out)</Text>
        <Switch value={analyticsOptOut} onValueChange={handleOptOut} />
        <Text style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Pro zlepšování aplikace využíváme anonymizovanou analytiku. Můžete ji zde kdykoliv vypnout.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 }
});
