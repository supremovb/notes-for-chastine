import {
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Heart,
  Images,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Mic,
  Moon,
  Palette,
  Play,
  Plus,
  Quote,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
  Unlock,
  Wand2,
  X,
} from 'lucide-react'
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  type SyntheticEvent,
  type UIEvent,
} from 'react'
import './App.css'
import usCardImage from './assets/us-card.webp'
import usImage from './assets/us-hero.webp'
import {
  createNote,
  getNotes,
  isSupabaseConfigured,
  updateNote,
  type Note,
} from './lib/notes'

const reflectionBody = `Last night, bago ako matulog, medyo mabigat yung pakiramdam ko.

Kasi kahit nasa iisang kwarto lang kami ni Chastine, hindi na kami natutulog the way we used to. Ako nasa sahig, may sarili kong kama at unan, habang siya nasa mattress bed. Dati, kahit sobrang init, kahit isang electric fan lang yung gamit namin, okay lang. Basta magkatabi kami, parang sapat na.

Ngayon, may aircon na nga, mas malamig na yung kwarto, mas comfortable na dapat... pero somehow, hindi pa rin sapat para sa akin.

Kasi hindi naman pala yung init yung problema.

I just miss sleeping beside her. I miss us.

Then this morning, something happened that I didn't expect.

Lumapit siya sa higaan ko. Half asleep pa ako nung naramdaman kong niyakap niya ako, sobrang higpit, to the point na halos hindi na ako makahinga. Pero instead na mairita ako, parang may part sa akin na ayaw nang matapos yung moment na yun.

It was probably the softest and happiest morning I've had in a while.

Then she kissed me on the cheek and told me that she missed me.

And kahit antok na antok pa ako, parang automatic na lang lumabas sa bibig ko yung matagal nang gustong sabihin ng puso ko.

"Miss na miss din kita. Mahal na mahal kita."

For a few minutes, parang bumalik yung dating kami. Yung walang distance, walang kailangan ipaliwanag, walang kailangan ayusin agad. Just two people holding each other again after everything became complicated.

I know one hug doesn't magically fix everything. Pero I'd be lying if I said it didn't give me hope.

Because this morning reminded me of something I almost forgot:

I still feel at home in her arms.

Maybe some things are still there. Quietly. Waiting for us to become gentle enough with each other again.`

const moods = ['Missing her', 'Hopeful', 'Soft', 'Heavy', 'Grateful', 'Learning']
const healingStatuses = ['Unprocessed', 'Still hurts', 'Understanding it', 'At peace']
const softReactions = ['Still hurts', 'Gave me hope', 'I miss this', 'I understand now']
const weatherOptions = ['Clear', 'Quiet', 'Heavy', 'Hopeful', 'Distant', 'Soft']
const themes = ['warm', 'dark', 'minimal'] as const
const lenses = ['All', 'Favorites', 'Long reads', 'Unsent letters']
const draftStorageKey = 'daily-notes-for-chastine-draft'
const themeStorageKey = 'daily-notes-for-chastine-theme'
const datesStorageKey = 'daily-notes-for-chastine-important-dates'
const weatherStorageKey = 'daily-notes-for-chastine-weather'
const tutorialSeenStorageKey = 'daily-notes-for-chastine-tutorial-seen'
const encryptedPrefix = 'encrypted:v1:'
const privacyPrefix = 'lock:v1:'
const writingNudges = [
  'What changed today?',
  'What did I miss?',
  'What gave me hope?',
  'What still hurts?',
]
const noteTemplates = [
  {
    label: 'Heavy night',
    title: 'A heavy night I need to write down',
    mood: 'Heavy',
    healing_status: 'Unprocessed',
    tags: 'heavy night, distance, processing',
    body: 'Tonight felt heavy because...\n\nWhat I wish I could say honestly is...\n\nWhat I need to remember before I react is...',
  },
  {
    label: 'Soft morning',
    title: 'A soft morning with Chastine',
    mood: 'Soft',
    healing_status: 'Understanding it',
    tags: 'soft moment, hope, home',
    body: 'This morning felt soft because...\n\nThe part I want to keep is...\n\nMaybe this means...',
  },
  {
    label: 'Letter',
    title: 'Things I wish I could tell you',
    mood: 'Missing her',
    healing_status: 'Still hurts',
    tags: 'letter, honest, missing her',
    body: 'I do not know if I will ever send this, but I want you to know...\n\nWhat I miss is...\n\nWhat I am trying to understand is...',
  },
  {
    label: 'Conflict reflection',
    title: 'What happened between us',
    mood: 'Heavy',
    healing_status: 'Unprocessed',
    tags: 'conflict, accountability, repair',
    body: 'What happened:\n\nWhat I felt:\n\nWhat I may have misunderstood:\n\nWhat I own:\n\nWhat I need to understand before we talk again:',
    felt_then: 'I felt...',
    understand_now: 'I am starting to understand...',
  },
]
const tutorialSteps = [
  {
    target: 'guide',
    title: 'A quick walk-through',
    body: 'This short tour points to the important controls so the journal feels easier to use.',
    placement: 'bottom',
  },
  {
    target: 'compose',
    title: 'Write the memory',
    body: 'Start here when you want to add a thought, POV, letter, photo, lock, or reaction.',
    placement: 'right',
  },
  {
    target: 'private-note',
    title: 'Lock one note',
    body: 'Add a note passcode to make only that note ask for a key before it opens.',
    placement: 'right',
  },
  {
    target: 'filters',
    title: 'Find a feeling',
    body: 'Use filters, search, archive view, and playback when the timeline starts growing.',
    placement: 'bottom',
  },
  {
    target: 'calendar',
    title: 'Follow the days',
    body: 'The calendar shows which dates have memories and lets you jump into one day.',
    placement: 'right',
  },
  {
    target: 'weather',
    title: 'Daily check-in',
    body: 'Relationship weather is a small honest read of how today feels.',
    placement: 'left',
  },
] as const

function getTodayKey() {
  const today = new Date()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

const fallbackNotes: Note[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'I still feel at home in her arms',
    body: reflectionBody,
    mood: 'Missing her',
    healing_status: 'Understanding it',
    pov: 'My POV',
    location: 'Our room',
    image_url: usCardImage,
    photo_urls: '',
    audio_url: '',
    felt_then: 'Mabigat. Parang ang lapit niya pero ang layo pa rin namin.',
    understand_now: 'Hindi kailangang maayos lahat agad para maging totoo yung soft moment.',
    reaction: 'Gave me hope',
    is_encrypted: false,
    privacy_hash: '',
    privacy_hint: '',
    is_pinned: true,
    is_archived: false,
    is_favorite: true,
    entry_date: getTodayKey(),
    created_at: new Date().toISOString(),
  },
]

const initialForm = {
  title: '',
  body: '',
  mood: moods[0],
  healing_status: healingStatuses[0],
  pov: 'My POV',
  location: '',
  image_url: '',
  photo_urls: '',
  audio_url: '',
  tags: '',
  entry_date: getTodayKey(),
  felt_then: '',
  understand_now: '',
  reaction: '',
  is_encrypted: false,
  privacy_key: '',
  privacy_hint: '',
  is_pinned: false,
  is_archived: false,
  is_favorite: false,
}

type Theme = (typeof themes)[number]
type ImportantDate = {
  id: string
  date: string
  label: string
}

type NoteForm = typeof initialForm

function normalizeFormDraft(formDraft: Partial<NoteForm>): NoteForm {
  return {
    title: formDraft.title ?? initialForm.title,
    body: formDraft.body ?? initialForm.body,
    mood: formDraft.mood ?? initialForm.mood,
    healing_status: formDraft.healing_status ?? initialForm.healing_status,
    pov: formDraft.pov ?? initialForm.pov,
    location: formDraft.location ?? initialForm.location,
    image_url: formDraft.image_url ?? initialForm.image_url,
    photo_urls: formDraft.photo_urls ?? initialForm.photo_urls,
    audio_url: formDraft.audio_url ?? initialForm.audio_url,
    tags: formDraft.tags ?? initialForm.tags,
    entry_date: formDraft.entry_date ?? initialForm.entry_date,
    felt_then: formDraft.felt_then ?? initialForm.felt_then,
    understand_now: formDraft.understand_now ?? initialForm.understand_now,
    reaction: formDraft.reaction ?? initialForm.reaction,
    is_encrypted: formDraft.is_encrypted ?? initialForm.is_encrypted,
    privacy_key: formDraft.privacy_key ?? initialForm.privacy_key,
    privacy_hint: formDraft.privacy_hint ?? initialForm.privacy_hint,
    is_pinned: formDraft.is_pinned ?? initialForm.is_pinned,
    is_archived: formDraft.is_archived ?? initialForm.is_archived,
    is_favorite: formDraft.is_favorite ?? initialForm.is_favorite,
  }
}

type Toast = {
  id: string
  message: string
}

type TutorialPosition = {
  arrowLeft: number
  arrowTop: number
  cardLeft: number
  cardTop: number
  isSmallScreen: boolean
}

const shouldUseDemoNotes = !isSupabaseConfigured()

function getReadingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 180))
}

function getDayKey(date: string | Date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  const targetDate = typeof date === 'string' ? new Date(date) : date
  const month = `${targetDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${targetDate.getDate()}`.padStart(2, '0')
  return `${targetDate.getFullYear()}-${month}-${day}`
}

function getPhotoUrls(note: Pick<Note, 'image_url' | 'photo_urls'>) {
  return [note.image_url, note.photo_urls]
    .filter(Boolean)
    .join('\n')
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
}

function getDisplayPhoto(url?: string) {
  const cleanUrl = url?.trim()

  if (
    !cleanUrl ||
    cleanUrl.startsWith('src/assets/') ||
    cleanUrl.startsWith('/src/assets/') ||
    cleanUrl.includes('\\src\\assets\\') ||
    cleanUrl.includes('/src/assets/') ||
    /^[a-z]:\\/i.test(cleanUrl)
  ) {
    return usCardImage
  }

  return cleanUrl
}

function getDisplayAudio(url?: string) {
  const cleanUrl = url?.trim()

  if (!cleanUrl) {
    return ''
  }

  if (/^(https?:|blob:|data:audio\/)/i.test(cleanUrl)) {
    return cleanUrl
  }

  const compactBase64 = cleanUrl.replace(/\s+/g, '')

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(compactBase64)) {
    return `data:audio/mpeg;base64,${compactBase64}`
  }

  return cleanUrl
}

