import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { redisClient } from '../config/redisClient';
import { createNotFoundError, createConflictError, createValidationError } from '../middlewares/errorHandler';

export interface CreateUserProfileData {
  userId: string;
  companyId: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  phone?: string;
  mobile?: string;
  emergencyContact?: any;
  address?: any;
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  managerId?: string;
  hireDate?: Date;
  employmentType?: string;
  visibility?: string;
  status?: string;
}

export interface UpdateUserProfileData {
  profilePicture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  phone?: string;
  mobile?: string;
  emergencyContact?: any;
  address?: any;
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  managerId?: string;
  hireDate?: Date;
  employmentType?: string;
  visibility?: string;
  status?: string;
}

export interface UserSearchFilters {
  search?: string;
  status?: string;
  department?: string;
  role?: string;
  managerId?: string;
  hireDateFrom?: Date;
  hireDateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserRelationshipData {
  relatedUserId: string;
  relationshipType: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  strength?: string;
}

export class UserService {
  private prisma: PrismaClient;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // User Profile Management
  async createUserProfile(data: CreateUserProfileData) {
    try {
      // Check if profile already exists
      const existingProfile = await this.prisma.userProfile.findUnique({
        where: { userId: data.userId }
      });

      if (existingProfile) {
        throw createConflictError('User profile already exists');
      }

      const profile = await this.prisma.userProfile.create({
        data: {
          ...data,
          lastActive: new Date(),
        },
        include: {
          preferences: true,
          relationships: true,
        }
      });

      // Cache the profile
      await this.cacheUserProfile(profile.id, profile);

      logger.info('User profile created:', { userId: data.userId, profileId: profile.id });
      return profile;
    } catch (error) {
      logger.error('Failed to create user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string, companyId: string) {
    try {
      // Try to get from cache first
      const cachedProfile = await this.getCachedUserProfile(userId);
      if (cachedProfile) {
        return cachedProfile;
      }

      const profile = await this.prisma.userProfile.findFirst({
        where: {
          userId,
          companyId,
          deletedAt: null,
        },
        include: {
          preferences: true,
          relationships: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  userId: true,
                  jobTitle: true,
                  department: true,
                }
              }
            }
          },
        }
      });

      if (!profile) {
        throw createNotFoundError('User profile not found');
      }

      // Cache the profile
      await this.cacheUserProfile(profile.id, profile);

