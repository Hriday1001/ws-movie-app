import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter , Routes , Route } from 'react-router-dom'
import "./App.css"
import LandingPage from './pages/LandingPage'
import SessionPage from './pages/SessionPage'


function App() {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage/>}></Route>
          <Route path='/session/:sessionId' element={<SessionPage/>}></Route>
          <Route></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
