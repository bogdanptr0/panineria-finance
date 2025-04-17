
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'
import Auth from '@/pages/Auth'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
