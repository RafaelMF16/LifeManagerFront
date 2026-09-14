import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './auth/pages/AuthPage'
import HomePage from './home/pages/HomePage'
import { ErrorModalProvider } from './shared/components/ErrorModal/ErrorModalProvider'
import { ToastProvider } from './shared/components/Toast/ToastProvider'

function App() {
  return (
    <ToastProvider>
      <ErrorModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorModalProvider>
    </ToastProvider>
  )
}

export default App
