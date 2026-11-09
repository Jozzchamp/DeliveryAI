import {
  LayoutDashboard,
  BrainCircuit,
  ClipboardList,
  ChartNoAxesCombined,
  Store,
  Bike,
  Settings,
  Zap
} from 'lucide-react'

function Sidebar({ activePage, onNavigate }) {

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'AI Prediction', icon: BrainCircuit },
    { name: 'Orders', icon: ClipboardList },
    { name: 'Analytics', icon: ChartNoAxesCombined },
    { name: 'Restaurants', icon: Store },
    { name: 'Delivery Partners', icon: Bike },
    { name: 'Settings', icon: Settings }
  ]

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto z-50">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">

        <div className="bg-cyan-500 p-2 rounded-lg">
          <Zap size={25} className="text-slate-950" />
        </div>

        <h1 className="text-xl font-bold text-white">
          Delivery<span className="text-cyan-400">AI</span>
        </h1>

      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon

          const isActive = activePage === item.name

          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400'
              }`}
            >

              <Icon size={20} />

              <span className="text-sm font-medium">
                {item.name}
              </span>

            </button>
          )

        })}

      </nav>

    </aside>
  )
}

export default Sidebar