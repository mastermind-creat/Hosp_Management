import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import api from '../../services/api'

const DrugSelector = ({ value, onChange, onSelect, placeholder = "Search for a drug...", className = "" }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [touched, setTouched] = useState(false)
    const containerRef = useRef(null)

    // Sync query with initial value or incoming changes
    useEffect(() => {
        if (value && !touched) {
            setQuery(value)
        }
    }, [value, touched])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const searchDrugs = async () => {
            if (!query || query.length < 1 || !isOpen) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await api.get('/drugs', {
                    params: { search: query, limit: 10 }
                })
                // Extract from pagination structure
                const drugs = res.data.data || res.data
                setResults(drugs)
            } catch (err) {
                console.error('Drug search error:', err)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(searchDrugs, 300)
        return () => clearTimeout(timeoutId)
    }, [query, isOpen])

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                        setTouched(true)
                    }}
                    onFocus={() => {
                        setIsOpen(true)
                        if (query.length === 0) {
                            // Fetch defaults if empty on focus
                            setQuery(' ')
                            setTimeout(() => setQuery(''), 10)
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && (results.length > 0 || (query.length >= 1 && !loading)) && (
                <div className="absolute z-50 w-[150%] left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto py-2">
                    {results.length > 0 ? (
                        results.map((drug) => (
                            <button
                                key={drug.id}
                                type="button"
                                onMouseDown={(e) => {
                                    // Prevent the input from losing focus immediately which could trigger blur
                                    e.preventDefault()
                                    const drugNameCap = drug.generic_name
                                    setQuery(drugNameCap)
                                    onChange(drugNameCap)
                                    if (onSelect) onSelect(drug)
                                    setIsOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-sm transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 pointer-events-auto"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 dark:text-slate-100">{drug.generic_name}</span>
                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Ksh {drug.unit_price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {drug.brand_name && <span className="text-[10px] text-slate-400">Brand: {drug.brand_name}</span>}
                                        {drug.strength && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold">{drug.strength}</span>}
                                        {drug.category && <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{drug.category}</span>}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-xs text-slate-400">No drugs matches found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DrugSelector
