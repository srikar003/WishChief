import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, ErrorText, Field, Loading, Muted, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { isValidISODate, todayISO } from '@/lib/format';
import { useApiMutation, useAppData } from '@/lib/queries';
import { space } from '@/theme';

export default function AddSaving() {
  const { data } = useAppData();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addEntry = useApiMutation(api.addEntry);
  const addCategory = useApiMutation(api.addCategory);

  if (!data) return <Loading />;

  const selected = categoryId ?? data.categories[0]?.id ?? null;

  async function save() {
    setError(null);
    const value = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount above 0');
    if (!selected) return setError('Pick a category');
    if (!isValidISODate(date)) return setError('Use the date format YYYY-MM-DD');

    try {
      await addEntry.mutateAsync({ amount: value, categoryId: selected, description: description.trim(), date });
      setAmount('');
      setDescription('');
      setDate(todayISO());
      router.navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that entry");
    }
  }

  async function saveCategory() {
    const name = (newCategory ?? '').trim();
    if (!name) return setNewCategory(null);
    try {
      await addCategory.mutateAsync(name);
      setNewCategory(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that category");
    }
  }

  return (
    <Screen title="Add saving">
      <Field
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        placeholder="500"
        keyboardType="decimal-pad"
        style={{ fontSize: 28, textAlign: 'center', paddingVertical: 16 }}
      />

      <Muted style={{ marginTop: space.lg, marginBottom: 6 }}>Category</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {data.categories.map((c) => (
          <Chip key={c.id} label={c.name} selected={c.id === selected} onPress={() => setCategoryId(c.id)} />
        ))}
        {newCategory === null ? <Chip label="+ New" onPress={() => setNewCategory('')} /> : null}
      </View>
      {newCategory !== null ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field
              placeholder="Category name"
              value={newCategory}
              onChangeText={setNewCategory}
              onSubmitEditing={saveCategory}
              autoFocus
            />
          </View>
          <Button label="Add" variant="outline" onPress={saveCategory} />
        </View>
      ) : null}

      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Bought 5g gold coin"
      />
      <Field label="Date" value={date} onChangeText={setDate} placeholder="2026-10-18" autoCapitalize="none" />
      <ErrorText>{error}</ErrorText>

      <View style={{ marginTop: space.lg }}>
        <Button label="Save entry" onPress={save} loading={addEntry.isPending} />
      </View>
    </Screen>
  );
}
