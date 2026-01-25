import { useState, useEffect } from 'react'
import { Search, Plus, X, FlaskConical } from 'lucide-react'
import api from '../../services/api'
import { formatKES } from '../../utils/format'

const LabTestSelector = ({ selectedTests = [], onTestsChange }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [allTests, setAllTests] = useState([])
    const [filteredTests, setFilteredTests] = useState([])
    const [loading, setLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        fetchAllTests()
    }, [])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredTests(allTests)
            return
        }

        const filtered = allTests.filter(test =>
            test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredTests(filtered)
    }, [searchQuery, allTests])

    const fetchAllTests = async () => {
        setLoading(true)
        try {
            const response = await api.get('/lab/tests', { params: { limit: 100 } })
            setAllTests(response.data.data || response.data)
            setFilteredTests(response.data.data || response.data)
        } catch (error) {
            console.error('Failed to fetch tests:', error)
        } finally {
            setLoading(false)
        }
    }

    const addTest = (test) => {
        if (!selectedTests.find(t => t.id === test.id)) {
            onTestsChange([...selectedTests, test])
        }
    }

    const removeTest = (testId) => {
        onTestsChange(selectedTests.filter(t => t.id !== testId))
    }

    // Group tests by category
    const groupedData = filteredTests.reduce((acc, test) => {
        const cat = test.category || 'General'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(test)
        return acc
    }, {})

    return (
        <div className="space-y-4">
            {/* Search & Toggle */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            if (e.target.value) setIsExpanded(true)
                        }}
                        onFocus={() => setIsExpanded(true)}
                        placeholder="Search or select tests..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 outline-none dark:text-white"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isExpanded
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                >
                    {isExpanded ? 'Hide List' : 'Browse All'}
                </button>
            </div>

            {/* Selection Area */}
            {isExpanded && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden max-h-[400px] flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Laboratory Tests</span>
                        {loading && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {Object.keys(groupedData).length > 0 ? (
                            Object.entries(groupedData).map(([category, items]) => (
                                <div key={category} className="mb-4 last:mb-0">
                                    <div className="px-3 py-1 mb-1">
                                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tighter">{category}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                        {items.map((test) => {
                                            const isSelected = selectedTests.some(t => t.id === test.id)
                                            return (
                                                <button
                                                    key={test.id}
                                                    type="button"
                                                    onClick={() => isSelected ? removeTest(test.id) : addTest(test)}
                                                    className={`text-left p-3 rounded-xl transition-all flex items-center justify-between group ${isSelected
                                                            ? 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 border'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-bold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>{test.test_name}</p>
                                                        <p className="text-[10px] text-slate-500">{formatKES(test.price)}</p>
                                                    </div>
                                                    {isSelected ? (
                                                        <X className="w-4 h-4 text-purple-500" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-500">No tests found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Summary (Mini View) */}
            {selectedTests.length > 0 && !isExpanded && (
                <div className="flex flex-wrap gap-2">
                    {selectedTests.map((test) => (
                        <div key={test.id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800">
                            <FlaskConical className="w-3 h-3" />
                            {test.test_name}
                            <button type="button" onClick={() => removeTest(test.id)} className="hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default LabTestSelector
