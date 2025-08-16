import Joi from 'joi';

// Base user profile validation schema
export const userProfileSchema = Joi.object({
  // Personal Information
  profilePicture: Joi.string().uri().max(500).optional(),
  bio: Joi.string().max(1000).optional(),
  location: Joi.string().max(100).optional(),
  timezone: Joi.string().max(50).optional(),
  language: Joi.string().length(2).default('en'),
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed', 'separated').optional(),
  nationality: Joi.string().max(100).optional(),
  
  // Contact Information
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).max(20).optional(),
  mobile: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).max(20).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    relationship: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional(),
  }).optional(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).optional(),
  
  // Professional Information
  employeeId: Joi.string().max(50).optional(),
  jobTitle: Joi.string().max(100).optional(),
  department: Joi.string().max(100).optional(),
  managerId: Joi.string().uuid().optional(),
  hireDate: Joi.date().max('now').optional(),
  employmentType: Joi.string().valid('full_time', 'part_time', 'contract', 'intern', 'temporary').optional(),
  
  // Profile Settings
  visibility: Joi.string().valid('public', 'private', 'team_only', 'manager_only').default('team_only'),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending_activation', 'deactivated').default('active'),
});

// User preference validation schema
export const userPreferenceSchema = Joi.object({
  // UI Preferences
  theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
  colorScheme: Joi.string().valid('default', 'blue', 'green', 'purple', 'orange').default('default'),
  fontSize: Joi.string().valid('small', 'medium', 'large').default('medium'),
  layout: Joi.string().valid('default', 'compact', 'spacious').default('default'),
  
  // Notification Preferences
  emailNotifications: Joi.boolean().default(true),
  smsNotifications: Joi.boolean().default(false),
  pushNotifications: Joi.boolean().default(true),
  inAppNotifications: Joi.boolean().default(true),
  
  // Feature Preferences
  dashboardLayout: Joi.object().optional(),
  quickActions: Joi.array().items(Joi.string()).optional(),
  shortcuts: Joi.object().optional(),
  
  // Privacy Preferences
  profileVisibility: Joi.string().valid('public', 'private', 'team_only', 'manager_only').default('team_only'),
  activitySharing: Joi.boolean().default(true),
  dataExport: Joi.boolean().default(false),
});

// User relationship validation schema
export const userRelationshipSchema = Joi.object({
  relatedUserId: Joi.string().uuid().required(),
  relationshipType: Joi.string().valid('manager', 'peer', 'mentor', 'mentee', 'team_lead', 'subordinate').required(),
  startDate: Joi.date().max('now').optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  isActive: Joi.boolean().default(true),
  notes: Joi.string().max(500).optional(),
  strength: Joi.string().valid('strong', 'moderate', 'weak').optional(),
});

// User team validation schema
export const userTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  teamType: Joi.string().valid('project', 'department', 'cross_functional', 'temporary', 'virtual').required(),
  leadId: Joi.string().uuid().optional(),
  parentTeamId: Joi.string().uuid().optional(),
  maxMembers: Joi.number().integer().min(1).max(1000).optional(),
});

// User team member validation schema
export const userTeamMemberSchema = Joi.object({
  teamId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid('member', 'lead', 'contributor', 'observer', 'admin').default('member'),
  joinDate: Joi.date().max('now').default('now'),
  leaveDate: Joi.date().min(Joi.ref('joinDate')).optional(),
  canInvite: Joi.boolean().default(false),
  canManage: Joi.boolean().default(false),
  canViewAll: Joi.boolean().default(true),
});

// User activity validation schema
export const userActivitySchema = Joi.object({
  activityType: Joi.string().valid('login', 'logout', 'profile_update', 'preference_change', 'feature_access', 'document_view', 'report_generated', 'setting_changed').required(),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional(),
  ipAddress: Joi.string().ip().optional(),
  userAgent: Joi.string().max(500).optional(),
  deviceInfo: Joi.object().optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    accuracy: Joi.number().min(0).optional(),
  }).optional(),
});

// Login history validation schema
export const loginHistorySchema = Joi.object({
  loginTime: Joi.date().max('now').default('now'),
  logoutTime: Joi.date().min(Joi.ref('loginTime')).optional(),
  sessionDuration: Joi.number().integer().min(0).optional(),
  ipAddress: Joi.string().ip().optional(),
  userAgent: Joi.string().max(500).optional(),
  deviceInfo: Joi.object().optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    accuracy: Joi.number().min(0).optional(),
  }).optional(),
  isSuccessful: Joi.boolean().default(true),
  failureReason: Joi.string().max(500).optional(),
});

// Feature usage validation schema
export const featureUsageSchema = Joi.object({
  featureName: Joi.string().min(2).max(100).required(),
  featureModule: Joi.string().max(100).optional(),
  action: Joi.string().valid('view', 'create', 'update', 'delete', 'export', 'import', 'download', 'upload').optional(),
  usageCount: Joi.number().integer().min(1).default(1),
  totalTimeSpent: Joi.number().integer().min(0).optional(),
  sessionId: Joi.string().uuid().optional(),
  metadata: Joi.object().optional(),
});

// Query parameters validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const userSearchSchema = Joi.object({
  search: Joi.string().min(1).max(100).optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending_activation', 'deactivated').optional(),
  department: Joi.string().max(100).optional(),
  role: Joi.string().optional(),
  managerId: Joi.string().uuid().optional(),
  hireDateFrom: Joi.date().optional(),
  hireDateTo: Joi.date().min(Joi.ref('hireDateFrom')).optional(),
  ...paginationSchema.keys(),
});

export const activityFilterSchema = Joi.object({
  userId: Joi.string().uuid().optional(),
  activityType: Joi.string().valid('login', 'logout', 'profile_update', 'preference_change', 'feature_access', 'document_view', 'report_generated', 'setting_changed').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  ...paginationSchema.keys(),
});

// Bulk operations validation schema
export const bulkUserOperationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().uuid()).min(1).max(100).required(),
  operation: Joi.string().valid('activate', 'deactivate', 'suspend', 'change_department', 'change_manager', 'change_role').required(),
  data: Joi.object().optional(),
});

// Export validation schema
export const exportDataSchema = Joi.object({
  format: Joi.string().valid('csv', 'json', 'xlsx').default('csv'),
  fields: Joi.array().items(Joi.string()).optional(),
  filters: Joi.object().optional(),
  dateRange: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
  }).optional(),
});