function getPrimaryPhoto(note: Pick<Note, 'image_url' | 'photo_urls'>) {
  return getDisplayPhoto(getPhotoUrls(note)[0])
}

function handleImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.src !== usCardImage) {
    event.currentTarget.src = usCardImage
  }
}

function isEncryptedNote(note: Pick<Note, 'body' | 'is_encrypted'>) {
  return Boolean(note.is_encrypted || note.body.startsWith(encryptedPrefix))
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBytes(base64: string) {
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function getEncryptionKey(passphrase: string, salt: Uint8Array, usage: KeyUsage[]) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  )
}

async function decryptText(payload: string, passphrase: string) {
  const [, , saltBase64, ivBase64, encryptedBase64] = payload.split(':')

  if (!saltBase64 || !ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted note')
  }

  const salt = base64ToBytes(saltBase64)
  const iv = base64ToBytes(ivBase64)
  const encrypted = base64ToBytes(encryptedBase64)
  const key = await getEncryptionKey(passphrase, salt, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encrypted),
  )

  return new TextDecoder().decode(decrypted)
}

async function derivePrivacyHash(passcode: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  return bytesToBase64(new Uint8Array(bits))
}

async function createPrivacyHash(passcode: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `${privacyPrefix}${bytesToBase64(salt)}:${await derivePrivacyHash(passcode, salt)}`
}

async function verifyPrivacyPasscode(passcode: string, storedHash: string) {
  const [, , saltBase64, hash] = storedHash.split(':')

  if (!saltBase64 || !hash) {
    return false
  }

  const nextHash = await derivePrivacyHash(passcode, base64ToBytes(saltBase64))
  return nextHash === hash
}

function getMonthDays(referenceDate: Date) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ]
}

function getQuoteFromNote(note: Note) {
  const sentences = note.body
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim().replace(/^"|"$/g, ''))
    .filter(Boolean)

  return (
    sentences.find((sentence) =>
      /miss|home|hope|mahal|soft|arms|gentle|quiet/i.test(sentence),
    ) ??
    sentences.find((sentence) => sentence.length > 22) ??
    note.body.slice(0, 120)
  )
}

