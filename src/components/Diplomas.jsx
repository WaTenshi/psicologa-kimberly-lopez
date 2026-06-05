import { useState, useEffect } from 'react'
import { Award, X } from 'lucide-react'
import '../styles/Diplomas.css'

import certificado1 from '../assets/certificado1.jpg'
import certificado2 from '../assets/certificado2.jpg'
import certificado3 from '../assets/certificado3.jpg'
import certificado4 from '../assets/certificado4.jpg'

export default function Diplomas() {
  const [selectedDiploma, setSelectedDiploma] = useState(null)
  const [isClosing, setIsClosing] = useState(false)

  const diplomas = [
    {
      id: 1,
      title: 'Psicología Clínica',
      institution: 'Universidad Academia Humanismo Cristiano',
      year: '2022',
      image: certificado1,
      description:
        'Título profesional en Psicología Clínica con enfoque en salud mental y acompañamiento terapéutico.',
    },
    {
      id: 2,
      title: 'Especialización en Terapia Cognitivo-Conductual',
      institution: 'Centro de Especialización Clínica',
      year: '2023',
      image: certificado2,
      description:
        'Formación avanzada en técnicas de Terapia Cognitivo-Conductual aplicadas a adultos y adolescentes.',
    },
    {
      id: 3,
      title: 'Certificación en Regulación Emocional',
      institution: 'Instituto de Salud Mental',
      year: '2024',
      image: certificado3,
      description:
        'Capacitación enfocada en estrategias de regulación emocional y bienestar psicológico.',
    },
    {
      id: 4,
      title: 'Intervención en Ansiedad y Estrés',
      institution: 'Academia Profesional',
      year: '2024',
      image: certificado4,
      description:
        'Certificación especializada en manejo clínico de ansiedad, estrés y crisis emocionales.',
    },
  ]

  const openModal = (diploma) => {
    setSelectedDiploma(diploma)
  }

  const closeModal = () => {
    setIsClosing(true)

    setTimeout(() => {
      setSelectedDiploma(null)
      setIsClosing(false)
    }, 300)
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedDiploma])

  useEffect(() => {
    document.body.style.overflow = selectedDiploma ? 'hidden' : 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [selectedDiploma])

  return (
    <section id="diplomas" className="diplomas">
      <div className="diplomas-container">
        <div className="section-heading">
          <span>Credenciales</span>
          <h2>Formación que respalda la práctica clínica</h2>
          <p>
            Puedes revisar parte de mi formación y solicitar los certificados
            originales durante la atención presencial.
          </p>
        </div>

        <div className="diplomas-grid">
          {diplomas.map((diploma) => (
            <button
              key={diploma.id}
              className="diploma-card"
              onClick={() => openModal(diploma)}
            >
              <div className="diploma-preview">
                <img
                  src={diploma.image}
                  alt={diploma.title}
                  className="diploma-image"
                />
              </div>

              <div className="diploma-content">
                <Award size={21} />
                <h3>{diploma.title}</h3>

                <p className="diploma-institution">
                  {diploma.institution}
                </p>

                <p className="diploma-year">{diploma.year}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="diplomas-note">
          <p>
            Los certificados originales están disponibles en el consultorio.
            Puedes solicitarlos cuando agendes tu primera cita.
          </p>
        </div>
      </div>

{selectedDiploma && (
  <div
    className={`diploma-modal-overlay ${isClosing ? 'closing' : ''}`}
    onClick={closeModal}
  >
    <div
      className={`diploma-modal-content ${isClosing ? 'closing' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="diploma-modal-close" onClick={closeModal} aria-label="Cerrar certificado">
        <X size={20} />
      </button>
      <img
        src={selectedDiploma.image}
        alt={selectedDiploma.title}
        className="diploma-modal-image"
      />
    </div>
  </div>
)}
    </section>
  )
}
