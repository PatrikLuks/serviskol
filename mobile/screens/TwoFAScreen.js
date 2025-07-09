import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function TwoFAScreen({ route, navigation }) {
  const { email, password } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/users/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba ověření 2FA');
      navigation.replace('Dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dvoufaktorové ověření</Text>
      <TextInput
        style={styles.input}
        placeholder="Kód z aplikace"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Ověřit a přihlásit" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' }
});
