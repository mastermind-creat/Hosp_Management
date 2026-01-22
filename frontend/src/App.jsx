import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser } from './store/slices/authSlice'
import { useTranslation } from 'react-i18next'
import api from './services/api'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import PatientList from './pages/patients/PatientList'
import PatientForm from './pages/patients/PatientForm'
import PatientProfile from './pages/patients/PatientProfile'
import EncounterForm from './pages/clinical/EncounterForm'
import ClinicalQueue from './pages/clinical/ClinicalQueue'

// Billing Pages
import InvoiceList from './pages/billing/InvoiceList'
import InvoiceDetail from './pages/billing/InvoiceDetail'
import InvoiceForm from './pages/billing/InvoiceForm'

// Pharmacy Pages
import Inventory from './pages/pharmacy/Inventory'

// Lab Pages
import LabDashboard from './pages/lab/LabDashboard'
import LabRequestForm from './pages/lab/LabRequestForm'
import ResultEntry from './pages/lab/ResultEntry'

// Admin & Report Pages
import UserList from './pages/users/UserList'
import AuditTrail from './pages/users/AuditTrail'
import ReportsDashboard from './pages/reports/ReportsDashboard'

// Staff & HR Pages
import StaffList from './pages/staff/StaffList'
import StaffForm from './pages/staff/StaffForm'
import DepartmentSetup from './pages/staff/DepartmentSetup'

// Appointment Pages
import AppointmentsCalendar from './pages/appointments/AppointmentsCalendar'

// Insurance Pages
import InsuranceDashboard from './pages/insurance/InsuranceDashboard'

// System Pages
import BackupSettings from './pages/admin/BackupSettings'
import SystemLogs from './pages/admin/SystemLogs'
import SystemSettings from './pages/admin/SystemSettings'
import ClinicalTemplates from './pages/admin/ClinicalTemplates'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth)
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

function App() {
    const dispatch = useDispatch()
    const { t, i18n } = useTranslation()
    const { isAuthenticated, user } = useSelector((state) => state.auth)
    const { theme } = useSelector((state) => state.ui)

    useEffect(() => {
        // Apply theme on mount and change
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    useEffect(() => {
        // Get current user if authenticated
        if (isAuthenticated && !user) {
            dispatch(getCurrentUser())
        }
    }, [isAuthenticated, user, dispatch])

    useEffect(() => {
        const initSystemSettings = async () => {
            try {
                const response = await api.get('/settings/public-config');
                const config = response.data;

                // Set language if not already set by user
                if (config.system_language?.value && !localStorage.getItem('i18nextLng')) {
                    i18n.changeLanguage(config.system_language.value);
                }
            } catch (error) {
                console.error('Failed to load system config', error);
            }
        };
        initSystemSettings();
    }, [i18n]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: 'dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700',
                    style: {
                        borderRadius: '12px',
                    },
                }}
            />

            <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Patient Routes */}
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patients/new" element={<PatientForm />} />
                    <Route path="/patients/:id" element={<PatientProfile />} />
                    <Route path="/patients/:id/edit" element={<PatientForm />} />
                    <Route path="/patients/:patientId/encounter" element={<EncounterForm />} />

                    {/* Clinical Routes */}
                    <Route path="/clinical" element={<ClinicalQueue />} />
                    <Route path="/clinical/encounters/:patientId" element={<EncounterForm />} />
                    <Route path="/clinical/encounters/:patientId/edit/:encounterId" element={<EncounterForm />} />

                    {/* Staff & HR Routes */}
                    <Route path="/staff" element={<StaffList />} />
                    <Route path="/staff/new" element={<StaffForm />} />
                    <Route path="/staff/edit/:id" element={<StaffForm />} />
                    <Route path="/staff/structure" element={<DepartmentSetup />} />

                    {/* Appointment Routes */}
                    <Route path="/appointments" element={<AppointmentsCalendar />} />

                    {/* Billing Routes ... */}
                    <Route path="/billing" element={<InvoiceList />} />
                    <Route path="/billing/new" element={<InvoiceForm />} />
                    <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
                    <Route path="/pharmacy" element={<Inventory />} />

                    {/* Lab Routes ... */}
                    <Route path="/lab" element={<LabDashboard />} />
                    <Route path="/lab/requests/new" element={<LabRequestForm />} />
                    <Route path="/lab/requests/:id/results" element={<ResultEntry />} />

                    {/* Insurance Routes */}
                    <Route path="/insurance" element={<InsuranceDashboard />} />

                    {/* Admin & System Routes */}
                    <Route path="/admin/users" element={<UserList />} />
                    <Route path="/admin/audit" element={<AuditTrail />} />
                    <Route path="/admin/backups" element={<BackupSettings />} />
                    <Route path="/admin/system-logs" element={<SystemLogs />} />
                    <Route path="/admin/clinical-templates" element={<ClinicalTemplates />} />
                    <Route path="/settings" element={<SystemSettings />} />
                    <Route path="/reports" element={<ReportsDashboard />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