      return profile;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, companyId: string, data: UpdateUserProfileData) {
    try {
      const profile = await this.prisma.userProfile.findFirst({
        where: {
          userId,
          companyId,
          deletedAt: null,
        }
      });

      if (!profile) {
        throw createNotFoundError('User profile not found');
      }

      const updatedProfile = await this.prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          preferences: true,
          relationships: true,
        }
      });

      // Update cache
      await this.cacheUserProfile(updatedProfile.id, updatedProfile);

      // Track activity
      await this.trackUserActivity(userId, companyId, 'profile_update', 'Profile updated', {
        updatedFields: Object.keys(data),
        profileId: profile.id,
      });

      logger.info('User profile updated:', { userId, profileId: profile.id });
      return updatedProfile;
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async deleteUserProfile(userId: string, companyId: string) {
    try {
      const profile = await this.prisma.userProfile.findFirst({
        where: {
          userId,
          companyId,
          deletedAt: null,
        }
      });

      if (!profile) {
        throw createNotFoundError('User profile not found');
      }

      // Soft delete
      await this.prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          deletedAt: new Date(),
          status: 'deactivated',
        }
      });

      // Remove from cache
      await this.removeCachedUserProfile(profile.id);

      // Track activity
      await this.trackUserActivity(userId, companyId, 'profile_update', 'Profile deleted', {
        profileId: profile.id,
        action: 'delete',
      });

      logger.info('User profile deleted:', { userId, profileId: profile.id });
      return { success: true, message: 'Profile deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete user profile:', error);
      throw error;
    }
  }

  // User Search and Listing
  async searchUsers(companyId: string, filters: UserSearchFilters) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...searchFilters } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        companyId,
        deletedAt: null,
      };

      if (searchFilters.search) {
        where.OR = [
          { jobTitle: { contains: searchFilters.search, mode: 'insensitive' } },
          { department: { contains: searchFilters.search, mode: 'insensitive' } },
          { bio: { contains: searchFilters.search, mode: 'insensitive' } },
        ];
      }

      if (searchFilters.status) {
        where.status = searchFilters.status;
      }

      if (searchFilters.department) {
        where.department = searchFilters.department;
      }

      if (searchFilters.managerId) {
        where.managerId = searchFilters.managerId;
      }

      if (searchFilters.hireDateFrom || searchFilters.hireDateTo) {
        where.hireDate = {};
        if (searchFilters.hireDateFrom) {
          where.hireDate.gte = searchFilters.hireDateFrom;
        }
        if (searchFilters.hireDateTo) {
          where.hireDate.lte = searchFilters.hireDateTo;
        }
      }

      // Build order by
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [profiles, total] = await Promise.all([
        this.prisma.userProfile.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            preferences: true,
            relationships: {
              where: { isActive: true },
              take: 5, // Limit relationships for performance
            },
          },
        }),
        this.prisma.userProfile.count({ where }),
      ]);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  }

  // User Relationships
  async createUserRelationship(userId: string, companyId: string, data: UserRelationshipData) {
    try {
      // Check if relationship already exists
      const existingRelationship = await this.prisma.userRelationship.findFirst({
        where: {
          userId,
          relatedUserId: data.relatedUserId,
          relationshipType: data.relationshipType,
          companyId,
          isActive: true,
        }
      });

      if (existingRelationship) {
        throw createConflictError('Relationship already exists');
      }

      const relationship = await this.prisma.userRelationship.create({
        data: {
          userId,
          companyId,
          ...data,
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              jobTitle: true,
              department: true,
            }
          }
        }
      });

      // Track activity
      await this.trackUserActivity(userId, companyId, 'profile_update', 'Relationship created', {
        relationshipId: relationship.id,
        relationshipType: data.relationshipType,
        relatedUserId: data.relatedUserId,
      });

      logger.info('User relationship created:', { userId, relationshipId: relationship.id });
      return relationship;
    } catch (error) {
      logger.error('Failed to create user relationship:', error);
      throw error;
    }
  }

  async getUserRelationships(userId: string, companyId: string) {
    try {
      const relationships = await this.prisma.userRelationship.findMany({
        where: {
          userId,
          companyId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              jobTitle: true,
              department: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        }
      });

      return relationships;
    } catch (error) {
      logger.error('Failed to get user relationships:', error);
      throw error;
    }
  }

  async updateUserRelationship(relationshipId: string, userId: string, companyId: string, data: Partial<UserRelationshipData>) {
    try {
      const relationship = await this.prisma.userRelationship.findFirst({
        where: {
          id: relationshipId,
          userId,
          companyId,
        }
      });

      if (!relationship) {
        throw createNotFoundError('Relationship not found');
      }

      const updatedRelationship = await this.prisma.userRelationship.update({
        where: { id: relationshipId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              jobTitle: true,
              department: true,
            }
          }
        }
      });

      // Track activity
      await this.trackUserActivity(userId, companyId, 'profile_update', 'Relationship updated', {
        relationshipId,
        updatedFields: Object.keys(data),
      });

      logger.info('User relationship updated:', { userId, relationshipId });
      return updatedRelationship;
    } catch (error) {
      logger.error('Failed to update user relationship:', error);
      throw error;
    }
  }

  async deleteUserRelationship(relationshipId: string, userId: string, companyId: string) {
    try {
      const relationship = await this.prisma.userRelationship.findFirst({
        where: {
          id: relationshipId,
          userId,
          companyId,
        }
      });

      if (!relationship) {
        throw createNotFoundError('Relationship not found');
      }

      await this.prisma.userRelationship.update({
        where: { id: relationshipId },
        data: {
          isActive: false,
          endDate: new Date(),
          updatedAt: new Date(),
        }
      });

      // Track activity
      await this.trackUserActivity(userId, companyId, 'profile_update', 'Relationship deleted', {
        relationshipId,
        relationshipType: relationship.relationshipType,
      });

      logger.info('User relationship deleted:', { userId, relationshipId });
      return { success: true, message: 'Relationship deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete user relationship:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateUsers(companyId: string, userIds: string[], operation: string, data: any) {
    try {
      const profiles = await this.prisma.userProfile.findMany({
        where: {
          id: { in: userIds },
          companyId,
          deletedAt: null,
        }
      });

      if (profiles.length !== userIds.length) {
        throw createValidationError('Some user profiles not found');
      }

      let updateData: any = {};
      
      switch (operation) {
        case 'change_department':
          updateData.department = data.department;
          break;
        case 'change_manager':
          updateData.managerId = data.managerId;
          break;
        case 'change_status':
          updateData.status = data.status;
          break;
        default:
          throw createValidationError('Invalid operation');
      }

      const updatedProfiles = await this.prisma.userProfile.updateMany({
        where: {
          id: { in: userIds },
          companyId,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        }
      });

      // Track bulk activity
      await this.trackUserActivity(userIds[0], companyId, 'profile_update', `Bulk ${operation}`, {
        operation,
        affectedUsers: userIds.length,
        data: updateData,
      });

      logger.info('Bulk user update completed:', { operation, affectedUsers: userIds.length });
      return { success: true, updatedCount: updatedProfiles.count };
    } catch (error) {
      logger.error('Failed to perform bulk user update:', error);
      throw error;
    }
  }

  // Cache Management
  private async cacheUserProfile(profileId: string, profile: any) {
    try {
      const cacheKey = `user_profile:${profileId}`;
      await redisClient.set(cacheKey, JSON.stringify(profile), this.CACHE_TTL);
    } catch (error) {
      logger.warn('Failed to cache user profile:', error);
    }
  }

  private async getCachedUserProfile(profileId: string) {
    try {
      const cacheKey = `user_profile:${profileId}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Failed to get cached user profile:', error);
      return null;
    }
  }

  private async removeCachedUserProfile(profileId: string) {
    try {
      const cacheKey = `user_profile:${profileId}`;
      await redisClient.del(cacheKey);
    } catch (error) {
      logger.warn('Failed to remove cached user profile:', error);
    }
  }

  // Activity Tracking
  private async trackUserActivity(userId: string, companyId: string, activityType: string, description: string, metadata?: any) {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId,
          companyId,
          activityType,
          description,
          metadata,
          activityTime: new Date(),
        }
      });
    } catch (error) {
      logger.warn('Failed to track user activity:', error);
    }
  }

  // Health Check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', service: 'user-service' };
    } catch (error) {
      logger.error('User service health check failed:', error);
      return { status: 'unhealthy', service: 'user-service', error: error.message };
    }
  }
}
