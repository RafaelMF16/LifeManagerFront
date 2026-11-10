import type { ComponentType } from 'react'
import { Navigate, Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { ErrorModalProvider } from './shared/components/ErrorModal/ErrorModalProvider'
import { LoginTransitionProvider } from './shared/components/LoginTransition/LoginTransitionProvider'
import ProtectedRoute from './shared/components/ProtectedRoute/ProtectedRoute'
import PublicOnlyRoute from './shared/components/PublicOnlyRoute/PublicOnlyRoute'
import RouteError from './shared/components/RouteError/RouteError'
import SplashScreen from './shared/components/SplashScreen/SplashScreen'
import { ToastProvider } from './shared/components/Toast/ToastProvider'
import { useSessionExpiredRedirect } from './shared/hooks/useSessionExpiredRedirect'

/**
 * A route's screen, loaded on first visit (its own chunk) instead of in the entry bundle: the router waits for it
 * before navigating, so the current screen stays up meanwhile, and the first load shows the root's splash.
 */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

// The root route: hosts the session-expired redirect, which needs the router context, around every screen.
function RootLayout() {
  useSessionExpiredRedirect()
  return <Outlet />
}

// A data router (rather than <BrowserRouter>) so screens can use useBlocker, e.g. the budget's "leave without saving?".
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} hydrateFallbackElement={<SplashScreen />} errorElement={<RouteError />}>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" lazy={page(() => import('./auth/pages/AuthPage'))} />
        <Route path="/auth/forgot-password" lazy={page(() => import('./auth/pages/ForgotPasswordPage'))} />
      </Route>
      {/* Opened from e-mail links: no guard, so they work even in a browser signed in to another account */}
      <Route path="/auth/set-password" lazy={page(() => import('./auth/pages/SetPasswordPage'))} />
      <Route path="/auth/reset-password" lazy={page(() => import('./auth/pages/ResetPasswordPage'))} />
      {/* A ranking group's invite link: keeps the code, then the ranking (behind the guard) offers the group */}
      <Route path="/invite/:code" lazy={page(() => import('./habits/pages/InvitePage'))} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" lazy={page(() => import('./home/pages/HomePage'))} />
        <Route path="/account" lazy={page(() => import('./account/pages/AccountPage'))} />
        <Route path="/finance" lazy={page(() => import('./finance/components/FinanceLayout/FinanceLayout'))}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" lazy={page(() => import('./finance/pages/DashboardPage'))} />
          <Route path="months" lazy={page(() => import('./finance/pages/MonthsPage'))} />
          <Route path="months/:monthlySummaryId" lazy={page(() => import('./finance/pages/MonthDetailsPage'))} />
          <Route path="imports" lazy={page(() => import('./finance/pages/ImportsPage'))} />
          <Route path="imports/:importId" lazy={page(() => import('./finance/pages/ImportReviewPage'))} />
          <Route path="categories" lazy={page(() => import('./finance/pages/CategoriesPage'))} />
          <Route path="planning" lazy={page(() => import('./finance/pages/PlanningPage'))}>
            <Route index element={<Navigate to="goals" replace />} />
            <Route path="goals" lazy={page(() => import('./finance/pages/BudgetsPage'))} />
            <Route path="recurring" lazy={page(() => import('./finance/pages/RecurringTransactionsPage'))} />
          </Route>
        </Route>
        <Route path="/habits" lazy={page(() => import('./habits/components/HabitsLayout/HabitsLayout'))}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" lazy={page(() => import('./habits/pages/TodayPage'))} />
          <Route path="list" lazy={page(() => import('./habits/pages/HabitsPage'))} />
          <Route path="list/:habitId" lazy={page(() => import('./habits/pages/HabitDetailsPage'))} />
          <Route path="challenges" lazy={page(() => import('./habits/pages/ChallengesPage'))} />
          <Route path="achievements" lazy={page(() => import('./habits/pages/AchievementsPage'))} />
          <Route path="ranking" lazy={page(() => import('./habits/pages/RankingPage'))} />
          <Route path="ranking/:groupId" lazy={page(() => import('./habits/pages/RankingGroupPage'))} />
          <Route path="profile" lazy={page(() => import('./habits/pages/ProfilePage'))} />
          <Route path="history" lazy={page(() => import('./habits/pages/HistoryPage'))} />
          <Route path="shop" lazy={page(() => import('./habits/pages/ShopPage'))}>
            <Route index element={<Navigate to="rewards" replace />} />
            <Route path="rewards" lazy={page(() => import('./habits/pages/RewardsPage'))} />
            <Route path="items" lazy={page(() => import('./habits/pages/GameItemsPage'))} />
            <Route path="redemptions" lazy={page(() => import('./habits/pages/RedemptionsPage'))} />
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
        <LoginTransitionProvider>
          <RouterProvider router={router} />
        </LoginTransitionProvider>
      </ErrorModalProvider>
    </ToastProvider>
  )
}

export default App
