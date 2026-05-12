import React, { createContext, useContext, useMemo, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const NotificationContext = createContext({ notify: () => {} })

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const notify = (message, severity = 'success') => {
    setToast({ open: true, message, severity })
  }

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return
    setToast((current) => ({ ...current, open: false }))
  }

  const value = useMemo(() => ({ notify }), [])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
