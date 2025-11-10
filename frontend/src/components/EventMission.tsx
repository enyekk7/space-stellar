import { useNavigate } from 'react-router-dom'
import './EventMission.css'

interface EventMissionProps {
  address?: string
}

const EventMission = ({ address }: EventMissionProps) => {
  const navigate = useNavigate()

  if (!address) {
    return null
  }

  const handleEventClick = () => {
    navigate('/events')
  }

  const handleMissionClick = () => {
    navigate('/missions')
  }

  return (
    <div className="event-mission-buttons">
      <button className="event-btn" onClick={handleEventClick}>
        <div className="event-icon">🎯</div>
        <div className="event-label">EVENT</div>
      </button>
      <button className="mission-btn" onClick={handleMissionClick}>
        <div className="mission-icon">📋</div>
        <div className="mission-label">MISSION</div>
      </button>
    </div>
  )
}

export default EventMission

