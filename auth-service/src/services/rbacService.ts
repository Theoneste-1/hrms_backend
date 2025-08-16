import type { Request, Response, NextFunction } from 'express';
import { JwtService,type JwtPayload } from './jwtService.js';


export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  INTERN = 'intern',
  TRAINER = 'trainer',
  AUDITOR = 'auditor',
  HR = 'hr',
  PAYROLL_MANAGER = 'payroll_manager',
}

export enum Permission {
  MANAGE_COMPANY_SETTINGS = 'manage_company_settings',
  VIEW_COMPANY_ANALYTICS = 'view_company_analytics',
  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  // Employee Profile Management
  MANAGE_EMPLOYEE_PROFILES = 'manage_employee_profiles',
  VIEW_ALL_EMPLOYEE_PROFILES = 'view_all_employee_profiles',
  VIEW_OWN_EMPLOYEE_PROFILE = 'view_own_employee_profile',
  // Department & Position Management
  MANAGE_ORG_STRUCTURE = 'manage_org_structure',
  // Time Tracking
  CLOCK_IN_OUT = 'clock_in_out',
  MANAGE_TIME_RECORDS = 'manage_time_records',
  VIEW_ALL_TIME_RECORDS = 'view_all_time_records',
  // Leave Management
  REQUEST_LEAVE = 'request_leave',
  MANAGE_LEAVE_REQUESTS = 'manage_leave_requests',
  VIEW_ALL_LEAVE_REQUESTS = 'view_all_leave_requests',
  // Payroll Management
  PROCESS_PAYROLL = 'process_payroll',
  VIEW_PAYROLL_RECORDS = 'view_payroll_records',
  VIEW_OWN_PAYROLL = 'view_own_payroll',
  // Performance Reviews
  MANAGE_PERFORMANCE_REVIEWS = 'manage_performance_reviews',
  CONDUCT_PERFORMANCE_REVIEW = 'conduct_performance_review',
  VIEW_PERFORMANCE_REVIEWS = 'view_performance_reviews',
  VIEW_OWN_PERFORMANCE_REVIEW = 'view_own_performance_review',
  // Training Management
  MANAGE_TRAINING_PROGRAMS = 'manage_training_programs',
  ENROLL_IN_TRAINING = 'enroll_in_training',
  VIEW_ALL_TRAINING_PROGRESS = 'view_all_training_progress',
  VIEW_OWN_TRAINING_PROGRESS = 'view_own_training_progress',
  // Audit and Billing
  MANAGE_AUDIT_LOGS = 'manage_audit_logs',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  VIEW_COMPANY_BILLING = 'view_company_billing',
  MANAGE_COMPANY_BILLING = 'manage_company_billing',
  VIEW_ALL_COMPANIES_BILLINGS = 'view_all_companies_billings',
  VIEW_SUBSCRIPTION_DETAILS = 'view_subscription_details',
  VIEW_ALL_COMPANIES = 'view_all_companies',
  AUDIT_COMPANIES = 'audit_companies',
}

const rolePermissions: Record<UserRole, Set<Permission>> = {
  [UserRole.SUPER_ADMIN]: new Set(Object.values(Permission)),
  [UserRole.COMPANY_ADMIN]: new Set([
    Permission.MANAGE_COMPANY_SETTINGS,
    Permission.VIEW_COMPANY_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_EMPLOYEE_PROFILES,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.MANAGE_ORG_STRUCTURE,
    Permission.MANAGE_TIME_RECORDS,
    Permission.VIEW_ALL_TIME_RECORDS,
    Permission.MANAGE_LEAVE_REQUESTS,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.VIEW_PAYROLL_RECORDS,
    Permission.MANAGE_PERFORMANCE_REVIEWS,
    Permission.CONDUCT_PERFORMANCE_REVIEW,
    Permission.VIEW_PERFORMANCE_REVIEWS,
    Permission.MANAGE_TRAINING_PROGRAMS,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_ALL_TRAINING_PROGRESS,
    Permission.VIEW_COMPANY_BILLING,
    Permission.MANAGE_COMPANY_BILLING,
    Permission.VIEW_SUBSCRIPTION_DETAILS,
    Permission.VIEW_AUDIT_LOGS,
  ]),
  [UserRole.HR]: new Set([
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_EMPLOYEE_PROFILES,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.MANAGE_ORG_STRUCTURE,
    Permission.MANAGE_TIME_RECORDS,
    Permission.VIEW_ALL_TIME_RECORDS,
    Permission.MANAGE_LEAVE_REQUESTS,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.VIEW_PAYROLL_RECORDS,
    Permission.MANAGE_PERFORMANCE_REVIEWS,
    Permission.CONDUCT_PERFORMANCE_REVIEW,
    Permission.VIEW_PERFORMANCE_REVIEWS,
    Permission.MANAGE_TRAINING_PROGRAMS,
    Permission.VIEW_ALL_TRAINING_PROGRESS,
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
    Permission.VIEW_AUDIT_LOGS,
  ]),
  [UserRole.MANAGER]: new Set([
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
    Permission.MANAGE_TIME_RECORDS,
    Permission.VIEW_ALL_TIME_RECORDS,
    Permission.MANAGE_LEAVE_REQUESTS,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.CONDUCT_PERFORMANCE_REVIEW,
    Permission.VIEW_PERFORMANCE_REVIEWS,
  ]),
  [UserRole.PAYROLL_MANAGER]: new Set([
    Permission.PROCESS_PAYROLL,
    Permission.VIEW_PAYROLL_RECORDS,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.VIEW_ALL_TIME_RECORDS,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
    Permission.VIEW_AUDIT_LOGS,
  ]),
  [UserRole.TRAINER]: new Set([
    Permission.MANAGE_TRAINING_PROGRAMS,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_ALL_TRAINING_PROGRESS,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
  ]),
  [UserRole.AUDITOR]: new Set([
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_AUDIT_LOGS,
    Permission.VIEW_ALL_COMPANIES_BILLINGS,
    Permission.VIEW_ALL_COMPANIES,
    Permission.AUDIT_COMPANIES,
    Permission.VIEW_ALL_EMPLOYEE_PROFILES,
    Permission.VIEW_ALL_TIME_RECORDS,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.VIEW_PAYROLL_RECORDS,
    Permission.VIEW_PERFORMANCE_REVIEWS,
    Permission.VIEW_ALL_TRAINING_PROGRESS,
  ]),
  [UserRole.EMPLOYEE]: new Set([
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
  ]),
  [UserRole.INTERN]: new Set([
    Permission.VIEW_OWN_EMPLOYEE_PROFILE,
    Permission.CLOCK_IN_OUT,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_OWN_PERFORMANCE_REVIEW,
    Permission.ENROLL_IN_TRAINING,
    Permission.VIEW_OWN_TRAINING_PROGRESS,
  ]),
};

