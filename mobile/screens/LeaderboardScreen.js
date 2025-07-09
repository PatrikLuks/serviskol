import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function LeaderboardScreen() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/gamification/leaderboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setData);
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Žebříček uživatelů</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.user._id}
        renderItem={({ item, index }) => (
          <Text style={styles.item}>{index + 1}. {item.user.name} – {item.points} bodů</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  item: { fontSize: 16, marginBottom: 8 }
});
