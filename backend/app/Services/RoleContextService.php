<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\RoleContextLog;
use App\Models\HospitalConfig;
use Illuminate\Support\Facades\Auth;

class RoleContextService
{
    /**
     * Switch user's active role context.
     *
     * @param User $user
     * @param Role $role
     * @return array
     * @throws \Exception
     */
    public function switchRole(User $user, Role $role): array
    {
        // Verify user has this role
        if (!$user->roles->contains($role->id)) {
            throw new \Exception('User does not have this role assigned.');
        }

        // Get hospital config
        $config = HospitalConfig::current();

        // Check if multi-role is allowed
        if (!$config->allow_multi_role_users && $user->roles->count() > 1) {
            throw new \Exception('Multi-role users are not allowed in current hospital configuration.');
        }

        // Get current role from session/token (if exists)
        $currentRole = session('active_role_id') ? Role::find(session('active_role_id')) : null;

        // Log the role switch
        $this->logRoleSwitch($user, $currentRole, $role);

        // Update session with new active role
        session(['active_role_id' => $role->id]);

        return [
            'active_role' => $role,
            'switched_at' => now(),
            'message' => "Switched to {$role->display_name} role",
        ];
    }

    /**
     * Get user's available roles.
     *
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailableRoles(User $user)
    {
        return $user->roles()->where('is_active', true)->get();
    }

    /**
     * Get user's current active role.
     *
     * @param User $user
     * @return Role|null
     */
    public function getActiveRole(User $user): ?Role
    {
        $activeRoleId = session('active_role_id');
        
        if ($activeRoleId) {
            return Role::find($activeRoleId);
        }

        // Default to first role if no active role set
        $firstRole = $user->roles()->where('is_active', true)->first();
        if ($firstRole) {
            session(['active_role_id' => $firstRole->id]);
            return $firstRole;
        }

        return null;
    }

    /**
     * Check if user can perform action with current role.
     *
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function canPerformAction(User $user, string $permission): bool
    {
        $activeRole = $this->getActiveRole($user);

        if (!$activeRole) {
            return false;
        }

        return $activeRole->permissions()->where('name', $permission)->exists();
    }

    /**
     * Validate if current role has permission for action.
     *
     * @param User $user
     * @param string $permission
     * @return bool
     * @throws \Exception
     */
    public function validateRoleForAction(User $user, string $permission): bool
    {
        $config = HospitalConfig::current();

        // If role switching is not required, check all user's roles
        if (!$config->require_role_switching) {
            return $user->hasPermission($permission);
        }

        // Otherwise, check only active role
        if (!$this->canPerformAction($user, $permission)) {
            $activeRole = $this->getActiveRole($user);
            $roleName = $activeRole ? $activeRole->display_name : 'current role';
            throw new \Exception("Your {$roleName} does not have permission to perform this action.");
        }

        return true;
    }

    /**
     * Get required role for a specific permission.
     *
     * @param string $permission
     * @return Role|null
     */
    public function getRequiredRoleForPermission(string $permission): ?Role
    {
        return Role::whereHas('permissions', function ($query) use ($permission) {
            $query->where('name', $permission);
        })->first();
    }

    /**
     * Log role switch for audit trail.
     *
     * @param User $user
     * @param Role|null $fromRole
     * @param Role $toRole
     * @return RoleContextLog
     */
    protected function logRoleSwitch(User $user, ?Role $fromRole, Role $toRole): RoleContextLog
    {
        return RoleContextLog::create([
            'user_id' => $user->id,
            'from_role_id' => $fromRole?->id,
            'to_role_id' => $toRole->id,
            'switched_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
        ]);
    }

    /**
     * Get role switching history for a user.
     *
     * @param User $user
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRoleSwitchHistory(User $user, int $limit = 50)
    {
        return RoleContextLog::where('user_id', $user->id)
            ->with(['fromRole', 'toRole'])
            ->orderBy('switched_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
