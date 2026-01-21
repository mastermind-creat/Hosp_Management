import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Pill,
    FlaskConical,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    Wifi,
    WifiOff,
    Fingerprint
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store/slices/uiSlice'

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { theme } = useSelector((state) => state.ui)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Billing', path: '/billing', icon: FileText },
        { name: 'Pharmacy', path: '/pharmacy', icon: Pill },
        { name: 'Laboratory', path: '/lab', icon: FlaskConical },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Staff', path: '/admin/users', icon: Users },
        { name: 'Audit', path: '/admin/audit', icon: Fingerprint },
    ]

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors z-30"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="bg-indigo-600 p-1.5 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    {isSidebarOpen && (
                        <span className="font-bold text-lg text-slate-800 dark:text-white truncate">Hospital Manager</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm shadow-indigo-100 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:scale-110 transition-transform'}`} />
                                {isSidebarOpen && <span className="ml-3 truncate">{item.name}</span>}
                                {isActive && isSidebarOpen && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 mr-4 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-md group focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all">
                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Search patients, invoices, tests..."
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full dark:text-white dark:placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Offline Indicator */}
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${isOnline
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                            {isOnline ? (
                                <><Wifi className="w-3 h-3 mr-1.5" /> Online</>
                            ) : (
                                <><WifiOff className="w-3 h-3 mr-1.5" /> Offline Mode</>
                            )}
                        </div>

                        <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg relative transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                        </button>

                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l.707.707M6.343 6.343l.707.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        <div className="flex items-center space-x-3 pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                    {user?.name || 'Medical Officer'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                                    {user?.role?.name || 'Staff'}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-7xl mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default MainLayout
