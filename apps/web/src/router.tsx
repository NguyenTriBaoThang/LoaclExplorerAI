import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { PlannerPage } from './pages/PlannerPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { ProviderPage } from './pages/ProviderPage'
import { AboutPage } from './pages/AboutPage'

export const router = createBrowserRouter([{
  element: <AppLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/explore', element: <ExplorePage /> },
    { path: '/planner', element: <PlannerPage /> },
    { path: '/itinerary/:id', element: <ItineraryPage /> },
    { path: '/provider', element: <ProviderPage /> },
    { path: '/about', element: <AboutPage /> },
  ],
}])
