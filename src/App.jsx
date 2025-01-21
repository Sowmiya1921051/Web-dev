import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import TaskListManager from './components/Tabulator'

function App() {
  return (
    <div>
      <BrowserRouter>
       
          <Routes>
            <Route path="/" element={<TaskListManager/>} />
          </Routes>
       
      </BrowserRouter> 
    </div>
  )
}

export default App
