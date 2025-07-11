import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { Subject, TimeTable, Attendance, Bunk } from './components/index.js'
import { ToastProvider } from './context/ToastContext.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<Subject />} />
      < Route path='timetable' element={<TimeTable />} />
      < Route path='attendance' element={<Attendance />} />
      < Route path='bunk' element={<Bunk />} />
    </Route >
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
)
