import '../../common/index.css'

import React, { useState } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
}

export default function Dialog({ open, onClose }: DialogProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  if (!open) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-header">
          <div className="dialog-tabs">
            <button
              className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              Terms & Conditions
            </button>
            <button
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy Policy
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-content">
          {activeTab === 'terms' ? (
            <>
              <h2>Terms & Conditions</h2>
              <p>
                Welcome to <strong>BookNest</strong>. By creating an account,
                you agree to comply with our terms of service. You must be at
                least 13 years old to register and use our services responsibly.
              </p>
              <p>
                <strong>BookNest</strong> reserves the right to modify or
                terminate access if any misuse is detected. Please review
                updates regularly.
              </p>
            </>
          ) : (
            <>
              <h2>Privacy Policy</h2>
              <p>
                <strong>BookNest</strong> values your privacy. We collect
                minimal data to enhance your experience — such as your name,
                email, and order history.
              </p>
              <p>
                We do not sell or share your data with third parties. For
                further details, contact privacy@booknest.com.
              </p>
            </>
          )}
        </div>

        <div className="dialog-footer">
          <button className="close-btn-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