function App() {
  const [notes, setNotes] = useState<Note[]>(shouldUseDemoNotes ? fallbackNotes : [])
  const [form, setForm] = useState(initialForm)
  const [query, setQuery] = useState('')
  const [activeMood, setActiveMood] = useState('All')
  const [activeHealing, setActiveHealing] = useState('All')
  const [activeReaction, setActiveReaction] = useState('All')
  const [activeTag, setActiveTag] = useState('All')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [activeLens, setActiveLens] = useState('All')
  const [activeDate, setActiveDate] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [activeView, setActiveView] = useState<'timeline' | 'gallery'>('timeline')
  const [selectedNote, setSelectedNote] = useState<Note | null>(
    shouldUseDemoNotes ? fallbackNotes[0] : null,
  )
  const [pendingDeleteNote, setPendingDeleteNote] = useState<Note | null>(null)
  const [pendingDiscardAction, setPendingDiscardAction] = useState<(() => void) | null>(null)
  const [editingNoteId, setEditingNoteId] = useState('')
  const [isLetterMode, setIsLetterMode] = useState(false)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(themeStorageKey) as Theme | null) ?? 'warm',
  )
  const [showArchived, setShowArchived] = useState(false)
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null)
  const [lightboxImage, setLightboxImage] = useState('')
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(() => {
    const storedDates = localStorage.getItem(datesStorageKey)
    return storedDates ? (JSON.parse(storedDates) as ImportantDate[]) : []
  })
  const [importantDateForm, setImportantDateForm] = useState({ date: getTodayKey(), label: '' })
  const [relationshipWeather, setRelationshipWeather] = useState(
    () => localStorage.getItem(weatherStorageKey) ?? 'Quiet',
  )
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, boolean>>({})
  const [unlockedNoteKeys, setUnlockedNoteKeys] = useState<Record<string, string>>({})
  const [legacyDecryptedBodies, setLegacyDecryptedBodies] = useState<Record<string, string>>({})
  const [legacyOriginalKeys, setLegacyOriginalKeys] = useState<Record<string, string>>({})
  const [notePasscodes, setNotePasscodes] = useState<Record<string, string>>({})
  const [removeLockPasscodes, setRemoveLockPasscodes] = useState<Record<string, string>>({})
  const [tutorialStep, setTutorialStep] = useState<number | null>(null)
  const [tutorialPosition, setTutorialPosition] = useState<TutorialPosition | null>(null)
  const [copiedQuoteId, setCopiedQuoteId] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [readerProgress, setReaderProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isMounted = true

    getNotes()
      .then((savedNotes) => {
        if (isMounted) {
          const nextNotes = savedNotes.length > 0 ? savedNotes : shouldUseDemoNotes ? fallbackNotes : []
          setNotes(nextNotes)
          setSelectedNote(nextNotes[0] ?? null)
        }
      })
      .catch(() => {
      if (isMounted) {
          showToast('Local mode muna. Supabase will connect once your keys and table are ready.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftStorageKey)

    if (!savedDraft) {
      return
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as {
        form?: Partial<NoteForm>
        isLetterMode?: boolean
      }

      if (parsedDraft.form) {
        setForm(normalizeFormDraft(parsedDraft.form))
      }

      if (typeof parsedDraft.isLetterMode === 'boolean') {
        setIsLetterMode(parsedDraft.isLetterMode)
      }
    } catch {
      localStorage.removeItem(draftStorageKey)
    }
  }, [])

  useEffect(() => {
    const hasDraft = JSON.stringify(form) !== JSON.stringify(initialForm)

    if (!hasDraft && !isLetterMode) {
      localStorage.removeItem(draftStorageKey)
      return
    }

    localStorage.setItem(draftStorageKey, JSON.stringify({ form, isLetterMode }))
  }, [form, isLetterMode])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(datesStorageKey, JSON.stringify(importantDates))
  }, [importantDates])

  useEffect(() => {
    localStorage.setItem(weatherStorageKey, relationshipWeather)
  }, [relationshipWeather])

  useEffect(() => {
    document.body.classList.toggle(
      'modal-open',
      Boolean(selectedNote || pendingDeleteNote || pendingDiscardAction || playbackIndex !== null || lightboxImage),
    )
    setReaderProgress(0)

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [lightboxImage, pendingDeleteNote, pendingDiscardAction, playbackIndex, selectedNote])

  useEffect(() => {
    let isMounted = true

    Promise.all(
      notes
        .filter((note) => isEncryptedNote(note) && unlockedNoteKeys[note.id])
        .map(async (note) => {
          try {
            return [note.id, await decryptText(note.body, unlockedNoteKeys[note.id])] as const
          } catch {
            return [note.id, ''] as const
          }
        }),
    ).then((entries) => {
      if (!isMounted) {
        return
      }

      setLegacyDecryptedBodies((currentBodies) => ({
        ...currentBodies,
        ...entries.reduce<Record<string, string>>((nextBodies, [id, body]) => {
          if (body) {
            nextBodies[id] = body
          }
          return nextBodies
        }, {}),
      }))
    })

    return () => {
      isMounted = false
    }
  }, [notes, unlockedNoteKeys])

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (editingNoteId && JSON.stringify(form) !== JSON.stringify(initialForm)) {
        event.preventDefault()
      }
    }

    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [editingNoteId, form])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (tutorialStep !== null) {
          setTutorialStep(null)
          return
        }

        setSelectedNote(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [tutorialStep])

  useEffect(() => {
    if (isLoading || localStorage.getItem(tutorialSeenStorageKey)) {
      return
    }

    const timer = window.setTimeout(() => {
      setTutorialStep(0)
      localStorage.setItem(tutorialSeenStorageKey, 'true')
    }, 900)

    return () => window.clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    if (tutorialStep === null) {
      document.querySelectorAll('[data-tour].tutorial-highlight').forEach((element) => {
        element.classList.remove('tutorial-highlight')
      })
      setTutorialPosition(null)
      return
    }

    const step = tutorialSteps[tutorialStep]

    const updateTutorialPosition = () => {
      const target = document.querySelector(`[data-tour="${step.target}"]`)

      if (!(target instanceof HTMLElement)) {
        setTutorialPosition(null)
        return
      }

      target.classList.add('tutorial-highlight')
      const isSmallScreen = window.innerWidth <= 720
      const rect = target.getBoundingClientRect()
      const cardWidth = Math.min(410, window.innerWidth - 28)
      const cardHeight = 250
      const gap = 22
      const maxLeft = window.innerWidth - cardWidth - 14
      const maxTop = window.innerHeight - cardHeight - 14
      const centeredLeft = rect.left + rect.width / 2 - cardWidth / 2
      let cardLeft = Math.max(14, Math.min(maxLeft, centeredLeft))
      let cardTop = Math.max(14, Math.min(maxTop, rect.bottom + gap))

      if (isSmallScreen) {
        cardLeft = 14
        cardTop = 12
      }

      if (step.placement === 'right') {
        cardLeft = Math.max(14, Math.min(maxLeft, rect.right + gap))
        cardTop = Math.max(14, Math.min(maxTop, rect.top + rect.height / 2 - cardHeight / 2))
      }

      if (step.placement === 'left') {
        cardLeft = Math.max(14, Math.min(maxLeft, rect.left - cardWidth - gap))
        cardTop = Math.max(14, Math.min(maxTop, rect.top + rect.height / 2 - cardHeight / 2))
      }

      if (isSmallScreen) {
        cardLeft = 14
        cardTop = 12
      }

      setTutorialPosition({
        arrowLeft: rect.left + rect.width / 2,
        arrowTop: rect.top + rect.height / 2,
        cardLeft,
        cardTop,
        isSmallScreen,
      })
    }

    let positionTimer: number | undefined

    const scrollToTutorialTarget = () => {
      const target = document.querySelector(`[data-tour="${step.target}"]`)

      if (!(target instanceof HTMLElement)) {
        setTutorialPosition(null)
        return
      }

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })

      updateTutorialPosition()
      positionTimer = window.setTimeout(updateTutorialPosition, window.innerWidth <= 720 ? 520 : 280)
    }

    const timer = window.setTimeout(scrollToTutorialTarget, 180)
    window.addEventListener('resize', updateTutorialPosition)
    window.addEventListener('scroll', updateTutorialPosition, true)

    return () => {
      window.clearTimeout(timer)
      if (positionTimer) {
        window.clearTimeout(positionTimer)
      }
      window.removeEventListener('resize', updateTutorialPosition)
      window.removeEventListener('scroll', updateTutorialPosition, true)
      document.querySelectorAll('[data-tour].tutorial-highlight').forEach((element) => {
        element.classList.remove('tutorial-highlight')
      })
    }
  }, [tutorialStep])

  const isNoteLocked = useCallback(
    (note: Pick<Note, 'id' | 'privacy_hash'>) =>
      Boolean(note.privacy_hash) && !unlockedNotes[note.id],
    [unlockedNotes],
  )

  const getReadableBody = useCallback((note: Note) => {
    if (isNoteLocked(note)) {
      return 'This note is private. Unlock it to read what is inside.'
    }

    if (!isEncryptedNote(note)) {
      return note.body
    }

    return legacyDecryptedBodies[note.id] ?? 'This older encrypted note needs its original key.'
  }, [isNoteLocked, legacyDecryptedBodies])

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return notes.filter((note) => {
      const matchesArchive = showArchived ? note.is_archived : !note.is_archived
      const matchesMood = activeMood === 'All' || note.mood === activeMood
      const matchesHealing = activeHealing === 'All' || note.healing_status === activeHealing
      const matchesReaction = activeReaction === 'All' || note.reaction === activeReaction
      const noteTags = (note.tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
      const matchesTag = activeTag === 'All' || noteTags.includes(activeTag)
      const matchesLens =
        activeLens === 'All' ||
        (activeLens === 'Favorites' && note.is_favorite) ||
        (activeLens === 'Long reads' && getReadingMinutes(getReadableBody(note)) >= 2) ||
        (activeLens === 'Unsent letters' && note.pov === 'Letter for Chastine')
      const noteDay = getDayKey(note.entry_date ?? note.created_at)
      const matchesDate = !activeDate || noteDay === activeDate
      const matchesRange =
        (!dateRange.from || noteDay >= dateRange.from) && (!dateRange.to || noteDay <= dateRange.to)
      const searchable =
        `${note.title} ${getReadableBody(note)} ${note.pov} ${note.location} ${note.tags ?? ''} ${note.healing_status ?? ''} ${note.felt_then ?? ''} ${note.understand_now ?? ''}`.toLowerCase()
      return (
        matchesMood &&
        matchesHealing &&
        matchesReaction &&
        matchesTag &&
        matchesArchive &&
        matchesLens &&
        matchesDate &&
        matchesRange &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      )
    })
  }, [
    activeDate,
    activeHealing,
    activeLens,
    activeMood,
    activeReaction,
    activeTag,
    dateRange,
    getReadableBody,
    notes,
    query,
    showArchived,
  ])

  const favoriteCount = useMemo(
    () => notes.filter((note) => note.is_favorite).length,
    [notes],
  )

  const visibleNotes = useMemo(
    () => notes.filter((note) => (showArchived ? note.is_archived : !note.is_archived)),
    [notes, showArchived],
  )

  const latestNote = visibleNotes[0]
  const calendarDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth])
  const notesByDay = useMemo(() => {
    return notes.reduce<Record<string, Note[]>>((groupedNotes, note) => {
      const dayKey = getDayKey(note.entry_date ?? note.created_at)
      groupedNotes[dayKey] = [...(groupedNotes[dayKey] ?? []), note]
      return groupedNotes
    }, {})
  }, [notes])
  const favoriteQuotes = useMemo(
    () =>
      visibleNotes
        .filter((note) => note.is_favorite)
        .slice(0, 3)
        .map((note) => ({ id: note.id, note, quote: getQuoteFromNote({ ...note, body: getReadableBody(note) }) })),
    [getReadableBody, visibleNotes],
  )
  const pinnedNote = useMemo(
    () => visibleNotes.find((note) => note.is_pinned) ?? null,
    [visibleNotes],
  )
  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(
          notes.flatMap((note) =>
            (note.tags ?? '')
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ),
      ).sort(),
    [notes],
  )
  const locationGroups = useMemo(
    () =>
      Array.from(
        visibleNotes
          .filter((note) => note.location.trim())
          .reduce<Map<string, Note[]>>((groups, note) => {
            const location = note.location.trim()
            groups.set(location, [...(groups.get(location) ?? []), note])
            return groups
          }, new Map()),
      )
        .map(([location, locationNotes]) => ({ location, notes: locationNotes }))
        .sort((a, b) => b.notes.length - a.notes.length)
        .slice(0, 5),
    [visibleNotes],
  )
  const healingProgress = useMemo(
    () =>
      healingStatuses.map((statusOption) => {
        const count = visibleNotes.filter((note) => note.healing_status === statusOption).length
        const percent = visibleNotes.length ? Math.round((count / visibleNotes.length) * 100) : 0
        return { status: statusOption, count, percent }
      }),
    [visibleNotes],
  )
  const monthlyRecap = useMemo(() => {
    const monthKey = `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, '0')}`
    const monthNotes = visibleNotes.filter((note) =>
      getDayKey(note.entry_date ?? note.created_at).startsWith(monthKey),
    )
    const favoriteMood =
      moods
        .map((mood) => ({
          mood,
          count: monthNotes.filter((note) => note.mood === mood).length,
        }))
        .sort((a, b) => b.count - a.count)[0]?.mood ?? 'Quiet'
    const favoriteLine = monthNotes.find((note) => note.is_favorite)

    return {
      count: monthNotes.length,
      favoriteMood,
      favoriteLine: favoriteLine ? getQuoteFromNote({ ...favoriteLine, body: getReadableBody(favoriteLine) }) : '',
      letters: monthNotes.filter((note) => note.pov === 'Letter for Chastine').length,
    }
  }, [calendarMonth, getReadableBody, visibleNotes])
  const selectedNoteIndex = selectedNote
    ? notes.findIndex((note) => note.id === selectedNote.id)
    : -1
  const playbackNote = playbackIndex === null ? null : filteredNotes[playbackIndex] ?? null
  const playbackPosition = playbackIndex ?? 0

  function highlightMatches(text: string) {
    const cleanQuery = query.trim()

    if (!cleanQuery) {
      return text
    }

    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

    return parts.map((part, index) =>
      part.toLowerCase() === cleanQuery.toLowerCase() ? (
        <mark key={`${part}-${index}`}>{part}</mark>
      ) : (
        part
      ),
    )
  }

  function renderInlineMarkdown(text: string): ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      }

      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>
      }

      return part
    })
  }

  function showToast(message: string) {
    const id = crypto.randomUUID()
    setToasts((currentToasts) => [...currentToasts, { id, message }])
    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
    }, 2600)
  }

  function toNoteInput(note: Note, overrides: Partial<Note> = {}) {
    const nextNote = { ...note, ...overrides }

    return {
      title: nextNote.title,
      body: nextNote.body,
      mood: nextNote.mood,
      healing_status: nextNote.healing_status ?? healingStatuses[0],
      pov: nextNote.pov,
      location: nextNote.location,
      image_url: nextNote.image_url,
      photo_urls: nextNote.photo_urls ?? '',
      audio_url: nextNote.audio_url ?? '',
      tags: nextNote.tags ?? '',
      felt_then: nextNote.felt_then ?? '',
      understand_now: nextNote.understand_now ?? '',
      reaction: nextNote.reaction ?? '',
      is_encrypted: nextNote.is_encrypted ?? false,
      privacy_hash: nextNote.privacy_hash ?? '',
      privacy_hint: nextNote.privacy_hint ?? '',
      is_pinned: nextNote.is_pinned ?? false,
      is_archived: nextNote.is_archived ?? false,
      is_favorite: nextNote.is_favorite,
      entry_date: nextNote.entry_date ?? getTodayKey(),
    }
  }

  function useSampleReflection() {
    setForm({
      title: 'I still feel at home in her arms',
      body: reflectionBody,
      mood: 'Missing her',
      healing_status: 'Understanding it',
      pov: 'My POV',
      location: 'Our room',
      image_url: '',
      photo_urls: '',
      audio_url: '',
      tags: 'missing her, soft morning, hope',
      entry_date: getTodayKey(),
      felt_then: 'Mabigat. Parang ang lapit niya physically pero ang layo emotionally.',
      understand_now: 'One soft morning does not fix everything, pero it can still matter.',
      reaction: 'Gave me hope',
      is_encrypted: false,
      privacy_key: '',
      privacy_hint: '',
      is_pinned: true,
      is_archived: false,
      is_favorite: true,
    })
    setIsLetterMode(false)
    showToast('Loaded your sample reflection into the composer.')
  }

  function addWritingNudge(nudge: string) {
    setForm((currentForm) => ({
      ...currentForm,
      body: currentForm.body ? `${currentForm.body}\n\n${nudge}\n` : `${nudge}\n`,
    }))
  }

  function applyTemplate(template: (typeof noteTemplates)[number]) {
    confirmDiscard(() => {
      setForm(
        normalizeFormDraft({
          ...initialForm,
          title: template.title,
          body: template.body,
          mood: template.mood,
          healing_status: template.healing_status,
          tags: template.tags,
          felt_then: template.felt_then ?? '',
          understand_now: template.understand_now ?? '',
          entry_date: getTodayKey(),
        }),
      )
      setIsLetterMode(template.label === 'Letter')
      showToast(`${template.label} template loaded.`)
    })
  }

  function exportBackup() {
    const backup = {
      exported_at: new Date().toISOString(),
      notes,
      important_dates: importantDates,
      relationship_weather: relationshipWeather,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `notes-for-chastine-backup-${getTodayKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Backup exported.')
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const backup = JSON.parse(await file.text()) as {
        notes?: Partial<Note>[]
        important_dates?: ImportantDate[]
        relationship_weather?: string
      }
      const importedNotes = backup.notes ?? []
      const createdNotes = await Promise.all(
        importedNotes.map((note) =>
          createNote(
            toNoteInput({
              ...note,
              id: note.id ?? crypto.randomUUID(),
              title: note.title ?? '',
              body: note.body ?? '',
              mood: note.mood ?? moods[0],
              pov: note.pov ?? 'My POV',
              location: note.location ?? '',
              image_url: note.image_url ?? usCardImage,
              photo_urls: note.photo_urls ?? '',
              audio_url: note.audio_url ?? '',
              is_favorite: note.is_favorite ?? false,
              is_encrypted: note.is_encrypted ?? false,
              privacy_hash: note.privacy_hash ?? '',
              privacy_hint: note.privacy_hint ?? '',
              created_at: note.created_at ?? new Date().toISOString(),
            } as Note),
          ),
        ),
      )
      setNotes((currentNotes) => [...createdNotes, ...currentNotes])

      if (backup.important_dates) {
        setImportantDates(backup.important_dates)
      }

      if (backup.relationship_weather) {
        setRelationshipWeather(backup.relationship_weather)
      }

      showToast(`Imported ${createdNotes.length} notes.`)
    } catch {
      showToast('Could not import that backup file.')
    }
  }

  function cycleTheme() {
    const currentIndex = themes.indexOf(theme)
    setTheme(themes[(currentIndex + 1) % themes.length])
  }

  function moveCalendarMonth(direction: 'previous' | 'next') {
    setCalendarMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + (direction === 'previous' ? -1 : 1),
          1,
        ),
    )
    setActiveDate('')
  }

  function addImportantDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!importantDateForm.date || !importantDateForm.label.trim()) {
      showToast('Add a date and label.')
      return
    }

    setImportantDates((currentDates) => [
      ...currentDates,
      {
        id: crypto.randomUUID(),
        date: importantDateForm.date,
        label: importantDateForm.label.trim(),
      },
    ])
    setImportantDateForm({ date: getTodayKey(), label: '' })
    showToast('Important date added.')
  }

  function removeImportantDate(id: string) {
    setImportantDates((currentDates) => currentDates.filter((dateItem) => dateItem.id !== id))
    showToast('Important date removed.')
  }

  async function exportPdf() {
    const exportNotes = notes.filter((note) => !note.is_archived && (note.is_favorite || note.is_pinned))

    if (exportNotes.length === 0) {
      showToast('Mark or pin notes before exporting.')
      return
    }

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 48
    let y = 56

    pdf.setFont('times', 'bold')
    pdf.setFontSize(22)
    pdf.text('Notes for Chastine', margin, y)
    y += 30

    exportNotes.forEach((note, index) => {
      if (index > 0) {
        pdf.addPage()
        y = 56
      }

      pdf.setFont('times', 'bold')
      pdf.setFontSize(18)
      pdf.text(note.title, margin, y, { maxWidth: pageWidth - margin * 2 })
      y += 28
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`${note.mood} | ${note.healing_status ?? 'Unprocessed'} | ${note.entry_date ?? ''}`, margin, y)
      y += 24
      pdf.setFont('times', 'normal')
      pdf.setFontSize(12)
      const lines = pdf.splitTextToSize(getReadableBody(note), pageWidth - margin * 2) as string[]
      lines.forEach((line) => {
        if (y > 760) {
          pdf.addPage()
          y = 56
        }
        pdf.text(line, margin, y)
        y += 17
      })
    })

    pdf.save('notes-for-chastine.pdf')
    showToast('PDF exported.')
  }

  function confirmDiscard(action: () => void) {
    if (editingNoteId && JSON.stringify(form) !== JSON.stringify(initialForm)) {
      setPendingDiscardAction(() => action)
      return
    }

    action()
  }

  function openRandomMemory() {
    const randomNote = notes[Math.floor(Math.random() * notes.length)]

    if (randomNote) {
      setSelectedNote(randomNote)
      showToast('Opened a random memory.')
    }
  }

  async function copyQuote(quoteId: string, quote: string) {
    try {
      await navigator.clipboard.writeText(quote)
      setCopiedQuoteId(quoteId)
      showToast('Copied quote.')
      window.setTimeout(() => setCopiedQuoteId(''), 1400)
    } catch {
      showToast('Could not copy from this browser, but the quote is still here.')
    }
  }

  async function unlockPrivateNote(note: Note, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    const passcode = notePasscodes[note.id]?.trim()

    if (!passcode) {
      showToast('Enter this note passcode first.')
      return
    }

    if (!note.privacy_hash || !(await verifyPrivacyPasscode(passcode, note.privacy_hash))) {
      showToast('That passcode did not unlock this note.')
      return
    }

    setUnlockedNotes((currentNotes) => ({ ...currentNotes, [note.id]: true }))
    setUnlockedNoteKeys((currentKeys) => ({ ...currentKeys, [note.id]: passcode }))
    setNotePasscodes((currentPasscodes) => ({ ...currentPasscodes, [note.id]: '' }))
    showToast('Private note unlocked.')
  }

  function lockPrivateNote(note: Note) {
    setUnlockedNotes((currentNotes) => ({ ...currentNotes, [note.id]: false }))
    setUnlockedNoteKeys((currentKeys) => {
      const nextKeys = { ...currentKeys }
      delete nextKeys[note.id]
      return nextKeys
    })
    showToast('Private note locked.')
  }

  async function removePrivateNoteLock(note: Note, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    const passcode = removeLockPasscodes[note.id]?.trim()

    if (!note.privacy_hash) {
      showToast('This note does not have a lock.')
      return
    }

    if (!passcode) {
      showToast('Enter the current note passcode first.')
      return
    }

    if (!(await verifyPrivacyPasscode(passcode, note.privacy_hash))) {
      showToast('That passcode did not match this note.')
      return
    }

    try {
      const updatedNote = await updateNote(
        note.id,
        toNoteInput(note, {
          privacy_hash: '',
          privacy_hint: '',
        }),
      )

      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === note.id ? updatedNote : currentNote,
        ),
      )
      setSelectedNote((currentNote) => (currentNote?.id === note.id ? updatedNote : currentNote))
      setUnlockedNotes((currentNotes) => {
        const nextNotes = { ...currentNotes }
        delete nextNotes[note.id]
        return nextNotes
      })
      setUnlockedNoteKeys((currentKeys) => {
        const nextKeys = { ...currentKeys }
        delete nextKeys[note.id]
        return nextKeys
      })
      setNotePasscodes((currentPasscodes) => {
        const nextPasscodes = { ...currentPasscodes }
        delete nextPasscodes[note.id]
        return nextPasscodes
      })
      setRemoveLockPasscodes((currentPasscodes) => {
        const nextPasscodes = { ...currentPasscodes }
        delete nextPasscodes[note.id]
        return nextPasscodes
      })
      showToast('Note lock removed.')
    } catch {
      showToast('Could not remove the lock yet. Check your Supabase policy setup.')
    }
  }

  async function removeLegacyOriginalKey(note: Note, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    if (isNoteLocked(note)) {
      showToast('Unlock this note first.')
      return
    }

    try {
      const originalKey = legacyOriginalKeys[note.id]?.trim()
      const readableBody =
        legacyDecryptedBodies[note.id] ||
        (originalKey ? await decryptText(note.body, originalKey) : '')

      if (!readableBody) {
        showToast('Enter the old original key once to remove it.')
        return
      }

      const updatedNote = await updateNote(
        note.id,
        toNoteInput(note, {
          body: readableBody,
          is_encrypted: false,
        }),
      )

      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === note.id ? updatedNote : currentNote,
        ),
      )
      setSelectedNote((currentNote) => (currentNote?.id === note.id ? updatedNote : currentNote))
      setLegacyDecryptedBodies((currentBodies) => {
        const nextBodies = { ...currentBodies }
        delete nextBodies[note.id]
        return nextBodies
      })
      setLegacyOriginalKeys((currentKeys) => {
        const nextKeys = { ...currentKeys }
        delete nextKeys[note.id]
        return nextKeys
      })
      showToast('Original key removed. This note now uses only the note passcode.')
    } catch {
      showToast('That original key did not work for this note.')
    }
  }

  function editNote(note: Note) {
    if (isNoteLocked(note)) {
      showToast('Unlock this note before editing it.')
      return
    }

    if (isEncryptedNote(note) && !legacyDecryptedBodies[note.id]) {
      showToast('Unlock this older encrypted note with its original key before editing it.')
      return
    }

    confirmDiscard(() => {
      setForm(normalizeFormDraft({
      title: note.title,
      body: getReadableBody(note),
      mood: note.mood,
      healing_status: note.healing_status ?? healingStatuses[0],
      pov: note.pov,
      location: note.location,
      image_url: note.image_url,
      photo_urls: note.photo_urls ?? '',
      audio_url: note.audio_url ?? '',
      tags: note.tags ?? '',
      entry_date: note.entry_date ?? getDayKey(note.created_at),
      felt_then: note.felt_then ?? '',
      understand_now: note.understand_now ?? '',
      reaction: note.reaction ?? '',
      is_encrypted: note.is_encrypted ?? false,
      privacy_key: '',
      privacy_hint: note.privacy_hint ?? '',
      is_pinned: note.is_pinned ?? false,
      is_archived: note.is_archived ?? false,
      is_favorite: note.is_favorite,
      }))
      setEditingNoteId(note.id)
      setIsLetterMode(note.pov === 'Letter for Chastine')
      setSelectedNote(null)
      showToast('Editing this note.')
    })
  }

  function cancelEdit() {
    setEditingNoteId('')
    setForm(initialForm)
    setIsLetterMode(false)
    showToast('Edit cancelled.')
  }

  function requestCancelEdit() {
    confirmDiscard(cancelEdit)
  }

  async function confirmArchiveNote() {
    if (!pendingDeleteNote) {
      return
    }
    try {
      const archivedNote = await updateNote(
        pendingDeleteNote.id,
        toNoteInput(pendingDeleteNote, { is_archived: true, is_pinned: false }),
      )
      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === pendingDeleteNote.id ? archivedNote : currentNote,
        ),
      )
      setSelectedNote(null)
      if (editingNoteId === pendingDeleteNote.id) {
        cancelEdit()
      }
      setPendingDeleteNote(null)
      showToast('Archived.')
    } catch {
      showToast('Could not archive yet. Check your Supabase policy setup.')
    }
  }

  async function restoreNote(note: Note) {
    try {
      const restoredNote = await updateNote(note.id, toNoteInput(note, { is_archived: false }))
      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === note.id ? restoredNote : currentNote,
        ),
      )
      showToast('Restored.')
    } catch {
      showToast('Could not restore yet.')
    }
  }

  async function togglePinnedNote(note: Note) {
    try {
      if (note.is_pinned) {
        const updatedNote = await updateNote(note.id, toNoteInput(note, { is_pinned: false }))
        setNotes((currentNotes) =>
          currentNotes.map((currentNote) =>
            currentNote.id === note.id ? updatedNote : currentNote,
          ),
        )
        setSelectedNote((currentNote) =>
          currentNote?.id === note.id ? updatedNote : currentNote,
        )
        showToast('Unpinned.')
        return
      }

      const updatedNote = await updateNote(note.id, toNoteInput(note, { is_pinned: true }))
      const notesToUnpin = notes.filter(
        (currentNote) => currentNote.id !== note.id && currentNote.is_pinned,
      )
      await Promise.all(
        notesToUnpin.map((currentNote) =>
          updateNote(currentNote.id, toNoteInput(currentNote, { is_pinned: false })),
        ),
      )
      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === note.id
            ? updatedNote
            : { ...currentNote, is_pinned: false },
        ),
      )
      setSelectedNote((currentNote) => (currentNote?.id === note.id ? updatedNote : currentNote))
      showToast('Pinned to the top.')
    } catch {
      showToast('Could not pin yet. Check your Supabase policy setup.')
    }
  }

  async function setReaction(note: Note, reaction: string) {
    const nextReaction = note.reaction === reaction ? '' : reaction

    try {
      const updatedNote = await updateNote(note.id, toNoteInput(note, { reaction: nextReaction }))
      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === note.id ? updatedNote : currentNote,
        ),
      )
      setSelectedNote((currentNote) =>
        currentNote?.id === note.id ? updatedNote : currentNote,
      )
      showToast(nextReaction ? 'Reaction saved.' : 'Reaction cleared.')
    } catch {
      showToast('Could not save reaction yet.')
    }
  }

  function openAdjacentNote(direction: 'previous' | 'next') {
    if (selectedNoteIndex < 0) {
      return
    }

    const nextIndex = direction === 'previous' ? selectedNoteIndex - 1 : selectedNoteIndex + 1
    const nextNote = notes[nextIndex]

    if (nextNote) {
      setSelectedNote(nextNote)
    }
  }

  function handleReaderScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget
    const scrollable = target.scrollHeight - target.clientHeight
    setReaderProgress(scrollable <= 0 ? 100 : (target.scrollTop / scrollable) * 100)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      showToast('Add a title and a note before saving.')
      return
    }

    setIsSaving(true)
    setStatus('')

    try {
      const preparedBody =
        isLetterMode && !/^dear chastine,/i.test(form.body.trim())
          ? `Dear Chastine,\n\n${form.body.trim()}\n\n- Primo`
          : form.body.trim()
      const preparedPhotos = form.photo_urls
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean)
        .join('\n')
      const primaryImage = form.image_url.trim() || preparedPhotos.split('\n')[0] || usCardImage
      const existingNote = editingNoteId
        ? notes.find((note) => note.id === editingNoteId)
        : null
      const nextPrivacyHash = form.privacy_key.trim()
        ? await createPrivacyHash(form.privacy_key.trim())
        : existingNote?.privacy_hash ?? ''
      const noteInput = {
        title: form.title.trim(),
        body: preparedBody,
        mood: form.mood,
        healing_status: form.healing_status,
        location: form.location.trim(),
        photo_urls: preparedPhotos,
        audio_url: form.audio_url.trim(),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(', '),
        felt_then: form.felt_then.trim(),
        understand_now: form.understand_now.trim(),
        reaction: form.reaction,
        is_encrypted: false,
        privacy_hash: nextPrivacyHash,
        privacy_hint: form.privacy_hint.trim(),
        is_pinned: form.is_pinned,
        is_archived: form.is_archived,
        is_favorite: form.is_favorite,
        entry_date: form.entry_date,
        pov: isLetterMode ? 'Letter for Chastine' : form.pov,
        image_url: primaryImage,
      }
      const savedNote = editingNoteId
        ? await updateNote(editingNoteId, noteInput)
        : await createNote(noteInput)
      if (savedNote.is_pinned) {
        await Promise.all(
          notes
            .filter((note) => note.id !== savedNote.id && note.is_pinned)
            .map((note) => updateNote(note.id, toNoteInput(note, { is_pinned: false }))),
        )
      }
      setNotes((currentNotes) =>
        editingNoteId
          ? currentNotes.map((note) =>
              note.id === editingNoteId
                ? savedNote
                : savedNote.is_pinned
                  ? { ...note, is_pinned: false }
                  : note,
            )
          : [
              savedNote,
              ...currentNotes.map((note) =>
                savedNote.is_pinned ? { ...note, is_pinned: false } : note,
              ),
            ],
      )
      setSelectedNote(savedNote)
      if (savedNote.privacy_hash && form.privacy_key.trim()) {
        setUnlockedNotes((currentNotes) => ({ ...currentNotes, [savedNote.id]: true }))
      }
      setForm(initialForm)
      setEditingNoteId('')
      setIsLetterMode(false)
      showToast(editingNoteId ? 'Updated.' : 'Saved. Nasa timeline na siya.')
    } catch {
      showToast('Could not save yet. Check your Supabase keys and table setup.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <Moon aria-hidden="true" size={16} />
            Thoughts, POVs, and quiet things for Chastine
          </p>
          <h1 id="page-title">For the moments I still want to hold gently.</h1>
          <p className="hero-text">
            A private space for the thoughts I do not want to lose: the heavy nights,
            soft mornings, small signs of hope, and everything I am still learning with her.
          </p>
          <div className="hero-actions" aria-label="Journal stats">
            <span>
              <BookOpen aria-hidden="true" size={17} />
              {notes.length} entries
            </span>
            <span>
              <Star aria-hidden="true" size={17} />
              {favoriteCount} marked
            </span>
            <button type="button" onClick={useSampleReflection}>
              <Sparkles aria-hidden="true" size={17} />
              Use sample
            </button>
            <button type="button" onClick={openRandomMemory}>
              <Shuffle aria-hidden="true" size={17} />
              Random memory
            </button>
            <button
              data-tour="guide"
              type="button"
              onClick={() => {
                localStorage.setItem(tutorialSeenStorageKey, 'true')
                setTutorialStep(0)
              }}
            >
              <Sparkles aria-hidden="true" size={17} />
              Guide me
            </button>
            <button type="button" onClick={cycleTheme}>
              <Palette aria-hidden="true" size={17} />
              {theme}
            </button>
            <button type="button" onClick={() => void exportPdf()}>
              <Download aria-hidden="true" size={17} />
              Export PDF
            </button>
            <button type="button" onClick={exportBackup}>
              <Download aria-hidden="true" size={17} />
              Backup
            </button>
            <label className="import-button">
              <input accept="application/json" onChange={(event) => void importBackup(event)} type="file" />
              <Download aria-hidden="true" size={17} />
              Import
            </label>
          </div>
          <div className="writing-nudges" aria-label="Writing nudges">
            {writingNudges.map((nudge) => (
              <button key={nudge} onClick={() => addWritingNudge(nudge)} type="button">
                <Wand2 aria-hidden="true" size={15} />
                {nudge}
              </button>
            ))}
          </div>
          <div className="template-row" aria-label="Note templates">
            {noteTemplates.map((template) => (
              <button key={template.label} onClick={() => applyTemplate(template)} type="button">
                <Wand2 aria-hidden="true" size={15} />
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <div className="portrait-stage" aria-label="Photo of us">
          <img
            src={usImage}
            alt="Primo and Chastine in graduation clothes"
            onError={handleImageFallback}
          />
          <div className="memory-strip">
            <span>Our photo</span>
            <strong>{latestNote ? latestNote.title : 'Waiting for the first note'}</strong>
          </div>
        </div>
      </section>

      <section className="feature-note" aria-label="Featured reflection">
        <div>
          <p className="eyebrow compact">
            <Heart aria-hidden="true" size={15} />
            Current reflection
          </p>
          <h2>{latestNote?.title}</h2>
        </div>
        <button type="button" onClick={() => latestNote && setSelectedNote(latestNote)}>
          <BookOpen aria-hidden="true" size={18} />
          Read full note
        </button>
          <p>{latestNote ? getReadableBody(latestNote) : ''}</p>
      </section>

      {pinnedNote && (
        <section className="pinned-note" aria-label="Pinned note">
          <div>
            <p className="eyebrow compact">
              <Star aria-hidden="true" size={15} />
              Pinned reflection
            </p>
            <h2>{pinnedNote.title}</h2>
            <p>{getReadableBody(pinnedNote)}</p>
          </div>
          <div className="pinned-actions">
            <button type="button" onClick={() => setSelectedNote(pinnedNote)}>
              <BookOpen aria-hidden="true" size={17} />
              Read
            </button>
            <button type="button" onClick={() => void togglePinnedNote(pinnedNote)}>
              <X aria-hidden="true" size={17} />
              Unpin
            </button>
          </div>
        </section>
      )}

      <section className="workspace" aria-label="Relationship journal workspace">
        <form className="composer" data-tour="compose" onSubmit={handleSubmit}>
          <div className="section-heading">
            <span className="icon-box">
              {isLetterMode ? (
                <Mail aria-hidden="true" size={18} />
              ) : (
                <Plus aria-hidden="true" size={18} />
              )}
            </span>
            <div>
              <h2>{isLetterMode ? 'Write a letter' : 'Add a note'}</h2>
              <p>
                {isLetterMode
                  ? 'Say it like a private letter you may or may not send.'
                  : 'Write it the way it really sounded in your head.'}
              </p>
            </div>
          </div>

          {editingNoteId && (
            <div className="edit-banner">
              <span>Editing saved note</span>
              <button onClick={requestCancelEdit} type="button">
                Cancel
              </button>
            </div>
          )}

          <label className="mode-toggle">
            <input
              checked={isLetterMode}
              onChange={(event) => setIsLetterMode(event.target.checked)}
              type="checkbox"
            />
            <span>
              <Mail aria-hidden="true" size={17} />
              Private letter mode
            </span>
          </label>

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder={
                isLetterMode
                  ? 'Example: Things I wish I could tell you'
                  : 'Example: I missed sleeping beside her'
              }
            />
          </label>

          <label>
            Note
            <textarea
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              placeholder={
                isLetterMode
                  ? 'Start with what you want Chastine to know...'
                  : 'Taglish, messy, honest, soft... write it here.'
              }
              rows={9}
            />
          </label>

          <div className="form-pulse" aria-label="Writing progress">
            <span style={{ width: `${Math.min(100, form.body.length / 8)}%` }} />
          </div>
          <div className="composer-meta" aria-label="Draft details">
            <span>{form.body.trim() ? form.body.trim().split(/\s+/).length : 0} words</span>
            <span>{getReadingMinutes(form.body || 'draft')} min read</span>
          </div>

          <div className="field-grid">
            <label>
              Mood
              <select
                value={form.mood}
                onChange={(event) => setForm({ ...form, mood: event.target.value })}
              >
                {moods.map((mood) => (
                  <option key={mood}>{mood}</option>
                ))}
              </select>
            </label>
            <label>
              Healing
              <select
                value={form.healing_status}
                onChange={(event) => setForm({ ...form, healing_status: event.target.value })}
              >
                {healingStatuses.map((statusOption) => (
                  <option key={statusOption}>{statusOption}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label>
              POV
              <select
                value={form.pov}
                onChange={(event) => setForm({ ...form, pov: event.target.value })}
              >
                <option>My POV</option>
                <option>What happened</option>
                <option>For Chastine</option>
                <option>Something I am processing</option>
              </select>
            </label>
            <label>
              Location
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Our room, outside, chat, etc."
              />
            </label>
            <label>
              Memory date
              <input
                onChange={(event) => setForm({ ...form, entry_date: event.target.value })}
                type="date"
                value={form.entry_date}
              />
            </label>
          </div>

          <label>
            What I felt then
            <textarea
              value={form.felt_then}
              onChange={(event) => setForm({ ...form, felt_then: event.target.value })}
              placeholder="What was true in the moment?"
              rows={3}
            />
          </label>

          <label>
            What I understand now
            <textarea
              value={form.understand_now}
              onChange={(event) => setForm({ ...form, understand_now: event.target.value })}
              placeholder="What makes more sense now?"
              rows={3}
            />
          </label>

          <label>
            Tags
            <input
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              placeholder="distance, hope, conflict, soft moment"
              value={form.tags}
            />
          </label>

          <div className="field-grid">
            <label>
              Cover image URL
              <input
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                placeholder="Blank uses the first gallery photo"
              />
            </label>
            <label>
              Voice note URL
              <input
                value={form.audio_url}
                onChange={(event) => setForm({ ...form, audio_url: event.target.value })}
                placeholder="Audio URL, data:audio URL, or plain Base64"
              />
            </label>
          </div>

          <label>
            More photo URLs
            <textarea
              value={form.photo_urls}
              onChange={(event) => setForm({ ...form, photo_urls: event.target.value })}
              placeholder="One photo URL per line for the reader gallery"
              rows={3}
            />
          </label>

          <label className="favorite-toggle">
            <input
              checked={form.is_favorite}
              onChange={(event) => setForm({ ...form, is_favorite: event.target.checked })}
              type="checkbox"
            />
            <span>
              <Star aria-hidden="true" size={17} />
              Keep this close
            </span>
          </label>

          <label className="favorite-toggle">
            <input
              checked={form.is_pinned}
              onChange={(event) => setForm({ ...form, is_pinned: event.target.checked })}
              type="checkbox"
            />
            <span>
              <Star aria-hidden="true" size={17} />
              Pin this reflection
            </span>
          </label>

          <div className="privacy-note-fields" data-tour="private-note">
            <div className="section-heading">
              <span className="icon-box">
                <Lock aria-hidden="true" size={18} />
              </span>
              <div>
                <h2>Private note lock</h2>
                <p>Lock only this note with a passcode saved as a Supabase hash.</p>
              </div>
            </div>
            <div className="field-grid">
              <label>
                Note passcode
                <input
                  onChange={(event) => setForm({ ...form, privacy_key: event.target.value })}
                  placeholder={editingNoteId ? 'Leave blank to keep current lock' : 'Optional'}
                  type="password"
                  value={form.privacy_key}
                />
              </label>
              <label>
                Hint
                <input
                  onChange={(event) => setForm({ ...form, privacy_hint: event.target.value })}
                  placeholder="A clue only you understand"
                  value={form.privacy_hint}
                />
              </label>
            </div>
          </div>

          <label>
            Soft reaction
            <select
              value={form.reaction}
              onChange={(event) => setForm({ ...form, reaction: event.target.value })}
            >
              <option value="">None</option>
              {softReactions.map((reaction) => (
                <option key={reaction}>{reaction}</option>
              ))}
            </select>
          </label>

          <button className="save-button" disabled={isSaving} type="submit">
            {isSaving ? (
              <Loader2 className="spin" aria-hidden="true" size={18} />
            ) : (
              <Check aria-hidden="true" size={18} />
            )}
            {isSaving ? 'Saving...' : 'Save note'}
          </button>
          {status && <p className="status">{status}</p>}
        </form>

        <section className="timeline" aria-label="Saved notes">
          <section className="privacy-panel" aria-label="Privacy lock">
            <div className="section-heading">
              <span className="icon-box">
                <Lock aria-hidden="true" size={18} />
              </span>
              <div>
                <h2>Note privacy</h2>
                <p>Each locked note asks for its own passcode before it opens.</p>
              </div>
            </div>
            <p className="privacy-copy">
              The app saves a salted verifier in Supabase, not the real passcode. Use
              a different passcode per private note if different people will add entries.
            </p>
          </section>

          <section className="weather-panel" data-tour="weather" aria-label="Relationship weather">
            <div className="section-heading">
              <span className="icon-box">
                <Moon aria-hidden="true" size={18} />
              </span>
              <div>
                <h2>Relationship weather</h2>
                <p>Today feels {relationshipWeather.toLowerCase()}.</p>
              </div>
            </div>
            <div className="weather-options">
              {weatherOptions.map((weather) => (
                <button
                  className={relationshipWeather === weather ? 'active' : ''}
                  key={weather}
                  onClick={() => setRelationshipWeather(weather)}
                  type="button"
                >
                  {weather}
                </button>
              ))}
            </div>
          </section>

          <div className="timeline-toolbar">
            <div className="section-heading">
              <span className="icon-box">
                <CalendarDays aria-hidden="true" size={18} />
              </span>
              <div>
                <h2>Memory timeline</h2>
                <p>{isLoading ? 'Loading notes...' : `${filteredNotes.length} visible notes`}</p>
              </div>
            </div>

            <div className="view-switch" aria-label="Switch view">
              <button
                className={activeView === 'timeline' ? 'active' : ''}
                onClick={() => setActiveView('timeline')}
                type="button"
                title="Timeline"
              >
                <BookOpen aria-hidden="true" size={17} />
              </button>
              <button
                className={activeView === 'gallery' ? 'active' : ''}
                onClick={() => setActiveView('gallery')}
                type="button"
                title="Gallery"
              >
                <Images aria-hidden="true" size={17} />
              </button>
            </div>

            <label className="search-box">
              <Search aria-hidden="true" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes"
              />
            </label>
          </div>

          <div className="lens-tabs" data-tour="filters" aria-label="Filter notes by type">
            <button
              className={showArchived ? 'active' : ''}
              onClick={() => setShowArchived((current) => !current)}
              type="button"
            >
              {showArchived ? 'Archived' : 'Active'}
            </button>
            <button
              disabled={filteredNotes.length === 0}
              onClick={() => setPlaybackIndex(0)}
              type="button"
            >
              <Play aria-hidden="true" size={14} />
              Playback
            </button>
            {lenses.map((lens) => (
              <button
                className={activeLens === lens ? 'active' : ''}
                key={lens}
                onClick={() => setActiveLens(lens)}
                type="button"
              >
                {lens}
              </button>
            ))}
          </div>

          <div className="mood-tabs" aria-label="Filter notes by mood">
            {['All', ...moods].map((mood) => (
              <button
                className={activeMood === mood ? 'active' : ''}
                key={mood}
                onClick={() => setActiveMood(mood)}
                type="button"
              >
                {mood}
              </button>
            ))}
          </div>

          <section className="advanced-filters" aria-label="Advanced filters">
            <div className="dock-heading">
              <div>
                <h3>Advanced filters</h3>
                <p>Combine healing, reaction, tag, and date range</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveHealing('All')
                  setActiveReaction('All')
                  setActiveTag('All')
                  setDateRange({ from: '', to: '' })
                }}
              >
                Reset
              </button>
            </div>
            <div className="advanced-grid">
              <label>
                Healing
                <select value={activeHealing} onChange={(event) => setActiveHealing(event.target.value)}>
                  {['All', ...healingStatuses].map((statusOption) => (
                    <option key={statusOption}>{statusOption}</option>
                  ))}
                </select>
              </label>
              <label>
                Reaction
                <select value={activeReaction} onChange={(event) => setActiveReaction(event.target.value)}>
                  {['All', ...softReactions].map((reaction) => (
                    <option key={reaction}>{reaction}</option>
                  ))}
                </select>
              </label>
              <label>
                Tag
                <select value={activeTag} onChange={(event) => setActiveTag(event.target.value)}>
                  {['All', ...availableTags].map((tag) => (
                    <option key={tag}>{tag}</option>
                  ))}
                </select>
              </label>
              <label>
                From
                <input
                  onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })}
                  type="date"
                  value={dateRange.from}
                />
              </label>
              <label>
                To
                <input
                  onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })}
                  type="date"
                  value={dateRange.to}
                />
              </label>
            </div>
          </section>

          <section className="insight-grid" aria-label="Relationship insights">
            <div className="insight-card">
              <div className="dock-heading">
                <div>
                  <h3>Monthly recap</h3>
                  <p>
                    {new Intl.DateTimeFormat('en', {
                      month: 'long',
                      year: 'numeric',
                    }).format(calendarMonth)}
                  </p>
                </div>
              </div>
              <strong>{monthlyRecap.count} notes</strong>
              <p>
                Most present mood: {monthlyRecap.favoriteMood}. Unsent letters:{' '}
                {monthlyRecap.letters}.
              </p>
              {monthlyRecap.favoriteLine && <blockquote>{monthlyRecap.favoriteLine}</blockquote>}
            </div>

            <div className="insight-card">
              <div className="dock-heading">
                <div>
                  <h3>Healing progress</h3>
                  <p>How the active notes are moving</p>
                </div>
              </div>
              <div className="progress-list">
                {healingProgress.map((item) => (
                  <div key={item.status}>
                    <span>
                      {item.status} <b>{item.count}</b>
                    </span>
                    <i>
                      <em style={{ width: `${item.percent}%` }} />
                    </i>
                  </div>
                ))}
              </div>
            </div>

            <div className="insight-card memory-map">
              <div className="dock-heading">
                <div>
                  <h3>Memory map</h3>
                  <p>Places that keep showing up</p>
                </div>
              </div>
              {locationGroups.length > 0 ? (
                locationGroups.map((group) => (
                  <button
                    key={group.location}
                    onClick={() => {
                      setQuery(group.location)
                      showToast(`Showing memories from ${group.location}.`)
                    }}
                    type="button"
                  >
                    <MapPin aria-hidden="true" size={15} />
                    <span>{group.location}</span>
                    <b>{group.notes.length}</b>
                  </button>
                ))
              ) : (
                <p className="quiet-empty">Add locations to build the map.</p>
              )}
            </div>
          </section>

          <section className="interactive-dock" aria-label="Interactive note tools">
            <div className="mood-calendar" data-tour="calendar">
              <div className="dock-heading">
                <div>
                  <h3>Mood calendar</h3>
                  <p>
                    {activeDate
                      ? new Intl.DateTimeFormat('en', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(`${activeDate}T00:00:00`))
                      : new Intl.DateTimeFormat('en', {
                          month: 'long',
                          year: 'numeric',
                        }).format(calendarMonth)}
                  </p>
                </div>
                <div className="calendar-actions">
                  <button type="button" onClick={() => moveCalendarMonth('previous')}>
                    <ChevronLeft aria-hidden="true" size={15} />
                  </button>
                  <button type="button" onClick={() => moveCalendarMonth('next')}>
                    <ChevronRight aria-hidden="true" size={15} />
                  </button>
                  {activeDate && (
                    <button type="button" onClick={() => setActiveDate('')}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="calendar-weekdays" aria-hidden="true">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarDays.map((day, index) => {
                  const dayKey = day ? getDayKey(day) : `blank-${index}`
                  const dayNotes = day ? notesByDay[dayKey] ?? [] : []
                  const primaryMood = dayNotes[0]?.mood

                  return day ? (
                    <button
                      className={`${activeDate === dayKey ? 'active' : ''} ${dayNotes.length > 0 ? 'has-note' : ''}`}
                      key={dayKey}
                      onClick={() => setActiveDate(activeDate === dayKey ? '' : dayKey)}
                      style={
                        {
                          '--mood-color': primaryMood
                            ? `var(--mood-${primaryMood.toLowerCase().replace(/\s+/g, '-')})`
                            : 'transparent',
                        } as CSSProperties
                      }
                      title={dayNotes.length ? `${dayNotes.length} note${dayNotes.length > 1 ? 's' : ''}` : 'No notes'}
                      type="button"
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={dayKey} />
                  )
                })}
              </div>
            </div>

            <div className="quote-shelf">
              <div className="dock-heading">
                <div>
                  <h3>Lines I keep</h3>
                  <p>Favorite quotes pulled from marked notes</p>
                </div>
              </div>
              {favoriteQuotes.length > 0 ? (
                favoriteQuotes.map(({ id, note, quote }) => (
                  <blockquote key={id}>
                    <Quote aria-hidden="true" size={18} />
                    <p>{quote}</p>
                    <div>
                      <button type="button" onClick={() => setSelectedNote(note)}>
                        Open note
                      </button>
                      <button type="button" onClick={() => copyQuote(id, quote)}>
                        {copiedQuoteId === id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </blockquote>
                ))
              ) : (
                <p className="quiet-empty">Mark notes as favorite to collect lines here.</p>
              )}
            </div>

            <div className="important-dates">
              <div className="dock-heading">
                <div>
                  <h3>Important dates</h3>
                  <p>Anniversaries, firsts, soft mornings, hard talks</p>
                </div>
              </div>
              <form className="date-form" onSubmit={addImportantDate}>
                <input
                  onChange={(event) =>
                    setImportantDateForm({ ...importantDateForm, date: event.target.value })
                  }
                  type="date"
                  value={importantDateForm.date}
                />
                <input
                  onChange={(event) =>
                    setImportantDateForm({ ...importantDateForm, label: event.target.value })
                  }
                  placeholder="What happened?"
                  value={importantDateForm.label}
                />
                <button type="submit">Add</button>
              </form>
              <div className="date-list">
                {importantDates.length > 0 ? (
                  importantDates.map((dateItem) => (
                    <article key={dateItem.id}>
                      <time dateTime={dateItem.date}>
                        {new Intl.DateTimeFormat('en', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(`${dateItem.date}T00:00:00`))}
                      </time>
                      <span>{dateItem.label}</span>
                      <button onClick={() => removeImportantDate(dateItem.id)} type="button">
                        <X aria-hidden="true" size={14} />
                      </button>
                    </article>
                  ))
                ) : (
                  <p className="quiet-empty">No important dates yet.</p>
                )}
              </div>
            </div>
          </section>

          <div className={activeView === 'gallery' ? 'gallery-list' : 'notes-list'}>
            {filteredNotes.map((note) => (
              <article
                className={activeView === 'gallery' ? 'gallery-card' : 'note-card'}
                key={note.id}
                onClick={() => setSelectedNote(note)}
              >
                <img
                  src={getPrimaryPhoto(note)}
                  alt=""
                  loading="lazy"
                  onError={handleImageFallback}
                />
                <div className="note-content">
                  <div className="note-meta">
                    {note.privacy_hash && (
                      <span>
                        <Lock aria-hidden="true" size={14} />
                        Private
                      </span>
                    )}
                    {isEncryptedNote(note) && (
                      <span>
                        <Lock aria-hidden="true" size={14} />
                        Encrypted
                      </span>
                    )}
                    {note.is_pinned && (
                      <span>
                        <Star aria-hidden="true" size={14} />
                        Pinned
                      </span>
                    )}
                    <span>{note.mood}</span>
                    {note.healing_status && <span>{note.healing_status}</span>}
                    {note.reaction && <span>{note.reaction}</span>}
                    {note.tags &&
                      note.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((tag) => <span key={tag}>{tag}</span>)}
                    {note.is_favorite && (
                      <span>
                        <Star aria-hidden="true" size={14} />
                        Favorite
                      </span>
                    )}
                  </div>
                  <h3>{highlightMatches(note.title)}</h3>
                  <p>{highlightMatches(getReadableBody(note))}</p>
                  <div className="card-actions">
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        editNote(note)
                      }}
                      type="button"
                    >
                      <Edit3 aria-hidden="true" size={14} />
                      Edit
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        void togglePinnedNote(note)
                      }}
                      type="button"
                    >
                      <Star aria-hidden="true" size={14} />
                      {note.is_pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        if (note.is_archived) {
                          void restoreNote(note)
                        } else {
                          setPendingDeleteNote(note)
                        }
                      }}
                      type="button"
                    >
                      {note.is_archived ? (
                        <RotateCcw aria-hidden="true" size={14} />
                      ) : (
                        <Trash2 aria-hidden="true" size={14} />
                      )}
                      {note.is_archived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                  <footer>
                    <span>
                      <Camera aria-hidden="true" size={15} />
                      {note.pov}
                    </span>
                    {note.location && (
                      <span>
                        <MapPin aria-hidden="true" size={15} />
                        {note.location}
                      </span>
                    )}
                    <time dateTime={note.created_at}>
                      {getReadingMinutes(getReadableBody(note))} min read
                    </time>
                  </footer>
                </div>
              </article>
            ))}
            {filteredNotes.length === 0 && (
              <div className="empty-state">
                <Sparkles aria-hidden="true" size={20} />
                <p>No notes match this view yet.</p>
              </div>
            )}
          </div>
        </section>
      </section>

      {selectedNote && (
        <div className="reader-backdrop" role="presentation" onClick={() => setSelectedNote(null)}>
          <article className="reader-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="reader-progress" aria-hidden="true">
              <span style={{ width: `${readerProgress}%` }} />
            </div>
            <button
              className="close-reader"
              onClick={() => setSelectedNote(null)}
              type="button"
              title="Close"
            >
              <X aria-hidden="true" size={20} />
            </button>
            <div className="reader-image-frame">
              {isNoteLocked(selectedNote) ? (
                <div className="private-photo-placeholder">
                  <Lock aria-hidden="true" size={28} />
                  <span>Private photo</span>
                </div>
              ) : (
                <button
                  className="image-lightbox-trigger"
                  onClick={() => setLightboxImage(getPrimaryPhoto(selectedNote))}
                  type="button"
                >
                  <img src={getPrimaryPhoto(selectedNote)} alt="" onError={handleImageFallback} />
                  <span>
                    <Maximize2 aria-hidden="true" size={16} />
                    View photo
                  </span>
                </button>
              )}
            </div>
            <div className="reader-body" onScroll={handleReaderScroll}>
              <div className="note-meta">
                {selectedNote.privacy_hash && (
                  <span>
                    <Lock aria-hidden="true" size={14} />
                    Private
                  </span>
                )}
                {isEncryptedNote(selectedNote) && (
                  <span>
                    <Lock aria-hidden="true" size={14} />
                    Encrypted
                  </span>
                )}
                {selectedNote.is_pinned && (
                  <span>
                    <Star aria-hidden="true" size={14} />
                    Pinned
                  </span>
                )}
                <span>{selectedNote.mood}</span>
                {selectedNote.healing_status && <span>{selectedNote.healing_status}</span>}
                {selectedNote.reaction && <span>{selectedNote.reaction}</span>}
                {selectedNote.tags &&
                  selectedNote.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((tag) => <span key={tag}>{tag}</span>)}
                <span>{getReadingMinutes(getReadableBody(selectedNote))} min read</span>
              </div>
              <h2>{selectedNote.title}</h2>
              {isNoteLocked(selectedNote) && (
                <form
                  className="note-unlock-panel"
                  onSubmit={(event) => void unlockPrivateNote(selectedNote, event)}
                >
                  <span className="icon-box">
                    <Lock aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h3>This note is private</h3>
                    <p>
                      {selectedNote.privacy_hint
                        ? `Hint: ${selectedNote.privacy_hint}`
                        : 'Enter the passcode saved for this note.'}
                    </p>
                  </div>
                  <input
                    autoFocus
                    onChange={(event) =>
                      setNotePasscodes({
                        ...notePasscodes,
                        [selectedNote.id]: event.target.value,
                      })
                    }
                    placeholder="Note passcode"
                    type="password"
                    value={notePasscodes[selectedNote.id] ?? ''}
                  />
                  <button type="submit">
                    <Unlock aria-hidden="true" size={17} />
                    Unlock note
                  </button>
                </form>
              )}
              <div className="reader-actions" aria-label="Reader navigation">
                <button
                  disabled={selectedNoteIndex <= 0}
                  onClick={() => openAdjacentNote('previous')}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={17} />
                  Previous
                </button>
                <button
                  disabled={selectedNoteIndex === -1 || selectedNoteIndex >= notes.length - 1}
                  onClick={() => openAdjacentNote('next')}
                  type="button"
                >
                  Next
                  <ChevronRight aria-hidden="true" size={17} />
                </button>
                <button disabled={isNoteLocked(selectedNote)} onClick={() => editNote(selectedNote)} type="button">
                  <Edit3 aria-hidden="true" size={17} />
                  Edit
                </button>
                {selectedNote.privacy_hash && !isNoteLocked(selectedNote) && (
                  <button onClick={() => lockPrivateNote(selectedNote)} type="button">
                    <Lock aria-hidden="true" size={17} />
                    Lock note
                  </button>
                )}
                <button onClick={() => void togglePinnedNote(selectedNote)} type="button">
                  <Star aria-hidden="true" size={17} />
                  {selectedNote.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() =>
                    selectedNote.is_archived
                      ? void restoreNote(selectedNote)
                      : setPendingDeleteNote(selectedNote)
                  }
                  type="button"
                >
                  {selectedNote.is_archived ? (
                    <RotateCcw aria-hidden="true" size={17} />
                  ) : (
                    <Trash2 aria-hidden="true" size={17} />
                  )}
                  {selectedNote.is_archived ? 'Restore' : 'Archive'}
                </button>
              </div>
              {selectedNote.privacy_hash && !isNoteLocked(selectedNote) && (
                <form
                  className="note-unlock-panel remove-lock-panel"
                  onSubmit={(event) => void removePrivateNoteLock(selectedNote, event)}
                >
                  <span className="icon-box">
                    <Unlock aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h3>Remove note lock</h3>
                    <p>Enter the current note passcode to remove this lock from Supabase.</p>
                  </div>
                  <input
                    onChange={(event) =>
                      setRemoveLockPasscodes({
                        ...removeLockPasscodes,
                        [selectedNote.id]: event.target.value,
                      })
                    }
                    placeholder="Current note passcode"
                    type="password"
                    value={removeLockPasscodes[selectedNote.id] ?? ''}
                  />
                  <button type="submit">
                    <Unlock aria-hidden="true" size={17} />
                    Remove lock
                  </button>
                </form>
              )}
              {!isNoteLocked(selectedNote) && isEncryptedNote(selectedNote) && (
                <form
                  className="note-unlock-panel legacy-key-panel"
                  onSubmit={(event) => void removeLegacyOriginalKey(selectedNote, event)}
                >
                  <span className="icon-box">
                    <Unlock aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h3>Remove old original key</h3>
                    <p>
                      {legacyDecryptedBodies[selectedNote.id]
                        ? 'This note can be converted now. After this, it will use only the note lock passcode.'
                        : "This note was saved with the older two-key setup. Enter the old original key once, then it will use only this note's lock passcode."}
                    </p>
                  </div>
                  {!legacyDecryptedBodies[selectedNote.id] && (
                    <input
                      onChange={(event) =>
                        setLegacyOriginalKeys({
                          ...legacyOriginalKeys,
                          [selectedNote.id]: event.target.value,
                        })
                      }
                      placeholder="Old original key"
                      type="password"
                      value={legacyOriginalKeys[selectedNote.id] ?? ''}
                    />
                  )}
                  <button type="submit">
                    <Unlock aria-hidden="true" size={17} />
                    Remove original key
                  </button>
                </form>
              )}
              {!isNoteLocked(selectedNote) && (
              <div className="reaction-row" aria-label="Soft reactions">
                {softReactions.map((reaction) => (
                  <button
                    className={selectedNote.reaction === reaction ? 'active' : ''}
                    key={reaction}
                    onClick={() => void setReaction(selectedNote, reaction)}
                    type="button"
                  >
                    {reaction}
                  </button>
                ))}
              </div>
              )}
              {!isNoteLocked(selectedNote) && (selectedNote.felt_then || selectedNote.understand_now) && (
                <div className="reflection-pair">
                  {selectedNote.felt_then && (
                    <section>
                      <h3>What I felt then</h3>
                      <p>{selectedNote.felt_then}</p>
                    </section>
                  )}
                  {selectedNote.understand_now && (
                    <section>
                      <h3>What I understand now</h3>
                      <p>{selectedNote.understand_now}</p>
                    </section>
                  )}
                </div>
              )}
              {!isNoteLocked(selectedNote) && selectedNote.audio_url && (
                <div className="audio-note">
                  <span>
                    <Mic aria-hidden="true" size={16} />
                    Voice note
                  </span>
                  <audio controls src={getDisplayAudio(selectedNote.audio_url)} />
                </div>
              )}
              {!isNoteLocked(selectedNote) && getPhotoUrls(selectedNote).length > 1 && (
                <div className="reader-gallery" aria-label="More photos">
                  {getPhotoUrls(selectedNote).map((photoUrl) => (
                    <button
                      key={photoUrl}
                      onClick={() => setLightboxImage(getDisplayPhoto(photoUrl))}
                      type="button"
                    >
                      <img
                        src={getDisplayPhoto(photoUrl)}
                        alt=""
                        loading="lazy"
                        onError={handleImageFallback}
                      />
                    </button>
                  ))}
                </div>
              )}
              {!isNoteLocked(selectedNote) && (
              <div className="reader-text">
                {getReadableBody(selectedNote).split('\n\n').map((paragraph) =>
                  paragraph.trim().startsWith('>') ? (
                    <blockquote key={paragraph}>
                      {renderInlineMarkdown(paragraph.replace(/^>\s?/, ''))}
                    </blockquote>
                  ) : (
                    <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
                  ),
                )}
              </div>
              )}
            </div>
          </article>
        </div>
      )}

      {playbackNote && (
        <div className="playback-backdrop" role="presentation" onClick={() => setPlaybackIndex(null)}>
          <section
            className="playback-panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="close-reader" onClick={() => setPlaybackIndex(null)} type="button">
              <X aria-hidden="true" size={20} />
            </button>
            <img src={getPrimaryPhoto(playbackNote)} alt="" onError={handleImageFallback} />
            <div>
              <p className="eyebrow compact">
                {playbackPosition + 1} of {filteredNotes.length}
              </p>
              <h2>{playbackNote.title}</h2>
              <p>{getReadableBody(playbackNote)}</p>
              <div className="reader-actions">
                <button
                  disabled={playbackPosition <= 0}
                  onClick={() => setPlaybackIndex((current) => Math.max(0, (current ?? 0) - 1))}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={17} />
                  Previous
                </button>
                <button
                  disabled={playbackPosition >= filteredNotes.length - 1}
                  onClick={() =>
                    setPlaybackIndex((current) =>
                      Math.min(filteredNotes.length - 1, (current ?? 0) + 1),
                    )
                  }
                  type="button"
                >
                  Next
                  <ChevronRight aria-hidden="true" size={17} />
                </button>
                <button onClick={() => setSelectedNote(playbackNote)} type="button">
                  <BookOpen aria-hidden="true" size={17} />
                  Full note
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {lightboxImage && (
        <div className="lightbox-backdrop" role="presentation" onClick={() => setLightboxImage('')}>
          <button className="close-reader" onClick={() => setLightboxImage('')} type="button">
            <X aria-hidden="true" size={20} />
          </button>
          <img src={getDisplayPhoto(lightboxImage)} alt="" onError={handleImageFallback} />
        </div>
      )}

      {tutorialStep !== null && (
        <div className="tutorial-layer" role="presentation">
          <div className="tutorial-scrim" onClick={() => setTutorialStep(null)} />
          {tutorialPosition && (
            <svg
              className="tutorial-arrow"
              height="100%"
              viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
              width="100%"
              aria-hidden="true"
            >
              <path
                d={`M ${tutorialPosition.cardLeft + 28} ${tutorialPosition.cardTop + 34} Q ${
                  (tutorialPosition.cardLeft + tutorialPosition.arrowLeft) / 2
                } ${tutorialPosition.cardTop - 8} ${tutorialPosition.arrowLeft} ${tutorialPosition.arrowTop}`}
              />
              <circle cx={tutorialPosition.arrowLeft} cy={tutorialPosition.arrowTop} r="5" />
            </svg>
          )}
          <section
            className="tutorial-card"
            style={
              tutorialPosition && !tutorialPosition.isSmallScreen
                ? {
                    left: tutorialPosition.cardLeft,
                    top: tutorialPosition.cardTop,
                  }
                : undefined
            }
            aria-live="polite"
          >
            <div>
              <span>
                Step {tutorialStep + 1} of {tutorialSteps.length}
              </span>
              <h2>{tutorialSteps[tutorialStep].title}</h2>
              <p>{tutorialSteps[tutorialStep].body}</p>
            </div>
            <div className="tutorial-progress" aria-hidden="true">
              {tutorialSteps.map((step, index) => (
                <i className={index === tutorialStep ? 'active' : ''} key={step.target} />
              ))}
            </div>
            <div className="reader-actions">
              <button
                disabled={tutorialStep <= 0}
                onClick={() =>
                  setTutorialStep((currentStep) => Math.max(0, (currentStep ?? 0) - 1))
                }
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={17} />
                Back
              </button>
              <button
                onClick={() =>
                  setTutorialStep((currentStep) =>
                    currentStep === null || currentStep >= tutorialSteps.length - 1
                      ? null
                      : currentStep + 1,
                  )
                }
                type="button"
              >
                {tutorialStep >= tutorialSteps.length - 1 ? 'Done' : 'Next'}
                {tutorialStep < tutorialSteps.length - 1 && (
                  <ChevronRight aria-hidden="true" size={17} />
                )}
              </button>
              <button onClick={() => setTutorialStep(null)} type="button">
                <X aria-hidden="true" size={17} />
                Skip
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingDiscardAction && (
        <div className="confirm-backdrop" role="presentation" onClick={() => setPendingDiscardAction(null)}>
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="icon-box">
              <Edit3 aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 id="discard-title">Discard unsaved changes?</h2>
              <p>Your edited draft has changes that are not saved yet.</p>
            </div>
            <div className="confirm-actions">
              <button type="button" onClick={() => setPendingDiscardAction(null)}>
                Keep editing
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => {
                  pendingDiscardAction()
                  setPendingDiscardAction(null)
                }}
              >
                Discard
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingDeleteNote && (
        <div className="confirm-backdrop" role="presentation" onClick={() => setPendingDeleteNote(null)}>
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="icon-box">
              <Trash2 aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 id="archive-title">Archive this note?</h2>
              <p>{pendingDeleteNote.title}</p>
            </div>
            <div className="confirm-actions">
              <button type="button" onClick={() => setPendingDeleteNote(null)}>
                Cancel
              </button>
              <button className="danger" type="button" onClick={() => void confirmArchiveNote()}>
                Archive
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="toast-stack" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <p key={toast.id}>{toast.message}</p>
        ))}
      </div>
    </main>
  )
}

export default App
