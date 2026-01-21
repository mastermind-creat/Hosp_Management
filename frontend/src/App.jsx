import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser } from './store/slices/authSlice'

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
                    <Route path="/clinical/encounters/:patientId" element={<EncounterForm />} />

                    {/* Placeholder for other routes */}
                    <Route path="/appointments" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold dark:text-white">Appointments Module Coming Soon</h2></div>} />
                    {/* Billing Routes */}
                    <Route path="/billing" element={<InvoiceList />} />
                    <Route path="/billing/new" element={<InvoiceForm />} />
                    <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
                    <Route path="/pharmacy" element={<Inventory />} />

                    {/* Lab Routes */}
                    <Route path="/lab" element={<LabDashboard />} />
                    <Route path="/lab/requests/new" element={<LabRequestForm />} />
                    <Route path="/lab/requests/:id/results" element={<ResultEntry />} />
                    {/* Admin & System Routes */}
                    <Route path="/admin/users" element={<UserList />} />
                    <Route path="/admin/audit" element={<AuditTrail />} />
                    <Route path="/reports" element={<ReportsDashboard />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
