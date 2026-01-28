// src/screens/Playlist/PlaylistForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export type PlaylistFormValues = {
  name: string;
  description: string;
  isPublic: boolean;
  isCollaborative: boolean;
};

type Props = {
  mode: 'create' | 'edit';
  initialValues?: Partial<PlaylistFormValues>;
  onSubmit: (values: PlaylistFormValues) => Promise<void>;
};

export const PlaylistForm: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
}) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic ?? true);
  const [isCollaborative, setIsCollaborative] = useState(
    initialValues?.isCollaborative ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || '',
        isPublic,
        isCollaborative,
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to save playlist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Playlist name</Text>
      <TextInput
        style={styles.input}
        placeholder="My playlist"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Add a short description"
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Public</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Collaborative</Text>
        <Switch value={isCollaborative} onValueChange={setIsCollaborative} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'create' ? 'Create Playlist' : 'Save Changes'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { color: '#ccc', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: { color: '#fff', fontSize: 16 },
  error: { color: '#ff6b6b', marginTop: 12 },
  button: {
    marginTop: 24,
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
