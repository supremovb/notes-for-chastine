import { createClient } from '@supabase/supabase-js'

export type Note = {
  id: string
  title: string
  body: string
  mood: string
  healing_status?: string
  pov: string
  location: string
  image_url: string
  photo_urls?: string
  audio_url?: string
  tags?: string
  felt_then?: string
  understand_now?: string
  reaction?: string
  is_encrypted?: boolean
  privacy_hash?: string
  privacy_hint?: string
  is_pinned?: boolean
  is_archived?: boolean
  is_favorite: boolean
  entry_date?: string
  created_at: string
}

type NoteInput = Omit<Note, 'id' | 'created_at'>

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const storageKey = 'daily-notes-for-chastine'
const tableName = 'relationship_notes'

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}

function normalizeNote(note: Partial<Note>): Note {
  return {
    id: note.id ?? crypto.randomUUID(),
    title: note.title ?? '',
    body: note.body ?? '',
    mood: note.mood ?? 'Grateful',
    healing_status: note.healing_status ?? 'Unprocessed',
    pov: note.pov ?? 'My POV',
    location: note.location ?? '',
    image_url: note.image_url ?? '',
    photo_urls: note.photo_urls ?? '',
    audio_url: note.audio_url ?? '',
    tags: note.tags ?? '',
    felt_then: note.felt_then ?? '',
    understand_now: note.understand_now ?? '',
    reaction: note.reaction ?? '',
    is_encrypted: note.is_encrypted ?? false,
    privacy_hash: note.privacy_hash ?? '',
    privacy_hint: note.privacy_hint ?? '',
    is_pinned: note.is_pinned ?? false,
    is_archived: note.is_archived ?? false,
    is_favorite: note.is_favorite ?? false,
    entry_date: note.entry_date ?? (note.created_at ? note.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    created_at: note.created_at ?? new Date().toISOString(),
  }
}

function readLocalNotes(): Note[] {
  const rawNotes = localStorage.getItem(storageKey)
  return rawNotes ? (JSON.parse(rawNotes) as Partial<Note>[]).map(normalizeNote) : []
}

function writeLocalNotes(notes: Note[]) {
  localStorage.setItem(storageKey, JSON.stringify(notes))
}

export async function getNotes(): Promise<Note[]> {
  if (!supabase) {
    return readLocalNotes()
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeNote)
}

export async function createNote(note: NoteInput): Promise<Note> {
  if (!supabase) {
    const localNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    const notes = [localNote, ...readLocalNotes()]
    writeLocalNotes(notes)
    return localNote
  }

  const { data, error } = await supabase
    .from(tableName)
    .insert(note)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeNote(data)
}

export async function updateNote(id: string, note: NoteInput): Promise<Note> {
  if (!supabase) {
    const notes = readLocalNotes()
    const updatedNote = notes.find((currentNote) => currentNote.id === id)

    if (!updatedNote) {
      throw new Error('Note not found')
    }

    const nextNote = { ...updatedNote, ...note }
    writeLocalNotes(notes.map((currentNote) => (currentNote.id === id ? nextNote : currentNote)))
    return normalizeNote(nextNote)
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(note)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeNote(data)
}

export async function deleteNote(id: string): Promise<void> {
  if (!supabase) {
    writeLocalNotes(readLocalNotes().filter((note) => note.id !== id))
    return
  }

  const { error } = await supabase.from(tableName).delete().eq('id', id)

  if (error) {
    throw error
  }
}
