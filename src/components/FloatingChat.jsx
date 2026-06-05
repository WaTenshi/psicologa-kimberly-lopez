import { useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import '../styles/FloatingChat.css'

function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hola 👋 Soy la asistente virtual de Natasha Silva. Puedo ayudarte con información sobre servicios, horarios, atención online y reservas.'
    }
  ])
  const [loading, setLoading] = useState(false)

  const blockedTopics = [
    'suicidio',
    'suicidarme',
    'matarme',
    'quiero morir',
    'autolesión',
    'autolesion',
    'depresión severa',
    'crisis emocional',
    'abuso sexual',
    'violación',
    'violencia intrafamiliar',
    'medicación',
    'medicamentos psiquiátricos',
    'pastillas',
    'ansiolíticos'
  ]

  const faqTopics = [
    'precio',
    'valor',
    'horario',
    'horarios',
    'ubicación',
    'direccion',
    'dirección',
    'online',
    'presencial',
    'reserva',
    'reservar',
    'sesión',
    'sesiones',
    'terapia',
    'ansiedad',
    'estrés',
    'autoestima',
    'consulta',
    'concepción'
  ]

  const sendMessage = () => {
    if (!message.trim() || loading) return

    const lowerMessage = message.toLowerCase()

    // BLOQUEO DE TEMAS SENSIBLES
    const containsBlockedTopic = blockedTopics.some(topic =>
      lowerMessage.includes(topic)
    )

    if (containsBlockedTopic) {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: message
        },
        {
          role: 'assistant',
          content:
            'Lo siento, pero no puedo abordar situaciones clínicas o de crisis. Te recomendamos contactar directamente a Natasha Silva o buscar ayuda profesional inmediata si se trata de una urgencia.'
        }
      ])

      setMessage('')
      return
    }

    // MODO FAQ
    const containsFaqTopic = faqTopics.some(topic =>
      lowerMessage.includes(topic)
    )

    if (!containsFaqTopic && lowerMessage.length > 25) {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: message
        },
        {
          role: 'assistant',
          content:
            'Puedo ayudarte con información sobre servicios, horarios, modalidad online, ubicación y reservas de sesiones 😊'
        }
      ])

      setMessage('')
      return
    }

    const userMessage = {
      role: 'user',
      content: message
    }

    const assistantMessage = {
      role: 'assistant',
      content: getAdministrativeResponse(lowerMessage)
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setMessage('')
    setLoading(false)
  }

  return (
    <>
      <button
        className="chat-floating-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir asistente virtual"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <h3>Asistente Virtual</h3>
              <span>Natasha Silva</span>
            </div>

            <button onClick={() => setIsOpen(false)} aria-label="Cerrar asistente virtual">
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.role}`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                Escribiendo...
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage()
                }
              }}
            />

            <button onClick={sendMessage} aria-label="Enviar mensaje">
              <Send size={18} />
            </button>
          </div>

          <div className="chat-disclaimer">
            La IA puede cometer errores. Si notas alguna incoherencia,
            contacta directamente a Natasha Silva por Instagram o correo.
          </div>
        </div>
      )}
    </>
  )
}

function getAdministrativeResponse(message) {
  if (message.includes('precio') || message.includes('valor')) {
    return 'El valor puede depender de la modalidad y del tipo de atención. Puedes consultarlo directamente o reservar una hora para coordinar.'
  }

  if (message.includes('horario')) {
    return 'La atención es de lunes a viernes entre 9:00 y 19:00, y los sábados entre 10:00 y 18:00.'
  }

  if (message.includes('ubicación') || message.includes('direccion') || message.includes('dirección') || message.includes('concepción')) {
    return 'La consulta está en Barros Arana 645, Galería Banco Español, piso 7 oficina 8, Concepción.'
  }

  if (message.includes('online')) {
    return 'Sí, hay atención online para personas de todo Chile. Puedes seleccionar una hora desde el sistema de reservas.'
  }

  if (message.includes('reserva') || message.includes('reservar') || message.includes('sesión')) {
    return 'Puedes reservar desde el botón “Agendar una sesión”. Allí podrás elegir fecha y horario disponible.'
  }

  return 'Natasha ofrece atención individual para ansiedad, estrés y autoestima, de forma presencial y online. Puedes reservar una sesión desde esta página.'
}

export default FloatingChat
