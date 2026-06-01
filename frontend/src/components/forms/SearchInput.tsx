import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';

import { palette } from '@/src/theme/tokens';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChangeText, placeholder = 'Buscar cartas, sets o vendedores' }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSearch = () => {
    onChangeText(localValue);
  };

  return (
    <View style={styles.shell}>
      <Ionicons name="search-outline" size={20} color={palette.muted} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={localValue}
        onChangeText={setLocalValue}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.button}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
  },
  button: {
    backgroundColor: palette.pokemonBlue || '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
