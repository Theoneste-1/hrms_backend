import  { Router,type  Request, type Response } from 'express';
import { prismaService } from '../services/prismaService.js';
import bcrypt from 'bcryptjs';

const companiesRouter = Router();

companiesRouter.post('/register', async (req: Request, res: Response) => {
  const {
    name,
    domain,
    industry,
    companySize,
    subscriptionPlan,
    billingCycle,
    maxEmployees,
    maxStorageGb,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName
  } = req.body;

  // Validate required fields
  if (!name || !domain || !subscriptionPlan || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Transaction: create company and first admin user
    const result = await prismaService.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name,
          domain,
          industry,
          companySize,
          subscriptionPlan,
          billingCycle,
          maxEmployees,
          maxStorageGb,
        },
      });

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          companyId: company.id,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'COMPANY_ADMIN', // or UserRole.ADMIN if you use enums
        },
      });

      // Optionally, create an Employee record for the admin
      await tx.employee.create({
        data: {
          companyId: company.id,
          userId: user.id,
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          employeeId: `EMP-${Math.random().toString(36).substring(7)}`,
          hireDate: new Date(),
          employmentType: 'FULL_TIME',
        },
      });

      return { company, user };
    });

    // Only send this on success:
    return res.status(201).json({ company: result.company, adminUser: result.user });

  } catch (error: any) {
    // Only send this on unique constraint error:
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Domain or email already exists' });
    }
    // For all other errors:
    return res.status(500).json({ message: 'Failed to register company', error: error.message });
  }
});

export default companiesRouter;