import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { PlannerPage } from './pages/PlannerPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { ProviderPortalPage } from './pages/ProviderPortalPage'
import { AboutPage } from './pages/AboutPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { SharedItineraryPage } from './pages/SharedItineraryPage'
import { ComparePage } from './pages/ComparePage'
import { RoleRoute } from './auth'

export const router = createBrowserRouter([{
  element: <AppLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/explore', element: <ExplorePage /> },
    { path: '/planner', element: <PlannerPage /> },
    { path: '/itinerary/:id', element: <ItineraryPage /> },
    { path: '/shared/:token', element: <SharedItineraryPage /> },
    { path: '/login', element: <AuthPage /> },
    { path: '/register', element: <AuthPage register /> },
    { path: '/about', element: <AboutPage /> },
    { element: <RoleRoute roles={['traveler', 'provider', 'admin']} />, children: [
      { path: '/profile', element: <ProfilePage /> },
      { path: '/compare', element: <ComparePage /> },
    ] },
    { element: <RoleRoute roles={['provider']} />, children: [
      { path: '/provider', element: <ProviderPortalPage /> },
    ] },
    { element: <RoleRoute roles={['admin']} />, children: [
      { path: '/admin', element: <AdminPage /> },
    ] },
  ],
}])
