import { useState } from 'react'
import { useRoleContext } from '../hooks/useRoleContext'
import { ChevronDown, Check, RefreshCw } from 'lucide-react'

/**
 * RoleSwitcher Component
 * Allows users with multiple roles to switch between them
 */
const RoleSwitcher = () => {
    const {
        activeRole,
        availableRoles,
        canSwitchRoles,
        roleSwitching,
        switchRole,
    } = useRoleContext()

    const [isOpen, setIsOpen] = useState(false)

    if (!canSwitchRoles || availableRoles.length <= 1) {
        return null
    }

    const handleRoleSwitch = async (roleId) => {
        const result = await switchRole(roleId)
        if (result.success) {
            setIsOpen(false)
        }
    }

    const getRoleColor = (roleName) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800 border-purple-300',
            doctor: 'bg-blue-100 text-blue-800 border-blue-300',
            nurse: 'bg-green-100 text-green-800 border-green-300',
            pharmacist: 'bg-orange-100 text-orange-800 border-orange-300',
            lab_tech: 'bg-teal-100 text-teal-800 border-teal-300',
            accountant: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            receptionist: 'bg-pink-100 text-pink-800 border-pink-300',
        }
        return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-300'
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={roleSwitching}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${activeRole ? getRoleColor(activeRole.name) : 'bg-gray-100 text-gray-800 border-gray-300'
                    } hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {roleSwitching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                )}
                <span className="font-medium">
                    {activeRole?.display_name || 'Select Role'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                        <div className="p-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Switch Role
                            </p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {availableRoles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSwitch(role.id)}
                                    disabled={roleSwitching || role.id === activeRole?.id}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${role.id === activeRole?.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${getRoleColor(role.name).split(' ')[0]}`} />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">
                                                {role.display_name}
                                            </p>
                                            {role.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {role.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {role.id === activeRole?.id && (
                                        <Check className="w-5 h-5 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                Actions will be logged with your active role
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default RoleSwitcher
