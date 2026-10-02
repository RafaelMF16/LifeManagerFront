import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './auth/pages/AuthPage'
import FinanceLayout from './finance/components/FinanceLayout/FinanceLayout'
import CategoriesPage from './finance/pages/CategoriesPage'
import MonthDetailsPage from './finance/pages/MonthDetailsPage'
import MonthsPage from './finance/pages/MonthsPage'
import HomePage from './home/pages/HomePage'
import { ErrorModalProvider } from './shared/components/ErrorModal/ErrorModalProvider'
import { ToastProvider } from './shared/components/Toast/ToastProvider'
import { useSessionExpiredRedirect } from './shared/hooks/useSessionExpiredRedirect'

// Renders nothing: it only hosts the hook, which needs the router context.
function SessionExpiredListener() {
  useSessionExpiredRedirect()
  return null
}

function App() {
  return (
    <ToastProvider>
      <ErrorModalProvider>
        <BrowserRouter>
          <SessionExpiredListener />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/finance" element={<FinanceLayout />}>
              <Route index element={<Navigate to="months" replace />} />
              <Route path="months" element={<MonthsPage />} />
              <Route path="months/:monthlySummaryId" element={<MonthDetailsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorModalProvider>
    </ToastProvider>
  )
}

export default App
