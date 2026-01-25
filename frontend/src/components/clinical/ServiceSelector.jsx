import { useState, useEffect } from 'react'
import { Search, Plus, X, Stethoscope } from 'lucide-react'
import api from '../../services/api'
import { formatKES } from '../../utils/format'

const ServiceSelector = ({ selectedServices = [], onServicesChange }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [allServices, setAllServices] = useState([])
    const [filteredServices, setFilteredServices] = useState([])
    const [loading, setLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        fetchAllServices()
    }, [])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredServices(allServices)
            return
        }

        const filtered = allServices.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredServices(filtered)
    }, [searchQuery, allServices])

    const fetchAllServices = async () => {
        setLoading(true)
        try {
            const response = await api.get('/services', { params: { limit: 100 } })
            setAllServices(response.data.data || response.data)
            setFilteredServices(response.data.data || response.data)
        } catch (error) {
            console.error('Failed to fetch services:', error)
        } finally {
            setLoading(false)
        }
    }

    const addService = (service) => {
        if (!selectedServices.find(s => s.id === service.id)) {
            onServicesChange([...selectedServices, service])
        }
    }

    const removeService = (serviceId) => {
        onServicesChange(selectedServices.filter(s => s.id !== serviceId))
    }

    // Group services by category
    const groupedData = filteredServices.reduce((acc, service) => {
        const cat = service.category || 'General'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(service)
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
                        placeholder="Search or select services..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isExpanded
                            ? 'bg-blue-600 text-white border-blue-600'
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Services & Procedures</span>
                        {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {Object.keys(groupedData).length > 0 ? (
                            Object.entries(groupedData).map(([category, items]) => (
                                <div key={category} className="mb-4 last:mb-0">
                                    <div className="px-3 py-1 mb-1">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{category}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                        {items.map((service) => {
                                            const isSelected = selectedServices.some(s => s.id === service.id)
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => isSelected ? removeService(service.id) : addService(service)}
                                                    className={`text-left p-3 rounded-xl transition-all flex items-center justify-between group ${isSelected
                                                            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 border'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{service.name}</p>
                                                        <p className="text-[10px] text-slate-500">{formatKES(service.price)}</p>
                                                    </div>
                                                    {isSelected ? (
                                                        <X className="w-4 h-4 text-blue-500" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-500">No services found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Summary (Mini View) */}
            {selectedServices.length > 0 && !isExpanded && (
                <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                        <div key={service.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                            <Stethoscope className="w-3 h-3" />
                            {service.name}
                            <button type="button" onClick={() => removeService(service.id)} className="hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ServiceSelector
