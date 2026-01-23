<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;
use App\Models\HospitalConfig;
use App\Services\RoleContextService;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required_without:username|email',
            'username' => 'required_without:email|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only(['password']);
        
        if ($request->has('email')) {
            $credentials['email'] = $request->email;
        } else {
            $credentials['username'] = $request->username;
        }

        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Update last_login_at
        $user = auth()->user();
        $user->last_login_at = now();
        $user->save();

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        $user = auth()->user()->load(['roles.permissions']);
        $roleService = new RoleContextService();
        $config = HospitalConfig::current();
        
        // Get active role and available roles
        $activeRole = $roleService->getActiveRole($user);
        $availableRoles = $roleService->getAvailableRoles($user);
        
        // Flatten permissions for easier frontend consumption
        $permissions = $user->roles->flatMap(function ($role) {
            return $role->permissions->pluck('name');
        })->unique()->values();

        return response()->json([
            'user' => $user,
            'permissions' => $permissions,
            'active_role' => $activeRole,
            'available_roles' => $availableRoles,
            'hospital_mode' => $config->hospital_mode,
            'can_switch_roles' => $config->allow_multi_role_users && $availableRoles->count() > 1,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        $user = auth()->user()->load(['roles.permissions']);
        $roleService = new RoleContextService();
        $config = HospitalConfig::current();
        
        // Get active role and available roles
        $activeRole = $roleService->getActiveRole($user);
        $availableRoles = $roleService->getAvailableRoles($user);
        
        $permissions = $user->roles->flatMap(function ($role) {
            return $role->permissions->pluck('name');
        })->unique()->values();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => $user,
            'permissions' => $permissions,
            'active_role' => $activeRole,
            'available_roles' => $availableRoles,
            'hospital_mode' => $config->hospital_mode,
            'can_switch_roles' => $config->allow_multi_role_users && $availableRoles->count() > 1,
        ]);
    }

    /**
     * Switch user's active role context.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function switchRole(Request $request)
    {
        $request->validate([
            'role_id' => 'required|uuid|exists:roles,id',
        ]);

        try {
            $user = auth()->user();
            $role = Role::findOrFail($request->role_id);
            $roleService = new RoleContextService();

            $result = $roleService->switchRole($user, $role);

            return response()->json([
                'message' => $result['message'],
                'active_role' => $result['active_role'],
                'switched_at' => $result['switched_at'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 403);
        }
    }
}
