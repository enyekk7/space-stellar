import './EditProfileModal.css'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  onUsernameChange: (username: string) => void
  onSave: () => void
  onCancel: () => void
}

const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  username, 
  onUsernameChange, 
  onSave, 
  onCancel 
}: EditProfileModalProps) => {
  if (!isOpen) return null

  const handleSave = () => {
    onSave()
    onClose()
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>EDIT PROFILE</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="edit-modal-body">
          <label className="input-label">USERNAME</label>
          <input
            type="text"
            className="edit-input"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter username"
            maxLength={20}
            autoFocus
          />
          <p className="input-hint">Maximum 20 characters</p>
        </div>
        <div className="edit-modal-footer">
          <button className="edit-btn cancel-btn" onClick={handleCancel}>
            CANCEL
          </button>
          <button className="edit-btn save-btn" onClick={handleSave}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal



