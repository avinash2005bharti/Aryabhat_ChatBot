import React from 'react'
import MainRoutes from './Routes/MainRoutes'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from './pages/Nav'

const App = () => {
  return (
   
      <div>
        <MainRoutes />
         <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      <Nav />
      </div>
   
  )
}

export default App
