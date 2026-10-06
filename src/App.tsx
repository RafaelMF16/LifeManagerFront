import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './auth/pages/AuthPage'
import FinanceLayout from './finance/components/FinanceLayout/FinanceLayout'
import BudgetsPage from './finance/pages/BudgetsPage'
import CategoriesPage from './finance/pages/CategoriesPage'
import DashboardPage from './finance/pages/DashboardPage'
import MonthDetailsPage from './finance/pages/MonthDetailsPage'
import MonthsPage from './finance/pages/MonthsPage'
import PlanningPage from './finance/pages/PlanningPage'
import RecurringTransactionsPage from './finance/pages/RecurringTransactionsPage'
import HomePage from './home/pages/HomePage'
import { ErrorModalProvider } from './shared/components/ErrorModal/ErrorModalProvider'
import ProtectedRoute from './shared/components/ProtectedRoute/ProtectedRoute'
import PublicOnlyRoute from './shared/components/PublicOnlyRoute/PublicOnlyRoute'
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
            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/finance" element={<FinanceLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="months" element={<MonthsPage />} />
                <Route path="months/:monthlySummaryId" element={<MonthDetailsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="planning" element={<PlanningPage />}>
                  <Route index element={<Navigate to="goals" replace />} />
                  <Route path="goals" element={<BudgetsPage />} />
                  <Route path="recurring" element={<RecurringTransactionsPage />} />
                </Route>
              </Route>
            </Route>
            {/* Signed-out users are sent on to /auth by ProtectedRoute. */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorModalProvider>
    </ToastProvider>
  )
}

export default App
