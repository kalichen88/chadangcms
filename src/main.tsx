import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

import { loadRuntimeEnv } from './utils/runtimeEnv'

async function bootstrap() {
  await loadRuntimeEnv()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
