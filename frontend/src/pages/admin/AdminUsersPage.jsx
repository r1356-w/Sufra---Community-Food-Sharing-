import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { adminApi } from '../../utils/adminApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadUsers = () => {
    setLoading(true)
    adminApi
      .getUsers()
      .then((data) => setUsers(data || []))
      .catch((error) => {
        toast.error(error?.response?.data?.error || 'Failed to load users.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.name, u.email, u.role].some((v) => String(v || '').toLowerCase().includes(q))
    )
  }, [users, search])

  const toggleStatus = async (user) => {
    setBusyId(user._id)
    try {
      await adminApi.setUserStatus(user._id, !user.isActive)
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}.`)
      loadUsers()
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update user status.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="font-display text-2xl text-charcoal-900">Users</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            className="input py-2.5 pl-9"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-charcoal-100 text-charcoal-500">
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Email</th>
                <th className="py-3 pr-3">Role</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Joined</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-charcoal-100">
                  <td className="py-3 pr-3 font-medium text-charcoal-900">{user.name}</td>
                  <td className="py-3 pr-3 text-charcoal-600">{user.email}</td>
                  <td className="py-3 pr-3 capitalize">{user.role}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-charcoal-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button
                      className="btn-secondary py-1.5 px-3 text-xs"
                      disabled={busyId === user._id}
                      onClick={() => toggleStatus(user)}
                    >
                      {busyId === user._id ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-charcoal-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
