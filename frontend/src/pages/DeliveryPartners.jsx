import { useState, useEffect } from 'react'
import {
  Bike,
  Star,
  Clock,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Users,
  Package
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api/delivery-partners'

function DeliveryPartners() {

  const [partners, setPartners] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)

  const emptyForm = {
    partner_code: '',
    name: '',
    vehicle_type: 'Motorcycle',
    rating: 0,
    total_deliveries: 0,
    average_delivery_time: '',
    status: 'Active'
  }

  const [formData, setFormData] = useState(emptyForm)

  // FETCH PARTNERS
  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to fetch delivery partners.')
      }

      const data = await response.json()
      setPartners(data.partners || [])

    } catch (err) {
      setError(err.message || 'Backend connection failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  // ADD PARTNER
  const handleAdd = () => {
    setEditingPartner(null)
    setFormData({ ...emptyForm })
    setShowForm(true)
  }

  // EDIT PARTNER
  const handleEdit = (partner) => {
    setEditingPartner(partner)

    setFormData({
      partner_code: partner.partner_code,
      name: partner.name,
      vehicle_type: partner.vehicle_type,
      rating: partner.rating ?? 0,
      total_deliveries: partner.total_deliveries ?? 0,
      average_delivery_time: partner.average_delivery_time ?? '',
      status: partner.status
    })

    setShowForm(true)
  }

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // SAVE PARTNER
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        ...formData,
        rating: Number(formData.rating),
        total_deliveries: Number(formData.total_deliveries),
        average_delivery_time:
          formData.average_delivery_time === ''
            ? null
            : Number(formData.average_delivery_time)
      }

      const url = editingPartner
        ? `${API_URL}/${editingPartner.id}`
        : API_URL

      const method = editingPartner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to save partner.')
      }

      setShowForm(false)
      setEditingPartner(null)
      setFormData({ ...emptyForm })

      await fetchPartners()

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // DELETE PARTNER
  const handleDelete = async (partner) => {

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${partner.name}?`
    )

    if (!confirmDelete) return

    try {
      setError('')

      const response = await fetch(`${API_URL}/${partner.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to delete partner.')
      }

      await fetchPartners()

    } catch (err) {
      setError(err.message || 'Delete operation failed.')
    }
  }

  // SEARCH AND FILTER
  const filteredPartners = partners.filter((partner) => {

    const search = searchTerm.toLowerCase()

    const matchesSearch =
      (partner.name || '').toLowerCase().includes(search) ||
      (partner.partner_code || '').toLowerCase().includes(search)

    const matchesStatus =
      filterStatus === 'All' || partner.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // DYNAMIC STATISTICS
  const activePartners = partners.filter(
    (partner) => partner.status === 'Active'
  ).length

  const averageRating = partners.length > 0
    ? (
        partners.reduce(
          (sum, partner) => sum + Number(partner.rating || 0),
          0
        ) / partners.length
      ).toFixed(1)
    : '0.0'

  const partnersWithTime = partners.filter(
    (partner) => partner.average_delivery_time != null
  )

  const averageDeliveryTime = partnersWithTime.length > 0
    ? (
        partnersWithTime.reduce(
          (sum, partner) => sum + Number(partner.average_delivery_time),
          0
        ) / partnersWithTime.length
      ).toFixed(1)
    : '0.0'

  return (

    <div className="p-6 space-y-6">

      {/* PAGE HEADING */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Delivery Partners
          </h1>

          <p className="text-slate-400 mt-1">
            Manage delivery partners and monitor their performance.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchPartners}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            <Plus size={18} />
            Add Partner
          </button>

        </div>

      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Total Partners</p>
            <Bike className="text-cyan-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mt-3">
            {partners.length}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Active Partners</p>
            <Users className="text-green-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mt-3">
            {activePartners}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Average Rating</p>
            <Star className="text-yellow-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mt-3">
            {averageRating}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Average Delivery Time</p>
            <Clock className="text-purple-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mt-3">
            {averageDeliveryTime} min
          </h2>

        </div>

      </div>

      {/* SEARCH AND FILTER */}

      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            className="absolute left-3 top-3 text-slate-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Search partner name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none"
        >
          <option value="All">All Partners</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

      </div>

      {/* PARTNERS TABLE */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">
            Delivery Partner Details
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-800/50 text-slate-400 text-sm">

              <tr>
                <th className="p-4">Partner</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Deliveries</th>
                <th className="p-4">Average Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {loading ? (

                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading delivery partners...
                  </td>
                </tr>

              ) : (

                filteredPartners.map((partner) => (

                  <tr key={partner.id} className="hover:bg-slate-800/30">

                    <td className="p-4">
                      <p className="text-white font-medium">
                        {partner.name}
                      </p>

                      <p className="text-slate-500 text-xs">
                        {partner.partner_code}
                      </p>
                    </td>

                    <td className="p-4 text-slate-300">
                      {partner.vehicle_type}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={15} />
                        <span>
                          {Number(partner.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">
                      {partner.total_deliveries}
                    </td>

                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-cyan-400" />

                        {partner.average_delivery_time != null
                          ? `${partner.average_delivery_time} min`
                          : 'N/A'}
                      </div>
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          partner.status === 'Active'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {partner.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() => handleEdit(partner)}
                          title="Edit partner"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(partner)}
                          title="Delete partner"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

              {!loading && filteredPartners.length === 0 && (

                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No delivery partners found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD / EDIT PARTNER MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-5 border-b border-slate-800">

              <h2 className="text-xl font-bold text-white">
                {editingPartner ? 'Edit Delivery Partner' : 'Add Delivery Partner'}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={22} />
              </button>

            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Partner Code
                </label>

                <input
                  type="text"
                  name="partner_code"
                  value={formData.partner_code}
                  onChange={handleChange}
                  placeholder="Example: DP002"
                  required
                  disabled={Boolean(editingPartner)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Partner Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter partner name"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Vehicle Type
                </label>

                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Electric Vehicle">Electric Vehicle</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Rating
                  </label>

                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Total Deliveries
                  </label>

                  <input
                    type="number"
                    name="total_deliveries"
                    value={formData.total_deliveries}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Average Delivery Time (minutes)
                </label>

                <input
                  type="number"
                  name="average_delivery_time"
                  value={formData.average_delivery_time}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="Example: 25.5"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Partner Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingPartner
                      ? 'Update Partner'
                      : 'Add Partner'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )
}

export default DeliveryPartners