import './index.css'

import { BookNestQueryProvider, PageTitleProvider } from '@booknest/pages'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { BackendGate } from './components/BackendGate'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BookNestQueryProvider>
      <PageTitleProvider defaultTitle="BookNest">
        <BrowserRouter>
          <BackendGate>
            <App />
          </BackendGate>
        </BrowserRouter>
      </PageTitleProvider>
    </BookNestQueryProvider>
  </React.StrictMode>
)
