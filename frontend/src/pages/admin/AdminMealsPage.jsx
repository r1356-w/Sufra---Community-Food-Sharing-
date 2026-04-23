import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../utils/adminApi'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'mains',
  image: '',
  prepTime: '20',
  sortOrder: '0',
  isAvailable: true,
  isSuspendable: true,
  featured: false,
}

function normalizePayload(form) {
  return {
    ...form,
    price: Number(form.price),
    prepTime: Number(form.prepTime),
    sortOrder: Number(form.sortOrder),
  }
}

export default function AdminMealsPage() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const loadMeals = () => {
    setLoading(true)
    adminApi
      .getMeals()
      .then((data) => setMeals(data || []))
      .catch((error) => {
        toast.error(error?.response?.data?.error || 'Failed to load meals.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMeals()
  }, [])

  const modeLabel = editingId ? 'Update Meal' : 'Add Meal'

  const clearForm = () => {
    setEditingId('')
    setForm(EMPTY_FORM)
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = normalizePayload(form)
      if (editingId) {
        await adminApi.updateMeal(editingId, payload)
        toast.success('Meal updated.')
      } else {
        await adminApi.createMeal(payload)
        toast.success('Meal created.')
      }
      clearForm()
      loadMeals()
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to save meal.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (meal) => {
    setEditingId(meal._id)
    setForm({
      name: meal.name || '',
      description: meal.description || '',
      price: String(meal.price ?? ''),
      category: meal.category || 'mains',
      image: meal.image || '',
      prepTime: String(meal.prepTime ?? 20),
      sortOrder: String(meal.sortOrder ?? 0),
      isAvailable: Boolean(meal.isAvailable),
      isSuspendable: Boolean(meal.isSuspendable),
      featured: Boolean(meal.featured),
    })
  }

  const removeMeal = async (mealId) => {
    setDeletingId(mealId)
    try {
      await adminApi.deleteMeal(mealId)
      toast.success('Meal deleted.')
      if (editingId === mealId) clearForm()
      loadMeals()
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete meal.')
    } finally {
      setDeletingId('')
    }
  }

  const sortedMeals = useMemo(
    () => [...meals].sort((a, b) => a.category.localeCompare(b.category) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [meals]
  )

  return (
    <div className="space-y-6">
      <form onSubmit={submitForm} className="card p-5">
        <h2 className="font-display text-2xl text-charcoal-900 mb-4">{modeLabel}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input"
            required
            placeholder="Meal name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="starters">Starters</option>
            <option value="mains">Mains</option>
            <option value="sides">Sides</option>
            <option value="desserts">Desserts</option>
            <option value="drinks">Drinks</option>
            <option value="suspended">Suspended</option>
          </select>

          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Prep time (minutes)"
            value={form.prepTime}
            onChange={(e) => setForm((prev) => ({ ...prev, prepTime: e.target.value }))}
          />

          <input
            className="input md:col-span-2"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          />

          <textarea
            className="input md:col-span-2 min-h-28"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <input
            className="input"
            type="number"
            min="0"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />

          <div className="grid grid-cols-3 gap-2 items-center text-sm text-charcoal-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))}
              />
              Available
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isSuspendable}
                onChange={(e) => setForm((prev) => ({ ...prev, isSuspendable: e.target.checked }))}
              />
              Suspendable
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              Featured
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : modeLabel}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={clearForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="card p-5">
        <h3 className="font-display text-xl text-charcoal-900 mb-4">Meals ({meals.length})</h3>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading meals...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-charcoal-100 text-charcoal-500">
                  <th className="py-3 pr-3">Meal</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Price</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Suspendable</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMeals.map((meal) => (
                  <tr key={meal._id} className="border-b border-charcoal-100">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-charcoal-900">{meal.name}</p>
                      <p className="text-xs text-charcoal-500 line-clamp-1">{meal.description || '-'}</p>
                    </td>
                    <td className="py-3 pr-3 capitalize">{meal.category}</td>
                    <td className="py-3 pr-3">GBP {(meal.price ?? 0).toFixed(2)}</td>
                    <td className="py-3 pr-3">{meal.isAvailable ? 'Available' : 'Unavailable'}</td>
                    <td className="py-3 pr-3">{meal.isSuspendable ? 'Yes' : 'No'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => startEdit(meal)}>
                          Edit
                        </button>
                        <button
                          className="btn-danger py-1.5 px-3 text-xs"
                          onClick={() => removeMeal(meal._id)}
                          disabled={deletingId === meal._id}
                        >
                          {deletingId === meal._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {sortedMeals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-charcoal-500">
                      No meals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
