import { useState, useEffect } from 'react'

import {
  Search,
  Bell,
  ChevronDown
} from 'lucide-react'

function Navbar() {

  const [profile, setProfile] = useState(() => {

    const savedProfile = localStorage.getItem('deliveryAIProfile')

    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          name: 'Admin User',
          email: 'admin@deliveryai.com',
          role: 'Administrator'
        }

  })


  useEffect(() => {

    const updateProfile = () => {

      const savedProfile = localStorage.getItem('deliveryAIProfile')

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }

    }

    window.addEventListener(
      'deliveryai-profile-updated',
      updateProfile
    )

    window.addEventListener('storage', updateProfile)

    return () => {

      window.removeEventListener(
        'deliveryai-profile-updated',
        updateProfile
      )

      window.removeEventListener('storage', updateProfile)

    }

  }, [])


  const firstLetter = profile.name
    ? profile.name.trim().charAt(0).toUpperCase()
    : 'A'


  return (

    <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">

      {/* Left Section */}

      <div>

        <h2 className="text-xl font-semibold text-white">
          Dashboard Overview
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Welcome back! Here's your delivery performance.
        </p>

      </div>


      {/* Right Section */}

      <div className="flex items-center gap-6">

        {/* Search */}

        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">

          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm text-white w-40 placeholder:text-slate-500"
          />

        </div>


        {/* Notifications */}

        <button className="relative text-slate-400 hover:text-cyan-400">

          <Bell size={21} />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>

        </button>


        {/* User Profile */}

        <div className="flex items-center gap-3 cursor-pointer">

          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">

            {firstLetter}

          </div>


          <div>

            <p className="text-sm font-semibold text-white">

              {profile.name}

            </p>

            <p className="text-xs text-slate-400">

              {profile.role}

            </p>

          </div>


          <ChevronDown size={17} className="text-slate-400" />

        </div>

      </div>

    </header>

  )

}

export default Navbar