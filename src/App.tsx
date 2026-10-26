import { Navigate, Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import AuthPage from './auth/pages/AuthPage'
import SetPasswordPage from './auth/pages/SetPasswordPage'
import FinanceLayout from './finance/components/FinanceLayout/FinanceLayout'
import BudgetsPage from './finance/pages/BudgetsPage'
import CategoriesPage from './finance/pages/CategoriesPage'
import DashboardPage from './finance/pages/DashboardPage'
import ImportReviewPage from './finance/pages/ImportReviewPage'
import ImportsPage from './finance/pages/ImportsPage'
import MonthDetailsPage from './finance/pages/MonthDetailsPage'
import MonthsPage from './finance/pages/MonthsPage'
import PlanningPage from './finance/pages/PlanningPage'
import RecurringTransactionsPage from './finance/pages/RecurringTransactionsPage'
import HabitsLayout from './habits/components/HabitsLayout/HabitsLayout'
import HabitDetailsPage from './habits/pages/HabitDetailsPage'
import HabitsPage from './habits/pages/HabitsPage'
import HistoryPage from './habits/pages/HistoryPage'
import RedemptionsPage from './habits/pages/RedemptionsPage'
import RewardsPage from './habits/pages/RewardsPage'
import ShopPage from './habits/pages/ShopPage'
import TodayPage from './habits/pages/TodayPage'
import HomePage from './home/pages/HomePage'
import { ErrorModalProvider } from './shared/components/ErrorModal/ErrorModalProvider'
import ProtectedRoute from './shared/components/ProtectedRoute/ProtectedRoute'
import PublicOnlyRoute from './shared/components/PublicOnlyRoute/PublicOnlyRoute'
import { ToastProvider } from './shared/components/Toast/ToastProvider'
import { useSessionExpiredRedirect } from './shared/hooks/useSessionExpiredRedirect'

// The root route: hosts the session-expired redirect, which needs the router context, around every screen.
function RootLayout() {
  useSessionExpiredRedirect()
  return <Outlet />
}

// A data router (rather than <BrowserRouter>) so screens can use useBlocker, e.g. the budget's "leave without saving?".
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      {/* Opened from e-mail links: no guard, so they work even in a browser signed in to another account */}
      <Route path="/auth/set-password" element={<SetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/finance" element={<FinanceLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="months" element={<MonthsPage />} />
          <Route path="months/:monthlySummaryId" element={<MonthDetailsPage />} />
          <Route path="imports" element={<ImportsPage />} />
          <Route path="imports/:importId" element={<ImportReviewPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="planning" element={<PlanningPage />}>
            <Route index element={<Navigate to="goals" replace />} />
            <Route path="goals" element={<BudgetsPage />} />
            <Route path="recurring" element={<RecurringTransactionsPage />} />
          </Route>
        </Route>
        <Route path="/habits" element={<HabitsLayout />}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="list" element={<HabitsPage />} />
          <Route path="list/:habitId" element={<HabitDetailsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="shop" element={<ShopPage />}>
            <Route index element={<Navigate to="rewards" replace />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="redemptions" element={<RedemptionsPage />} />
          </Route>
        </Route>
      </Route>
      {/* Signed-out users are sent on to /auth by ProtectedRoute. */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Route>,
  ),
)

function App() {
  return (
    <ToastProvider>
      <ErrorModalProvider>
        <RouterProvider router={router} />
      </ErrorModalProvider>
    </ToastProvider>
  )
}

export default App
