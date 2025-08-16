import { Router } from "express";
import * as NotificationController from "./controller.js";

const router = Router();

// Send notifications
router.post("/", NotificationController.sendNotification);
router.post("/bulk", NotificationController.sendBulkNotifications);

// Template management
router.get("/templates", NotificationController.getTemplates);
router.post("/templates", NotificationController.createTemplate);
router.get("/templates/:id", NotificationController.getTemplateById);
router.put("/templates/:id", NotificationController.updateTemplate);
router.delete("/templates/:id", NotificationController.deleteTemplate);

export default router;
