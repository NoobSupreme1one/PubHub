// User roles
export enum UserRole {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin'
}

// Permission types
export enum Permission {
  // Campaign permissions
  CREATE_CAMPAIGN = 'create_campaign',
  EDIT_CAMPAIGN = 'edit_campaign',
  DELETE_CAMPAIGN = 'delete_campaign',
  VIEW_CAMPAIGN = 'view_campaign',
  
  // Content permissions
  CREATE_CONTENT = 'create_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  VIEW_CONTENT = 'view_content',
  
  // Channel permissions
  CONNECT_CHANNEL = 'connect_channel',
  DISCONNECT_CHANNEL = 'disconnect_channel',
  VIEW_CHANNEL = 'view_channel',
  
  // Publishing permissions
  SCHEDULE_POST = 'schedule_post',
  PUBLISH_POST = 'publish_post',
  VIEW_PUBLISHING_HISTORY = 'view_publishing_history',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // Team permissions
  INVITE_TEAM_MEMBER = 'invite_team_member',
  REMOVE_TEAM_MEMBER = 'remove_team_member',
  MANAGE_TEAM_ROLES = 'manage_team_roles',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_BILLING = 'manage_billing',
  VIEW_SYSTEM_LOGS = 'view_system_logs'
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.FREE]: [
    Permission.CREATE_CAMPAIGN,
    Permission.EDIT_CAMPAIGN,
    Permission.VIEW_CAMPAIGN,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.CONNECT_CHANNEL,
    Permission.VIEW_CHANNEL,
    Permission.SCHEDULE_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_PUBLISHING_HISTORY,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.PRO]: [
    Permission.CREATE_CAMPAIGN,
    Permission.EDIT_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGN,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.CONNECT_CHANNEL,
    Permission.DISCONNECT_CHANNEL,
    Permission.VIEW_CHANNEL,
    Permission.SCHEDULE_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_PUBLISHING_HISTORY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.INVITE_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER
  ],
  
  [UserRole.ENTERPRISE]: [
    Permission.CREATE_CAMPAIGN,
    Permission.EDIT_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGN,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.CONNECT_CHANNEL,
    Permission.DISCONNECT_CHANNEL,
    Permission.VIEW_CHANNEL,
    Permission.SCHEDULE_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_PUBLISHING_HISTORY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.INVITE_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER,
    Permission.MANAGE_TEAM_ROLES,
    Permission.MANAGE_BILLING
  ],
  
  [UserRole.ADMIN]: [
    Permission.CREATE_CAMPAIGN,
    Permission.EDIT_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGN,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.CONNECT_CHANNEL,
    Permission.DISCONNECT_CHANNEL,
    Permission.VIEW_CHANNEL,
    Permission.SCHEDULE_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_PUBLISHING_HISTORY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.INVITE_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER,
    Permission.MANAGE_TEAM_ROLES,
    Permission.MANAGE_USERS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_SYSTEM_LOGS
  ]
}

// Feature limits by role
export const ROLE_LIMITS = {
  [UserRole.FREE]: {
    campaigns: 3,
    contentPieces: 10,
    channels: 2,
    teamMembers: 1,
    scheduledPosts: 10,
    analyticsRetention: 30 // days
  },
  
  [UserRole.PRO]: {
    campaigns: 20,
    contentPieces: 100,
    channels: 10,
    teamMembers: 5,
    scheduledPosts: 100,
    analyticsRetention: 90 // days
  },
  
  [UserRole.ENTERPRISE]: {
    campaigns: -1, // unlimited
    contentPieces: -1, // unlimited
    channels: -1, // unlimited
    teamMembers: 50,
    scheduledPosts: -1, // unlimited
    analyticsRetention: 365 // days
  },
  
  [UserRole.ADMIN]: {
    campaigns: -1, // unlimited
    contentPieces: -1, // unlimited
    channels: -1, // unlimited
    teamMembers: -1, // unlimited
    scheduledPosts: -1, // unlimited
    analyticsRetention: -1 // unlimited
  }
}

