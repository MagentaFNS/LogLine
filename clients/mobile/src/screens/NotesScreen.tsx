import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Modal, Alert, TouchableOpacity } from 'react-native';
import { Plus, Trash2, X } from 'lucide-react-native';
import axios from 'axios';
import { API_URL, COLORS, RADIUS, SPACING } from '../config';
import { useStore } from '../store/useStore';
import { AnimatedPressable } from '../components/AnimatedPressable';

export const NotesScreen = () => {
  const { token } = useStore();
  const [notes, setNotes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotes = async () => {
    const res = await axios.get(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } });
    setNotes(res.data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const createNote = async () => {
    if (!title || !content) return;
    await axios.post(`${API_URL}/notes`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
    setTitle(''); setContent(''); setModalVisible(false); fetchNotes();
  };

  const deleteNote = (id: number) => {
    Alert.alert('Удалить?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        await axios.delete(`${API_URL}/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchNotes();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Заметки</Text>
        <AnimatedPressable onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Plus size={22} color={COLORS.white} strokeWidth={2.5} />
        </AnimatedPressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => deleteNote(item.id)}>
                <Trash2 size={16} color={COLORS.gray400} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Заметок нет</Text>
            <Text style={styles.emptyText}>Нажми + чтобы создать</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая заметка</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Заголовок"
              placeholderTextColor={COLORS.gray400}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="Текст заметки..."
              placeholderTextColor={COLORS.gray400}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
            <AnimatedPressable onPress={createNote} style={styles.saveBtn}>
              <Text style={styles.saveText}>Создать</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingTop: 64, paddingBottom: SPACING.lg,
  },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.black, letterSpacing: -1 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, flex: 1 },
  noteContent: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray800 },
  emptyText: { fontSize: 14, color: COLORS.gray500, marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl, paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.gray300, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  input: {
    backgroundColor: COLORS.gray50, borderRadius: RADIUS.md,
    padding: SPACING.lg, fontSize: 15, marginBottom: SPACING.md,
    color: COLORS.black,
  },
  saveBtn: {
    backgroundColor: COLORS.black, paddingVertical: 16,
    borderRadius: RADIUS.lg, alignItems: 'center',
  },
  saveText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
