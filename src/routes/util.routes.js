import { Router } from 'express';
import * as Controller from '../controllers/upload.controller.js';
const router = Router();



// Upload file route
router.post("/upload", Controller.uploadFile);

export default router;
