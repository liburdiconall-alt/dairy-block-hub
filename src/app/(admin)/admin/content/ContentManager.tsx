'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffContact = {
  id: string
  name: string
  title: string
  email: string
  phone: string | null
  category: string
  sortOrder: number
  isActive: boolean
}

type BuildingHours = {
  id: string
  label: string
  hours: string
  sortOrder: number
}

type Announcement = {
  id: string
  title: string
  body: string
  type: string
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

type HandbookSection = {
  id: string
  handbook: string
  title: string
  content: string
  sortOrder: number
  isActive: boolean
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in',
      ok ? 'bg-db-mint-light text-db-teal border border-db-mint' : 'bg-red-50 text-db-red border border-red-200'
    )}>
      {msg}
    </div>
  )
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────

function ContactsTab({ contacts: initial }: { contacts: StaffContact[] }) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initial)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<StaffContact>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', title: '', email: '', phone: '', category: 'MANAGEMENT', sortOrder: 0 })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveEdit(id: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/content/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setLoading(false)
    if (res.ok) {
      const updated = await res.json()
      setContacts(c => c.map(x => x.id === id ? updated : x))
      setEditId(null)
      showToast('Contact updated')
    } else {
      showToast('Failed to update', false)
    }
  }

  async function deleteContact(id: string) {
    if (!confirm('Delete this contact?')) return
    setLoading(true)
    const res = await fetch(`/api/admin/content/contacts/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      setContacts(c => c.filter(x => x.id !== id))
      showToast('Contact deleted')
    } else {
      showToast('Failed to delete', false)
    }
  }

  async function addContact() {
    if (!addForm.name || !addForm.title || !addForm.email) return showToast('Name, title, and email required', false)
    setLoading(true)
    const res = await fetch('/api/admin/content/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    setLoading(false)
    if (res.ok) {
      const created = await res.json()
      setContacts(c => [...c, created].sort((a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder))
      setAddForm({ name: '', title: '', email: '', phone: '', category: 'MANAGEMENT', sortOrder: 0 })
      setShowAdd(false)
      showToast('Contact added')
    } else {
      showToast('Failed to add contact', false)
    }
  }

  const categories = ['MANAGEMENT', 'SECURITY', 'MAINTENANCE']

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {categories.map(cat => {
        const group = contacts.filter(c => c.category === cat)
        if (group.length === 0 && !showAdd) return null
        return (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">{cat}</h3>
            <div className="db-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-db-gray-100 bg-db-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-db-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-db-gray-50">
                  {group.map(c => (
                    <tr key={c.id} className="hover:bg-db-gray-50 transition-colors">
                      {editId === c.id ? (
                        <>
                          <td className="px-4 py-2"><input className="db-input text-xs py-1.5" value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                          <td className="px-4 py-2"><input className="db-input text-xs py-1.5" value={editForm.title ?? ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></td>
                          <td className="px-4 py-2 hidden md:table-cell"><input className="db-input text-xs py-1.5" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></td>
                          <td className="px-4 py-2 hidden md:table-cell"><input className="db-input text-xs py-1.5" value={editForm.phone ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => saveEdit(c.id)} disabled={loading} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-mint-light text-db-teal text-xs font-semibold border border-db-mint hover:bg-db-mint disabled:opacity-50"><Check size={12} /> Save</button>
                              <button onClick={() => setEditId(null)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-gray-100 text-db-gray-600 text-xs font-semibold border border-db-gray-200 hover:bg-db-gray-200"><X size={12} /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-db-black">{c.name}</td>
                          <td className="px-4 py-3 text-db-gray-500 text-xs">{c.title}</td>
                          <td className="px-4 py-3 text-db-gray-500 text-xs hidden md:table-cell">{c.email}</td>
                          <td className="px-4 py-3 text-db-gray-500 text-xs hidden md:table-cell">{c.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => { setEditId(c.id); setEditForm(c) }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-gray-100 text-db-gray-600 text-xs font-semibold border border-db-gray-200 hover:bg-db-gray-200"><Edit2 size={12} /> Edit</button>
                              <button onClick={() => deleteContact(c.id)} disabled={loading} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-db-red text-xs font-semibold border border-red-200 hover:bg-red-100 disabled:opacity-50"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {group.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-4 text-center text-xs text-db-gray-300">No {cat.toLowerCase()} contacts</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Add Contact Form */}
      {showAdd ? (
        <div className="db-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-db-black">Add New Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Name</label>
              <input className="db-input" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Title</label>
              <input className="db-input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Job title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Email</label>
              <input className="db-input" type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Phone (optional)</label>
              <input className="db-input" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="(303) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Category</label>
              <select className="db-input" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                <option value="MANAGEMENT">Management</option>
                <option value="SECURITY">Security</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Sort Order</label>
              <input className="db-input" type="number" value={addForm.sortOrder} onChange={e => setAddForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addContact} disabled={loading} className="btn-teal disabled:opacity-50">Add Contact</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-db-mint-light text-db-teal text-sm font-semibold border border-db-mint hover:bg-db-mint transition-colors">
          <Plus size={15} /> Add Contact
        </button>
      )}
    </div>
  )
}

// ─── Building Hours Tab ───────────────────────────────────────────────────────

function HoursTab({ hours: initial }: { hours: BuildingHours[] }) {
  const [rows, setRows] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveAll() {
    setLoading(true)
    const res = await fetch('/api/admin/content/hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    })
    setLoading(false)
    if (res.ok) {
      const updated = await res.json()
      setRows(updated)
      showToast('Building hours saved')
    } else {
      showToast('Failed to save', false)
    }
  }

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <div className="db-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-db-gray-100 bg-db-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400">Day / Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-db-gray-50">
            {rows.map((row, i) => (
              <tr key={row.id} className="hover:bg-db-gray-50 transition-colors">
                <td className="px-4 py-2.5">
                  <input
                    className="db-input text-sm py-1.5"
                    value={row.label}
                    onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    className="db-input text-sm py-1.5"
                    value={row.hours}
                    onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={saveAll} disabled={loading} className="btn-teal disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

// ─── Announcements Tab ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  INFO:    'bg-blue-50 text-blue-700 border-blue-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  URGENT:  'bg-red-50 text-db-red border-red-200',
}

function AnnouncementsTab({ announcements: initial }: { announcements: Announcement[] }) {
  const [items, setItems] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', body: '', type: 'INFO', isActive: true, expiresAt: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleActive(item: Announcement) {
    const res = await fetch(`/api/admin/content/announcements/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(a => a.map(x => x.id === item.id ? updated : x))
      showToast(updated.isActive ? 'Activated' : 'Deactivated')
    } else {
      showToast('Failed to update', false)
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/admin/content/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(a => a.filter(x => x.id !== id))
      showToast('Deleted')
    } else {
      showToast('Failed to delete', false)
    }
  }

  async function addAnnouncement() {
    if (!addForm.title || !addForm.body) return showToast('Title and body required', false)
    setLoading(true)
    const res = await fetch('/api/admin/content/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, expiresAt: addForm.expiresAt || null }),
    })
    setLoading(false)
    if (res.ok) {
      const created = await res.json()
      setItems(a => [created, ...a])
      setAddForm({ title: '', body: '', type: 'INFO', isActive: true, expiresAt: '' })
      setShowAdd(false)
      showToast('Announcement added')
    } else {
      showToast('Failed to add', false)
    }
  }

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {items.length === 0 && !showAdd && (
        <div className="db-card py-12 text-center text-sm text-db-gray-300">No announcements yet.</div>
      )}

      {items.map(item => (
        <div key={item.id} className={cn('db-card p-4 space-y-2', !item.isActive && 'opacity-60')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={cn('db-badge text-xs border', TYPE_COLORS[item.type] ?? 'bg-gray-100 text-gray-600')}>{item.type}</span>
                {!item.isActive && <span className="db-badge text-xs border bg-db-gray-100 text-db-gray-400 border-db-gray-200">Inactive</span>}
                {item.expiresAt && <span className="text-xs text-db-gray-400">Expires {new Date(item.expiresAt).toLocaleDateString()}</span>}
              </div>
              <p className="font-semibold text-db-black text-sm">{item.title}</p>
              <p className="text-xs text-db-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => toggleActive(item)}
                title={item.isActive ? 'Deactivate' : 'Activate'}
                className={cn('inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                  item.isActive
                    ? 'bg-db-mint-light text-db-teal border-db-mint hover:bg-db-mint'
                    : 'bg-db-gray-100 text-db-gray-600 border-db-gray-200 hover:bg-db-gray-200'
                )}
              >
                {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button onClick={() => deleteAnnouncement(item.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-db-red text-xs font-semibold border border-red-200 hover:bg-red-100">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {showAdd ? (
        <div className="db-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-db-black">Add Announcement</h3>
          <div>
            <label className="block text-xs font-medium text-db-gray-600 mb-1">Title</label>
            <input className="db-input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-db-gray-600 mb-1">Body</label>
            <textarea className="db-input resize-none" rows={4} value={addForm.body} onChange={e => setAddForm(f => ({ ...f, body: e.target.value }))} placeholder="Announcement message..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Type</label>
              <select className="db-input" value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-db-gray-600 mb-1">Expires At (optional)</label>
              <input className="db-input" type="date" value={addForm.expiresAt} onChange={e => setAddForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addForm.isActive} onChange={e => setAddForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-db-gray-300" />
                <span className="text-xs font-medium text-db-gray-600">Active immediately</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addAnnouncement} disabled={loading} className="btn-teal disabled:opacity-50">Add Announcement</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-db-mint-light text-db-teal text-sm font-semibold border border-db-mint hover:bg-db-mint transition-colors">
          <Plus size={15} /> Add Announcement
        </button>
      )}
    </div>
  )
}

// ─── Handbook Tab ─────────────────────────────────────────────────────────────

function HandbookTab({ officeSections: initialOffice, retailSections: initialRetail }: {
  officeSections: HandbookSection[]
  retailSections: HandbookSection[]
}) {
  const [hb, setHb] = useState<'OFFICE' | 'RETAIL'>('OFFICE')
  const [office, setOffice] = useState(initialOffice)
  const [retail, setRetail] = useState(initialRetail)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<HandbookSection>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const sections = hb === 'OFFICE' ? office : retail
  const setSections = hb === 'OFFICE' ? setOffice : setRetail

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function patchSection(id: string, data: object) {
    const res = await fetch(`/api/admin/content/handbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) return await res.json()
    return null
  }

  async function saveEdit(id: string) {
    setLoading(true)
    const updated = await patchSection(id, editForm)
    setLoading(false)
    if (updated) {
      setSections(s => s.map(x => x.id === id ? updated : x))
      setEditId(null)
      showToast('Section updated')
    } else {
      showToast('Failed to update', false)
    }
  }

  async function toggleActive(section: HandbookSection) {
    const updated = await patchSection(section.id, { isActive: !section.isActive })
    if (updated) {
      setSections(s => s.map(x => x.id === section.id ? updated : x))
      showToast(updated.isActive ? 'Section shown' : 'Section hidden')
    } else {
      showToast('Failed to update', false)
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section?')) return
    const res = await fetch(`/api/admin/content/handbook/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSections(s => s.filter(x => x.id !== id))
      showToast('Section deleted')
    } else {
      showToast('Failed to delete', false)
    }
  }

  async function moveSection(index: number, dir: -1 | 1) {
    const newSections = [...sections]
    const target = newSections[index + dir]
    const current = newSections[index]
    if (!target) return

    // Swap sort orders
    const tempOrder = current.sortOrder
    newSections[index] = { ...current, sortOrder: target.sortOrder }
    newSections[index + dir] = { ...target, sortOrder: tempOrder }
    newSections.sort((a, b) => a.sortOrder - b.sortOrder)
    setSections(newSections)

    // Persist both
    await Promise.all([
      patchSection(current.id, { sortOrder: target.sortOrder }),
      patchSection(target.id, { sortOrder: tempOrder }),
    ])
  }

  async function addSection() {
    if (!addForm.title || !addForm.content) return showToast('Title and content required', false)
    setLoading(true)
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sortOrder)) + 1 : 1
    const res = await fetch('/api/admin/content/handbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handbook: hb, title: addForm.title, content: addForm.content, sortOrder: maxOrder }),
    })
    setLoading(false)
    if (res.ok) {
      const created = await res.json()
      setSections(s => [...s, created])
      setAddForm({ title: '', content: '' })
      setShowAdd(false)
      showToast('Section added')
    } else {
      showToast('Failed to add section', false)
    }
  }

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Handbook toggle */}
      <div className="flex gap-1 bg-db-gray-50 rounded-xl p-1 w-fit border border-db-gray-100">
        {(['OFFICE', 'RETAIL'] as const).map(h => (
          <button
            key={h}
            onClick={() => { setHb(h); setEditId(null); setShowAdd(false) }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              hb === h ? 'bg-white text-db-black shadow-sm border border-db-gray-100' : 'text-db-gray-400 hover:text-db-gray-600'
            )}
          >
            {h === 'OFFICE' ? 'Office' : 'Retail'}
          </button>
        ))}
      </div>

      {sections.map((section, i) => (
        <div key={section.id} className={cn('db-card overflow-hidden', !section.isActive && 'opacity-60')}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!section.isActive && <span className="db-badge text-xs border bg-db-gray-100 text-db-gray-400 border-db-gray-200">Hidden</span>}
                  <p className="font-semibold text-db-black text-sm">{section.title}</p>
                </div>
                {editId !== section.id && (
                  <p className="text-xs text-db-gray-500 line-clamp-2">{section.content}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-db-gray-100 text-db-gray-400 disabled:opacity-30"><ChevronUp size={14} /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="p-1.5 rounded-lg hover:bg-db-gray-100 text-db-gray-400 disabled:opacity-30"><ChevronDown size={14} /></button>
                <button onClick={() => toggleActive(section)} title={section.isActive ? 'Hide' : 'Show'} className="p-1.5 rounded-lg hover:bg-db-gray-100 text-db-gray-400">
                  {section.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => { setEditId(section.id); setEditForm(section) }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-gray-100 text-db-gray-600 text-xs font-semibold border border-db-gray-200 hover:bg-db-gray-200"><Edit2 size={12} /></button>
                <button onClick={() => deleteSection(section.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-db-red text-xs font-semibold border border-red-200 hover:bg-red-100"><Trash2 size={12} /></button>
              </div>
            </div>

            {editId === section.id && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-db-gray-600 mb-1">Title</label>
                  <input className="db-input" value={editForm.title ?? ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-db-gray-600 mb-1">Content</label>
                  <textarea className="db-input resize-none" rows={6} value={editForm.content ?? ''} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(section.id)} disabled={loading} className="btn-teal disabled:opacity-50">Save</button>
                  <button onClick={() => setEditId(null)} className="btn-ghost">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {showAdd ? (
        <div className="db-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-db-black">Add Section to {hb === 'OFFICE' ? 'Office' : 'Retail'} Handbook</h3>
          <div>
            <label className="block text-xs font-medium text-db-gray-600 mb-1">Title</label>
            <input className="db-input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Section title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-db-gray-600 mb-1">Content</label>
            <textarea className="db-input resize-none" rows={6} value={addForm.content} onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))} placeholder="Section content..." />
          </div>
          <div className="flex gap-2">
            <button onClick={addSection} disabled={loading} className="btn-teal disabled:opacity-50">Add Section</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-db-mint-light text-db-teal text-sm font-semibold border border-db-mint hover:bg-db-mint transition-colors">
          <Plus size={15} /> Add Section
        </button>
      )}
    </div>
  )
}

// ─── Main ContentManager ──────────────────────────────────────────────────────

type Tab = 'contacts' | 'hours' | 'announcements' | 'handbook'

const TABS: { key: Tab; label: string }[] = [
  { key: 'contacts',      label: 'Staff Contacts'   },
  { key: 'hours',         label: 'Building Hours'   },
  { key: 'announcements', label: 'Announcements'    },
  { key: 'handbook',      label: 'Handbook'         },
]

export function ContentManager({
  initialContacts,
  initialHours,
  initialAnnouncements,
  initialOfficeSections,
  initialRetailSections,
}: {
  initialContacts: StaffContact[]
  initialHours: BuildingHours[]
  initialAnnouncements: Announcement[]
  initialOfficeSections: HandbookSection[]
  initialRetailSections: HandbookSection[]
}) {
  const [tab, setTab] = useState<Tab>('contacts')

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-2xl font-bold text-db-black">Content Management</h1>
        <p className="text-sm text-db-gray-500 mt-1">Edit site content without touching code. Changes go live immediately.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-db-gray-50 rounded-xl p-1 w-fit border border-db-gray-100 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-white text-db-black shadow-sm border border-db-gray-100'
                : 'text-db-gray-400 hover:text-db-gray-600'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'contacts'      && <ContactsTab contacts={initialContacts} />}
        {tab === 'hours'         && <HoursTab hours={initialHours} />}
        {tab === 'announcements' && <AnnouncementsTab announcements={initialAnnouncements} />}
        {tab === 'handbook'      && <HandbookTab officeSections={initialOfficeSections} retailSections={initialRetailSections} />}
      </div>
    </div>
  )
}
