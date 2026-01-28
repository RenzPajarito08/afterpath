import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Save, Edit2, X } from 'lucide-react-native';
// If DateTimePicker is not installed, we can use a simple text input or ask user to install it. 
// For now, I'll use a simple TextInput for birthday (YYYY-MM-DD) to avoid complexity with peer deps if not checked.
// If available, users typically use @react-native-community/datetimepicker. I will stick to text for simplicity unless I see it in package.json later.

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState(''); // Format YYYY-MM-DD
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
        getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, first_name, last_name, birthday`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || '');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setBirthday(data.birthday || '');
      }
    } catch (error: any) {
       // Silent error or log
       console.log('Error loading profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      if (!user) throw new Error('No user on the session!');

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        birthday: birthday || null,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
      // Confirm logout
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: () => signOut() }
      ]);
  };

  if (loading) {
      return (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#48BB78" />
          </View>
      );
  }

  return (
    <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <User size={64} color="#A0AEC0" />
            </View>
            <Text style={styles.email}>{user?.email}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
        </View>

        <View style={styles.formContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                {!editing ? (
                    <TouchableOpacity onPress={() => setEditing(true)} style={styles.iconButton}>
                        <Edit2 size={20} color="#48BB78" />
                    </TouchableOpacity>
                ) : (
                   <TouchableOpacity onPress={() => setEditing(false)} style={styles.iconButton}>
                        <X size={20} color="#E53E3E" />
                   </TouchableOpacity>
                )}
            </View>
            
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={[styles.input, !editing && styles.disabledInput]}
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={editing}
                    placeholder="Enter first name"
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={[styles.input, !editing && styles.disabledInput]}
                    value={lastName}
                    onChangeText={setLastName}
                    editable={editing}
                    placeholder="Enter last name"
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Birthday</Text>
                <TextInput
                    style={[styles.input, !editing && styles.disabledInput]}
                    value={birthday}
                    onChangeText={setBirthday}
                    editable={editing}
                    placeholder="YYYY-MM-DD"
                />
            </View>

            {editing && (
                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={updateProfile}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#E53E3E" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F2',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  header: {
      alignItems: 'center',
      marginBottom: 32,
  },
  avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#CBD5E0',
  },
  email: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2D3748',
  },
  username: {
      fontSize: 14,
      color: '#718096',
      marginTop: 4,
  },
  formContainer: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2D3748',
  },
  iconButton: {
      padding: 8,
  },
  fieldGroup: {
      marginBottom: 16,
  },
  label: {
      fontSize: 14,
      color: '#718096',
      marginBottom: 8,
      fontWeight: '500',
  },
  input: {
      backgroundColor: '#F7FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: '#2D3748',
  },
  disabledInput: {
      backgroundColor: '#FAFAFA',
      color: '#4A5568',
      borderColor: 'transparent',
  },
  saveButton: {
      backgroundColor: '#48BB78',
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
  },
  saveButtonText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: 16,
  },
  logoutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FED7D7',
  },
  logoutText: {
      color: '#E53E3E',
      fontWeight: '600',
      fontSize: 16,
  },
});
