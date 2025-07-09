import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { sendEvent } from '../App';

export default function RewardsScreen() {
  const [rewards, setRewards] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => {
    fetch('http://localhost:5000/api/gamification/rewards', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setRewards);
  }, []);

  const claim = async (rewardId) => {
    setStatus('');
    const res = await fetch('http://localhost:5000/api/gamification/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ rewardId })
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('Odměna přidělena!');
      sendEvent('reward_claimed', { rewardId });
    }
    else setStatus(data.msg || 'Chyba při nárokování odměny.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odměny</Text>
      <FlatList
        data={rewards}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.reward}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.points}>+{item.points} bodů</Text>
            <Button title="Získat" onPress={() => claim(item._id)} />
          </View>
        )}
      />
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  reward: { marginBottom: 16, padding: 12, backgroundColor: '#e6f4ea', borderRadius: 8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  desc: { color: '#555' },
  points: { color: '#22c55e', marginBottom: 4 },
  status: { color: 'green', marginTop: 8 }
});
