import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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
    Fingerprint,
    Briefcase,
    Building2,
    Activity,
    ShieldCheck,
    Database,
    ScrollText,
    ClipboardList
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store/slices/uiSlice'
import api from '../../services/api'
import NotificationsPanel from '../common/NotificationsPanel'

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showNotifications, setShowNotifications] = useState(false)
    const [alerts, setAlerts] = useState(null)
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, permissions = [] } = useSelector((state) => state.auth)
    const { theme } = useSelector((state) => state.ui)
    const { t } = useTranslation()

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Notification polling
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications')
                setAlerts(response.data)
            } catch (error) {
                console.error('Failed to fetch notifications')
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    const navItems = [
        { name: t('common.dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('common.patients'), path: '/patients', icon: Users, permission: 'view_patients' },
        { name: t('common.appointments'), path: '/appointments', icon: Calendar, permission: 'view_appointments' },
        { name: t('common.clinical'), path: '/clinical', icon: Activity, permission: 'view_visits' },
        { name: t('common.billing'), path: '/billing', icon: FileText, permission: 'view_invoices' },
        { name: t('common.pharmacy'), path: '/pharmacy', icon: Pill, permission: 'view_drugs' },
        { name: t('common.laboratory'), path: '/lab', icon: FlaskConical, permission: 'view_lab_requests' },
        { name: t('common.staff_hr'), path: '/staff', icon: Briefcase, permission: 'manage_staff' },
        { name: t('common.hospital_structure'), path: '/staff/structure', icon: Building2, permission: 'manage_departments' },
        { name: t('common.insurance'), path: '/insurance', icon: ShieldCheck, permission: 'manage_insurance' },
        { name: t('common.reports'), path: '/reports', icon: BarChart3, permission: 'view_reports' },
        { name: t('common.audit_trail'), path: '/admin/audit', icon: Fingerprint, permission: 'view_audit_trail' },
        { name: t('common.system_tools'), path: '/admin/backups', icon: Database, permission: 'view_audit_trail' },
        { name: t('common.clinical_templates'), path: '/admin/clinical-templates', icon: ClipboardList, permission: 'manage_departments' },
        { name: t('common.system_logs'), path: '/admin/system-logs', icon: ScrollText, permission: 'view_audit_trail' },
        { name: t('common.settings'), path: '/settings', icon: Settings },
    ]

    const filteredNavItems = navItems.filter(item =>
        !item.permission || permissions.includes(item.permission)
    )

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
                className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors z-30 no-print"
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
                    {filteredNavItems.map((item) => {
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
                        {isSidebarOpen && <span className="ml-3 font-medium">{t('common.sign_out')}</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20 no-print">
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
                                placeholder={t('common.search_placeholder')}
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
                                <><Wifi className="w-3 h-3 mr-1.5" /> {t('common.online')}</>
                            ) : (
                                <><WifiOff className="w-3 h-3 mr-1.5" /> {t('common.offline')}</>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg relative transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {alerts?.counts > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                )}
                            </button>
                            {showNotifications && (
                                <NotificationsPanel
                                    alerts={alerts}
                                    onClose={() => setShowNotifications(false)}
                                />
                            )}
                        </div>

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