// RBAC service class
export class RBACService {
  // Check if user has a specific permission
  hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    return rolePermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  // Get all permissions for a role
  getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || []
  }

  // Check if user can perform an action based on current usage
  canPerformAction(
    userRole: UserRole,
    action: keyof typeof ROLE_LIMITS[UserRole],
    currentUsage: number
  ): boolean {
    const limits = ROLE_LIMITS[userRole]
    const limit = limits[action]
    
    // -1 means unlimited
    if (limit === -1) return true
    
    return currentUsage < limit
  }

  // Get remaining quota for an action
  getRemainingQuota(
    userRole: UserRole,
    action: keyof typeof ROLE_LIMITS[UserRole],
    currentUsage: number
  ): number {
    const limits = ROLE_LIMITS[userRole]
    const limit = limits[action]
    
    // -1 means unlimited
    if (limit === -1) return -1
    
    return Math.max(0, limit - currentUsage)
  }

  // Upgrade user role
  upgradeRole(currentRole: UserRole): UserRole | null {
    switch (currentRole) {
      case UserRole.FREE:
        return UserRole.PRO
      case UserRole.PRO:
        return UserRole.ENTERPRISE
      case UserRole.ENTERPRISE:
        return UserRole.ADMIN
      case UserRole.ADMIN:
        return null // Already at highest level
      default:
        return null
    }
  }

  // Downgrade user role
  downgradeRole(currentRole: UserRole): UserRole | null {
    switch (currentRole) {
      case UserRole.ADMIN:
        return UserRole.ENTERPRISE
      case UserRole.ENTERPRISE:
        return UserRole.PRO
      case UserRole.PRO:
        return UserRole.FREE
      case UserRole.FREE:
        return null // Already at lowest level
      default:
        return null
    }
  }

  // Get role display name
  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.FREE:
        return 'Free'
      case UserRole.PRO:
        return 'Pro'
      case UserRole.ENTERPRISE:
        return 'Enterprise'
      case UserRole.ADMIN:
        return 'Admin'
      default:
        return 'Unknown'
    }
  }

  // Get role description
  getRoleDescription(role: UserRole): string {
    switch (role) {
      case UserRole.FREE:
        return 'Basic features for individual users'
      case UserRole.PRO:
        return 'Advanced features for growing businesses'
      case UserRole.ENTERPRISE:
        return 'Full features for large organizations'
      case UserRole.ADMIN:
        return 'System administration and management'
      default:
        return 'Unknown role'
    }
  }

  // Check if role can manage another role
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: [UserRole.ENTERPRISE, UserRole.PRO, UserRole.FREE],
      [UserRole.ENTERPRISE]: [UserRole.PRO, UserRole.FREE],
      [UserRole.PRO]: [UserRole.FREE],
      [UserRole.FREE]: []
    }

    return roleHierarchy[managerRole]?.includes(targetRole) || false
  }

  // Get manageable roles for a given role
  getManageableRoles(role: UserRole): UserRole[] {
    const roleHierarchy = {
      [UserRole.ADMIN]: [UserRole.ENTERPRISE, UserRole.PRO, UserRole.FREE],
      [UserRole.ENTERPRISE]: [UserRole.PRO, UserRole.FREE],
      [UserRole.PRO]: [UserRole.FREE],
      [UserRole.FREE]: []
    }

    return roleHierarchy[role] || []
  }
}

// Export singleton instance
export const rbacService = new RBACService()

// React hook for RBAC
export function useRBAC() {
  return {
    hasPermission: rbacService.hasPermission.bind(rbacService),
    hasAnyPermission: rbacService.hasAnyPermission.bind(rbacService),
    hasAllPermissions: rbacService.hasAllPermissions.bind(rbacService),
    getRolePermissions: rbacService.getRolePermissions.bind(rbacService),
    canPerformAction: rbacService.canPerformAction.bind(rbacService),
    getRemainingQuota: rbacService.getRemainingQuota.bind(rbacService),
    getRoleDisplayName: rbacService.getRoleDisplayName.bind(rbacService),
    getRoleDescription: rbacService.getRoleDescription.bind(rbacService),
    canManageRole: rbacService.canManageRole.bind(rbacService),
    getManageableRoles: rbacService.getManageableRoles.bind(rbacService)
  }
}

// Higher-order component for permission-based rendering
export function withPermission(
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: Permission
) {
  return function PermissionWrapper(props: any) {
    const { hasPermission } = useRBAC()
    const { userRole } = props // Assuming userRole is passed as prop
    
    if (!hasPermission(userRole, requiredPermission)) {
      return null // Or render a fallback component
    }
    
    return <WrappedComponent {...props} />
  }
}

// Component for conditional rendering based on permissions
export function PermissionGate({
  children,
  permission,
  userRole,
  fallback = null
}: {
  children: React.ReactNode
  permission: Permission
  userRole: UserRole
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useRBAC()
  
  if (!hasPermission(userRole, permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
} 