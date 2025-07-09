import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil uživatele</Text>
      <Button title="Odhlásit se" onPress={() => navigation.replace('Login')} />
      <Button title="Nastavení 2FA" onPress={() => navigation.navigate('TwoFASettings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 }
});
