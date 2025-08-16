import { Request, Response } from 'express';
import { sendEmail } from "./service/email.js";
import { sendSMS } from "./service/sms.js";
import { sendPush } from "./service/push.js";
import { logger } from './config/logger.js';
import { createValidationError } from './middlewares/errorHandler.js';

export const sendNotification = async (req: Request, res: Response) => {
  const { type, to, message, subject, templateId, metadata } = req.body;

  try {
    // Validate required fields
    if (!type || !to || !message) {
      throw createValidationError('Type, to, and message are required');
    }

    let result;
    switch (type) {
      case "email":
        result = await sendEmail(to, message, subject, metadata);
        break;
      case "sms":
        result = await sendSMS(to, message, metadata);
        break;
      case "push":
        result = await sendPush(to, message, metadata);
        break;
      default:
        throw createValidationError('Unsupported notification type. Supported types: email, sms, push');
    }

    logger.info('Notification sent successfully:', { type, to, message: message.substring(0, 50) });
    
    res.json({ 
      success: true, 
      message: 'Notification sent successfully',
      data: result
    });
  } catch (err: any) {
    logger.error('Failed to send notification:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to send notification' 
    });
  }
};

// Bulk notification sending
export const sendBulkNotifications = async (req: Request, res: Response) => {
  const { notifications } = req.body;

  try {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw createValidationError('Notifications array is required and must not be empty');
    }

    const results = [];
    const errors = [];

    for (const notification of notifications) {
      try {
        const { type, to, message, subject, metadata } = notification;
        
        if (!type || !to || !message) {
          errors.push({ to, error: 'Missing required fields' });
          continue;
        }

        let result;
        switch (type) {
          case "email":
            result = await sendEmail(to, message, subject, metadata);
            break;
          case "sms":
            result = await sendSMS(to, message, metadata);
            break;
          case "push":
            result = await sendPush(to, message, metadata);
            break;
          default:
            errors.push({ to, error: 'Unsupported notification type' });
            continue;
        }

        results.push({ to, success: true, data: result });
      } catch (error: any) {
        errors.push({ to: notification.to, error: error.message });
      }
    }

    logger.info('Bulk notifications processed:', { 
      total: notifications.length, 
      successful: results.length, 
      failed: errors.length 
    });

    res.json({
      success: true,
      message: 'Bulk notifications processed',
      data: {
        total: notifications.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });
  } catch (err: any) {
    logger.error('Failed to process bulk notifications:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to process bulk notifications' 
    });
  }
};

// Notification templates
let templates: any[] = [
  {
    id: 1,
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to HRMS',
    content: 'Hello {{name}}, welcome to our HRMS platform!',
    variables: ['name']
  },
  {
    id: 2,
    name: 'Leave Approval',
    type: 'email',
    subject: 'Leave Request {{status}}',
    content: 'Your leave request for {{startDate}} to {{endDate}} has been {{status}}.',
    variables: ['status', 'startDate', 'endDate']
  }
];

export const getTemplates = (_: Request, res: Response) => {
  res.json({
    success: true,
    data: templates
  });
};

export const createTemplate = (req: Request, res: Response) => {
  try {
    const { name, type, subject, content, variables } = req.body;

    if (!name || !type || !content) {
      throw createValidationError('Name, type, and content are required');
    }

    const newTemplate = { 
      id: templates.length + 1, 
      name, 
      type, 
      subject, 
      content, 
      variables: variables || [],
      createdAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    
    logger.info('Template created:', { templateId: newTemplate.id, name });
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: newTemplate
    });
  } catch (err: any) {
    logger.error('Failed to create template:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to create template' 
    });
  }
};

export const getTemplateById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = templates.find(t => t.id === parseInt(id));
    
    if (!template) {
      throw createValidationError('Template not found');
    }

    res.json({
      success: true,
      data: template
    });
  } catch (err: any) {
    logger.error('Failed to get template:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to get template' 
    });
  }
};

export const updateTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateIndex = templates.findIndex(t => t.id === parseInt(id));
    
    if (templateIndex === -1) {
      throw createValidationError('Template not found');
    }

    const updatedTemplate = { 
      ...templates[templateIndex], 
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    templates[templateIndex] = updatedTemplate;
    
    logger.info('Template updated:', { templateId: id });
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate
    });
  } catch (err: any) {
    logger.error('Failed to update template:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to update template' 
    });
  }
};

export const deleteTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateIndex = templates.findIndex(t => t.id === parseInt(id));
    
    if (templateIndex === -1) {
      throw createValidationError('Template not found');
    }

    const deletedTemplate = templates.splice(templateIndex, 1)[0];
    
    logger.info('Template deleted:', { templateId: id });
    
    res.json({
      success: true,
      message: 'Template deleted successfully',
      data: deletedTemplate
    });
  } catch (err: any) {
    logger.error('Failed to delete template:', err);
    res.status(err.statusCode || 500).json({ 
      success: false, 
      error: err.message || 'Failed to delete template' 
    });
  }
};