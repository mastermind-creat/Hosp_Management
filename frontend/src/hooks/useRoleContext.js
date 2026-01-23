import { useSelector, useDispatch } from 'react-redux'
import { switchRole } from '../store/slices/authSlice'

/**
 * Custom hook for managing role context
 */
export const useRoleContext = () => {
    const dispatch = useDispatch()
    const {
        activeRole,
        availableRoles,
        canSwitchRoles,
        roleSwitching,
        permissions,
        hospitalMode
    } = useSelector((state) => state.auth)

    /**
     * Switch to a different role
     */
    const handleSwitchRole = async (roleId) => {
        try {
            await dispatch(switchRole(roleId)).unwrap()
            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    /**
     * Check if current role can perform an action
     */
    const canPerform = (permission) => {
        return permissions.includes(permission)
    }

    /**
     * Check if action requires a different role
     */
    const requiresRoleSwitch = (permission) => {
        if (!canPerform(permission)) {
            // Find which role has this permission
            const requiredRole = availableRoles.find(role =>
                role.permissions?.some(p => p.name === permission)
            )
            return requiredRole || null
        }
        return null
    }

    /**
     * Check if user has a specific role
     */
    const hasRole = (roleName) => {
        return availableRoles.some(role => role.name === roleName)
    }

    /**
     * Check if currently in compact mode
     */
    const isCompactMode = () => {
        return hospitalMode === 'COMPACT'
    }

    return {
        activeRole,
        availableRoles,
        canSwitchRoles,
        roleSwitching,
        switchRole: handleSwitchRole,
        canPerform,
        requiresRoleSwitch,
        hasRole,
        isCompactMode,
        hospitalMode,
    }
}
