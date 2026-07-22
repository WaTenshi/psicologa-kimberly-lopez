import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, addDoc, query, orderBy } from 'firebase/firestore'
import { MdAdd, MdDelete } from 'react-icons/md'
import { db } from '../config/firebase'
import { EmptyState, PageHeader } from './AdminUI'

export default function QuickNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newNote, setNewNote] = useState('')

  const loadNotes = async () => {
    try {
      setLoading(true)
      const notesRef = collection(db, 'quick_notes')
      const q = query(notesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setNotes(data)
      setError('')
    } catch (err) {
      console.error('Error al cargar notas:', err)
      setError('Error al cargar las notas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar notas al montar
  useEffect(() => {
    Promise.resolve().then(loadNotes)
  }, [])

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setError('La nota no puede estar vacía')
      return
    }

    try {
      setLoading(true)
      await addDoc(collection(db, 'quick_notes'), {
        contenido: newNote,
        createdAt: new Date(),
      })
      setNewNote('')
      await loadNotes()
      setError('')
    } catch (err) {
      console.error('Error al guardar nota:', err)
      setError('Error al guardar la nota')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      try {
        setLoading(true)
        await deleteDoc(doc(db, 'quick_notes', noteId))
        await loadNotes()
        setError('')
      } catch (err) {
        console.error('Error al eliminar nota:', err)
        setError('Error al eliminar la nota')
      } finally {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateObj) => {
    if (!dateObj) return ''
    
    // Manejar tanto Timestamp de Firebase como Date
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj)
    
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="quick-notes">
      <PageHeader
        eyebrow="Apuntes administrativos"
        title="Notas rápidas"
        description="Recordatorios breves para tareas, pagos, coordinación y seguimiento."
      />

      {error && <div className="error-banner">{error}</div>}

      <div className="notes-input-container">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota rápida... (Ej: Paciente pidió cambiar hora, Confirmar transferencia, Enviar material)"
          rows="3"
        />
        <div className="notes-input-actions">
          <button 
            className="add-note-btn" 
            onClick={handleAddNote}
            disabled={loading || !newNote.trim()}
          >
            {loading ? 'Guardando...' : <><MdAdd /> Agregar Nota</>}
          </button>
        </div>
      </div>

      <div className="notes-container">
        {loading && notes.length === 0 ? (
          <p className="loading">Cargando notas...</p>
        ) : notes.length === 0 ? (
          <EmptyState title="No hay notas rápidas" description="Escribe una nota para recordar una tarea administrativa." />
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-content">
                  <p>{note.contenido}</p>
                </div>
                <div className="note-footer">
                  <span className="note-date">{formatDate(note.createdAt)}</span>
                  <button
                    className="delete-note-btn"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Eliminar"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
