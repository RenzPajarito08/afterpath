import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type TimelineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TimelineTab'>;

interface Props {
  navigation: TimelineScreenNavigationProp;
}

interface Journey {
    id: string;
    title: string;
    distance_meters: number;
    start_time: string;
}

export default function TimelineScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchJourneys() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('journeys')
        .select('id, title, distance_meters, start_time')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
    
      if (data) setJourneys(data);
      setRefreshing(false);
  }

  useEffect(() => {
      fetchJourneys();
  }, [user]);

  const onRefresh = () => {
      setRefreshing(true);
      fetchJourneys();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Your Timeline</Text>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
          <View style={styles.timelineLine} />
          
          {journeys.length === 0 ? (
              <Text style={{ marginLeft: 40, color: '#A0AEC0' }}>No journeys yet. Start one!</Text>
          ) : (
            journeys.map((journey) => (
                <View key={journey.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <TouchableOpacity 
                        style={styles.card}
                        onPress={() => navigation.navigate('JourneyDetail', { journeyId: journey.id })}
                    >
                        <Text style={styles.date}>{format(new Date(journey.start_time), 'MMM d, yyyy')}</Text>
                        <Text style={styles.title}>{journey.title || 'Untitled Journey'}</Text>
                        <Text style={styles.distance}>{(journey.distance_meters / 1000).toFixed(1)} km</Text>
                    </TouchableOpacity>
                </View>
            ))
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F2',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2D3748',
    marginLeft: 24,
    marginBottom: 24,
  },
  scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
  },
  timelineLine: {
      position: 'absolute',
      left: 35,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: '#E2E8F0',
  },
  timelineItem: {
      flexDirection: 'row',
      marginBottom: 32,
      alignItems: 'flex-start',
  },
  timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#48BB78',
      marginTop: 24, 
      marginRight: 24,
      zIndex: 1,
      borderWidth: 2,
      borderColor: '#F7F7F2',
  },
  card: {
      flex: 1,
      backgroundColor: '#FFF',
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: '#E2E8F0',
  },
  date: {
      fontSize: 12,
      color: '#A0AEC0',
      marginBottom: 4,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  title: {
      fontSize: 16,
      color: '#2D3748',
      fontWeight: '600',
      marginBottom: 8,
  },
  distance: {
      fontSize: 14,
      color: '#718096',
  },
});
