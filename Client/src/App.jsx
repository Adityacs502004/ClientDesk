import React from 'react'
import Landing_page from './components/Landing_page/Landing_page'
import { Routes , Route } from 'react-router'
import Log_in from './components/Login_signup/Log_in'
import Sign_up from './components/Sign_up_page/Sign_up'
import Dashboard from './components/DashBoard/Dashboard'
import Protected_route from './components/Protected_route/Protected_route'
import Clients from './components/Clients/Clients'
import Project from './components/Project/Project'
import Invoices from './components/Invoice/Invoices'
import Generated_invoice from './components/Invoice/Generated_invoice/Generated_invoice.jsx'
import Profile from './components/Profile/Profile'
import Forgot_password from './components/Login_signup/Forgot_password'
import Reset_password from './components/Login_signup/Reset_password'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing_page />}></Route>
      <Route path='/login' element={<Log_in />}></Route>
      <Route path='/signup' element={<Sign_up />}></Route>
      <Route path='/forgot-password' element={<Forgot_password />}></Route>
      <Route path='/reset-password' element={<Reset_password />}></Route>
      <Route path='/dashboard' element={
        <Protected_route>
          <Dashboard />
        </Protected_route>
      }></Route>
      <Route path='/clients' element={
        <Protected_route>
          <Clients />
        </Protected_route>
      }></Route>
      <Route path='/project' element={
        <Protected_route>
          <Project />
        </Protected_route>
      }>  
      </Route>
      <Route path='/invoices' element={
        <Protected_route>
          <Invoices />
        </Protected_route>
      }>    
      </Route>
      
      <Route path='/invoice/action' element={
        <Protected_route>
          <Generated_invoice/>
        </Protected_route>
      }>       
      </Route>

      <Route path='/profile' element={
        <Protected_route>
          <Profile />
        </Protected_route>
      }>       
      </Route>

    </Routes>
    
  )
}

export default App