export class RbacService {
  private readonly jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

//check if user has certain permissions
  public hasPerm(role: UserRole, permission: Permission): boolean {
    const permissions = rolePermissions[role];
    return permissions ? permissions.has(permission) : false;
  }
  queryPermissions(role: UserRole): Permission[] {
    const permissions = rolePermissions[role];
    return permissions ? Array.from(permissions) : [];
  } 

  //Authorize the user for a specific route
  public authorize(requiredPerm: Permission[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
      }

      const user = this.jwtService.verifyAccessToken(token) as JwtPayload | null;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      (req as any).user = user;

      const userRole = user.role as UserRole; // Use dot notation for type safety
      if (!Object.values(UserRole).includes(userRole)) {
        return res.status(403).json({ message: "Forbidden: Invalid role" });
      }
      if (userRole === UserRole.SUPER_ADMIN) {
        return next();
      }
      const hasOneOfPerm = requiredPerm.some((perm) => this.hasPerm(userRole, perm));
      if (!hasOneOfPerm) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
      next();
    };
  }
//   public authorize(requiredPerm: Permission[]) { 

//     return (req: Request, res: Response, next: NextFunction) => {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: "Unauthorized: No token provided" });
//       }

//       const token = authHeader.split(' ')[1];
//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token format" });
//       }

//       const user = this.jwtService.verifyAccessToken(token) as JwtPayload | null;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//       }
//       (req as any).user = user;

//       const userRole = user['role'] as UserRole;
//       if (!Object.values(UserRole).includes(userRole)) {
//         return res.status(403).json({ message: "Forbidden: Invalid role" });
//       }
//       if (userRole === UserRole.SUPER_ADMIN) {
//         return next();
//       }
//       const hasOneOfPerm = requiredPerm.some((perm) => this.hasPerm(userRole, perm));
//       if (!hasOneOfPerm) {
//         return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//       }
//       next();
//     };
//   }

  //authorize a user for his /her own resources
//   public authOwnData(allowPermissions: Permission[], userIdParamName: string = "id") {
//     return (req: Request, res: Response, next: NextFunction) => {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: "Unauthorized: No token provided" });
//       }

//       const token = authHeader.split(' ')[1];
//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token format" });
//       }

//       const user = this.jwtService.verifyAccessToken(token) as JwtPayload | null;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//       }
//       (req as any).user = user;

//       const userRole = user['role'] as UserRole;
//       const targetUserId = req.params[userIdParamName];
//       if (!Object.values(UserRole).includes(userRole)) {
//         return res.status(403).json({ message: "Forbidden: Invalid role" });
//       }
//       if (userRole === UserRole.SUPER_ADMIN) {
//         return next();
//       }
//       if (user["userId"] === targetUserId) {
//         return next();
//       }
//       const hasPerm = allowPermissions.some((perm) => this.hasPerm(userRole, perm));
//       if (!hasPerm) {
//         return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//       }
//       next();
//     };
//   }
// }
public authOwnData(allowPermissions: Permission[], userIdParamName: string = "id") {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
      }

      const user = this.jwtService.verifyAccessToken(token) as JwtPayload | null;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      (req as any).user = user;

      const userRole = user.role as UserRole;
      const targetUserId = req.params[userIdParamName];
      if (!Object.values(UserRole).includes(userRole)) {
        return res.status(403).json({ message: "Forbidden: Invalid role" });
      }
      if (userRole === UserRole.SUPER_ADMIN) {
        return next();
      }
      if (user.userId === targetUserId) {
        return next();
      }
      const hasPerm = allowPermissions.some((perm) => this.hasPerm(userRole, perm));
      if (!hasPerm) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
      next();
    };
  }

}      
export const rbacService = new RbacService();