import { useState } from 'react'

import {
  User,
  Bell,
  Shield,
  BrainCircuit,
  Save
} from 'lucide-react'


function Settings() {

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


  const savedPreferences = JSON.parse(
    localStorage.getItem('deliveryAIPreferences') || '{}'
  )


  const [notifications, setNotifications] = useState(
    savedPreferences.notifications ?? true
  )

  const [emailAlerts, setEmailAlerts] = useState(
    savedPreferences.emailAlerts ?? true
  )

  const [aiInsights, setAiInsights] = useState(
    savedPreferences.aiInsights ?? true
  )


  const handleProfileChange = (e) => {

    setProfile({

      ...profile,

      [e.target.name]: e.target.value

    })

  }


  const handleSave = () => {

    // Save profile information

    localStorage.setItem(
      'deliveryAIProfile',
      JSON.stringify(profile)
    )


    // Save application preferences

    localStorage.setItem(

      'deliveryAIPreferences',

      JSON.stringify({

        notifications,
        emailAlerts,
        aiInsights

      })

    )


    // Update Navbar immediately

    window.dispatchEvent(
      new Event('deliveryai-profile-updated')
    )


    alert('Settings saved successfully!')

  }


  return (

    <div className="p-6 space-y-6">

      {/* Page Heading */}

      <div>

        <h1 className="text-2xl font-bold text-white">
          Settings
        </h1>

        <p className="text-slate-400 mt-1">
          Manage your account, notifications and AI application preferences.
        </p>

      </div>


      {/* Profile Settings */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <User className="text-cyan-400" size={22} />

          <div>

            <h2 className="text-lg font-semibold text-white">
              Profile Information
            </h2>

            <p className="text-sm text-slate-400">
              Manage your administrator profile.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>

            <label className="text-sm text-slate-400">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">
              Account Role
            </label>

            <input
              type="text"
              value={profile.role}
              readOnly
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-400 outline-none"
            />

          </div>

        </div>

      </div>


      {/* Notification Settings */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <Bell className="text-cyan-400" size={22} />

          <div>

            <h2 className="text-lg font-semibold text-white">
              Notification Preferences
            </h2>

            <p className="text-sm text-slate-400">
              Control your application notification preferences.
            </p>

          </div>

        </div>


        <div className="space-y-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-white font-medium">
                Push Notifications
              </p>

              <p className="text-sm text-slate-400">
                Enable application notification preferences.
              </p>

            </div>

            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 accent-cyan-500"
            />

          </div>


          <div className="flex items-center justify-between">

            <div>

              <p className="text-white font-medium">
                Email Alerts
              </p>

              <p className="text-sm text-slate-400">
                Receive delivery reports and important alerts.
              </p>

            </div>

            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 accent-cyan-500"
            />

          </div>

        </div>

      </div>


      {/* AI Settings */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <BrainCircuit className="text-cyan-400" size={22} />

          <div>

            <h2 className="text-lg font-semibold text-white">
              AI Preferences
            </h2>

            <p className="text-sm text-slate-400">
              Manage AI application preferences.
            </p>

          </div>

        </div>


        <div className="flex items-center justify-between">

          <div>

            <p className="text-white font-medium">
              AI Insights
            </p>

            <p className="text-sm text-slate-400">
              Enable AI-based delivery insights and recommendations.
            </p>

          </div>

          <input
            type="checkbox"
            checked={aiInsights}
            onChange={(e) => setAiInsights(e.target.checked)}
            className="w-5 h-5 accent-cyan-500"
          />

        </div>

      </div>


      {/* Security Settings */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3 mb-4">

          <Shield className="text-green-400" size={22} />

          <h2 className="text-lg font-semibold text-white">
            Security
          </h2>

        </div>

        <p className="text-sm text-slate-400">
          Your account security settings will be available here.
        </p>

      </div>


      {/* Save Button */}

      <div className="flex justify-end">

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

    </div>

  )

}

export default Settings