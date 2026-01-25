import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, FlaskConical, Save, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { formatKES } from '../../utils/format'

const LabTestManagement = () => {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingTest, setEditingTest] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [formData, setFormData] = useState({
        test_name: '',
        test_code: '',
        category: 'Hematology',
        description: '',
        price: '',
        sample_type: '',
        turnaround_time: '',
        is_active: true
    })

    const categories = ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Urinalysis', 'Other']

    useEffect(() => {
        fetchTests()
    }, [searchQuery])

    const fetchTests = async () => {
        setLoading(true)
        try {
            const response = await api.get('/lab/tests', { params: { search: searchQuery, limit: 100 } })
            setTests(response.data.data || response.data)
        } catch (error) {
            toast.error('Failed to load tests')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingTest) {
                await api.put(`/lab/tests/${editingTest.id}`, formData)
                toast.success('Test updated successfully')
            } else {
                await api.post('/lab/tests', formData)
                toast.success('Test created successfully')
            }
            setIsModalOpen(false)
            resetForm()
            fetchTests()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save test')
        }
    }

    const handleEdit = (test) => {
        setEditingTest(test)
        setFormData({
            test_name: test.test_name,
            test_code: test.test_code || '',
            category: test.category || 'Hematology',
            description: test.description || '',
            price: test.price,
            sample_type: test.sample_type || '',
            turnaround_time: test.turnaround_time || '',
            is_active: test.is_active
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this test?')) return

        try {
            await api.delete(`/lab/tests/${id}`)
            toast.success('Test deleted successfully')
            fetchTests()
        } catch (error) {
            toast.error('Failed to delete test')
        }
    }

    const resetForm = () => {
        setFormData({
            test_name: '',
            test_code: '',
            category: 'Hematology',
            description: '',
            price: '',
            sample_type: '',
            turnaround_time: '',
            is_active: true
        })
        setEditingTest(null)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lab Test Management</h1>
                    <p className="text-sm text-slate-500">Manage laboratory tests and pricing</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Test
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tests..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                />
            </div>

            {/* Tests Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Test Name</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Code</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Price</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tests.map((test) => (
                            <tr key={test.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{test.test_name}</p>
                                            {test.description && <p className="text-xs text-slate-500">{test.description}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{test.test_code}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                                        {test.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatKES(test.price)}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${test.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {test.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(test)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(test.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingTest ? 'Edit Test' : 'Add New Test'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Test Name</label>
                                <input
                                    type="text"
                                    value={formData.test_name}
                                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Test Code</label>
                                <input
                                    type="text"
                                    value={formData.test_code}
                                    onChange={(e) => setFormData({ ...formData, test_code: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price (KES)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Sample Type</label>
                                <input
                                    type="text"
                                    value={formData.sample_type}
                                    onChange={(e) => setFormData({ ...formData, sample_type: e.target.value })}
                                    placeholder="e.g., Blood, Urine"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Turnaround Time</label>
                                <input
                                    type="text"
                                    value={formData.turnaround_time}
                                    onChange={(e) => setFormData({ ...formData, turnaround_time: e.target.value })}
                                    placeholder="e.g., 2 hours, 24 hours"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">Active</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LabTestManagement
