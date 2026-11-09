import { useState } from 'react'

import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Restaurant from './pages/Restaurant'
import DeliveryPartners from './pages/DeliveryPartners'
import Settings from './pages/Settings'


function App() {

  const [activePage, setActivePage] = useState('Dashboard')


  // Display the selected page
  const renderPage = () => {

    switch (activePage) {

      case 'Dashboard':
        return <Dashboard />

      case 'AI Prediction':
        return <Prediction />

      case 'Orders':
        return <Orders />

      case 'Analytics':
        return <Analytics />

      case 'Restaurants':
        return <Restaurant />

      case 'Delivery Partners':
        return <DeliveryPartners />

      case 'Settings':
        return <Settings />

      default:
        return <Dashboard />

    }

  }


  return (

    <div className="min-h-screen bg-slate-950">

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />


      {/* Main Application */}
      <div className="ml-64 min-w-0">

        {/* Navbar */}
        <Navbar />


        {/* Selected Page */}
        <main>
          {renderPage()}
        </main>

      </div>

    </div>

  )

}

export default App