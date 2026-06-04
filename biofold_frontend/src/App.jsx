import { Router, Route } from '@solidjs/router'
import { lazy } from 'solid-js'

const HomePage          = lazy(() => import('./pages/HomePage.jsx'))
const LabPage           = lazy(() => import('./pages/LabPage.jsx'))
const DocumentationPage = lazy(() => import('./pages/DocumentationPage.jsx'))

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <Router base={BASE}>
      <Route path="/"              component={HomePage} />
      <Route path="/lab"           component={LabPage} />
      <Route path="/documentation" component={DocumentationPage} />
    </Router>
  )
}

export default App
