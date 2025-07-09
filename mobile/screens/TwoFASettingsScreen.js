import React, { useState } from 'react';
import { View, Text, Button, TextInput, Image, StyleSheet } from 'react-native';

export default function TwoFASettingsScreen() {
  const [status, setStatus] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  const handleSetup = async () => {
    setStatus('');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/2fa/setup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setQr(data.qr);
      setSecret(data.secret);
    } else {
      setStatus('Chyba při generování 2FA.');
    }
  };

  const handleVerify = async () => {
    setStatus('');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ token: code })
    });
    if (res.ok) {
      setEnabled(true);
      setStatus('2FA bylo úspěšně aktivováno!');
      setQr(''); setSecret(''); setCode('');
    } else {
      setStatus('Chyba při ověření 2FA.');
    }
  };

  const handleDisable = async () => {
    setStatus('');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/2fa/disable', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setEnabled(false);
      setStatus('2FA bylo deaktivováno.');
    } else {
      setStatus('Chyba při deaktivaci 2FA.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dvoufaktorová autentizace (2FA)</Text>
      {enabled ? (
        <View>
          <Text style={styles.success}>2FA je aktivní.</Text>
          <Button title="Deaktivovat 2FA" onPress={handleDisable} />
        </View>
      ) : (
        <View>
          {!qr ? (
            <Button title="Aktivovat 2FA" onPress={handleSetup} />
          ) : (
            <View>
              <Text>Naskenujte QR kód v aplikaci Authenticator a zadejte ověřovací kód:</Text>
              <Image source={{ uri: qr }} style={{ width: 180, height: 180, marginVertical: 12 }} />
              <TextInput
                style={styles.input}
                placeholder="Kód z aplikace"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <Button title="Ověřit a aktivovat" onPress={handleVerify} />
            </View>
          )}
        </View>
      )}
      {status ? <Text style={enabled ? styles.success : styles.error}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginTop: 8 },
  success: { color: 'green', marginTop: 8 }
});
