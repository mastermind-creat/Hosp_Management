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
    ClipboardList,
    Calculator,
    ChevronDown,
    ChevronRight,
    Stethoscope,
    DollarSign
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store/slices/uiSlice'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import NotificationsPanel from '../common/NotificationsPanel'
import RoleSwitcher from '../RoleSwitcher'

const NavDropdown = ({ label, icon: Icon, items, isOpen, onToggle, isSidebarOpen, currentPath, permissions }) => {
    const filteredItems = items.filter(item =>
        !item.permission || permissions.includes(item.permission)
    )

    if (filteredItems.length === 0) return null

    const isActive = filteredItems.some(item => currentPath.startsWith(item.path))

    return (
        <div>
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    {isSidebarOpen && <span>{label}</span>}
                </div>
                {isSidebarOpen && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && isSidebarOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-700 pl-4">
                            {filteredItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${currentPath === item.path
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showNotifications, setShowNotifications] = useState(false)
    const [alerts, setAlerts] = useState(null)
    const [openDropdowns, setOpenDropdowns] = useState(['clinical', 'administration'])
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, permissions = [] } = useSelector((state) => state.auth)
    const { theme, compactMode } = useSelector((state) => state.ui)
    const { t } = useTranslation()

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Connection restored', {
                icon: '🌐',
                style: {
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#1e293b',
                },
            })
        }
        const handleOffline = () => {
            setIsOnline(false)
            toast.error('Connection lost', {
                icon: '📡',
                style: {
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#1e293b',
                },
            })
        }

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
    }, [theme])

    const toggleDropdown = (key) => {
        setOpenDropdowns(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    const navigationGroups = [
        {
            key: 'main',
            items: [
                { name: t('common.dashboard'), path: '/dashboard', icon: LayoutDashboard },
                { name: t('common.patients'), path: '/patients', icon: Users, permission: 'view_patients' },
                { name: t('common.appointments'), path: '/appointments', icon: Calendar, permission: 'view_appointments' },
            ]
        },
        {
            key: 'clinical',
            label: 'Clinical',
            icon: Stethoscope,
            items: [
                { name: t('common.clinical'), path: '/clinical', icon: Activity, permission: 'view_visits' },
                { name: t('common.pharmacy'), path: '/pharmacy', icon: Pill, permission: 'view_drugs' },
                { name: t('common.laboratory'), path: '/lab', icon: FlaskConical, permission: 'view_lab_requests' },
            ]
        },
        {
            key: 'billing',
            label: 'Billing & Finance',
            icon: DollarSign,
            items: [
                { name: t('common.billing'), path: '/billing', icon: FileText, permission: 'view_invoices' },
                { name: t('common.insurance'), path: '/insurance', icon: ShieldCheck, permission: 'manage_insurance' },
                { name: t('common.reports'), path: '/reports', icon: BarChart3, permission: 'view_reports' },
            ]
        },
        {
            key: 'administration',
            label: 'Administration',
            icon: Building2,
            items: [
                { name: t('common.staff_hr'), path: '/staff', icon: Briefcase, permission: 'manage_staff' },
                { name: t('common.hospital_structure'), path: '/staff/structure', icon: Building2, permission: 'manage_departments' },
                { name: 'Services', path: '/admin/services', icon: Stethoscope, permission: 'manage_roles' },
                { name: 'Lab Tests', path: '/admin/lab-tests', icon: FlaskConical, permission: 'manage_roles' },
                { name: t('common.clinical_templates'), path: '/admin/clinical-templates', icon: ClipboardList, permission: 'manage_departments' },
                { name: 'Hospital Config', path: '/admin/hospital-config', icon: Building2, permission: 'manage_roles' },
            ]
        },
        {
            key: 'system',
            label: 'System',
            icon: Settings,
            items: [
                { name: t('common.audit_trail'), path: '/admin/audit', icon: Fingerprint, permission: 'view_audit_trail' },
                { name: t('common.system_tools'), path: '/admin/backups', icon: Database, permission: 'view_audit_trail' },
                { name: t('common.system_logs'), path: '/admin/system-logs', icon: ScrollText, permission: 'view_audit_trail' },
                { name: t('common.settings'), path: '/settings', icon: Settings },
            ]
        },
    ]

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex ${compactMode ? 'text-sm' : ''}`}>
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? (compactMode ? 240 : 280) : 80 }}
                className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors z-30 no-print"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="bg-indigo-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-indigo-100 dark:shadow-none">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    {isSidebarOpen && (
                        <span className="font-bold text-lg text-slate-800 dark:text-white truncate tracking-tight">Hospital Manager</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navigationGroups.map((group) => {
                        if (group.key === 'main') {
                            // Render main items without dropdown
                            return group.items
                                .filter(item => !item.permission || permissions.includes(item.permission))
                                .map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        {isSidebarOpen && <span className="truncate">{item.name}</span>}
                                    </Link>
                                ))
                        }

                        return (
                            <NavDropdown
                                key={group.key}
                                label={group.label}
                                icon={group.icon}
                                items={group.items}
                                isOpen={openDropdowns.includes(group.key)}
                                onToggle={() => toggleDropdown(group.key)}
                                isSidebarOpen={isSidebarOpen}
                                currentPath={location.pathname}
                                permissions={permissions}
                            />
                        )
                    })}
                </nav>

                {/* User Profile & Controls */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-4 space-y-3">
                    {/* Online Status */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isOnline ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        {isOnline ? (
                            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        {isSidebarOpen && (
                            <span className={`text-xs font-medium ${isOnline ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                }`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        )}
                    </div>

                    {/* User Info */}
                    {isSidebarOpen && user && (
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 no-print">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <RoleSwitcher />

                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? '🌞' : '🌙'}
                        </button>

                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            {alerts && alerts.unread_count > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <NotificationsPanel
                    onClose={() => setShowNotifications(false)}
                    alerts={alerts}
                />
            )}
        </div>
    )
}

export default MainLayout
