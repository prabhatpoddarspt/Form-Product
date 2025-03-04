import { Router } from "express";
// import * as authController from "../controllers/user.controller.js";
import * as formController from "../controllers/form.controller.js";
import * as approvalController from "../controllers/approval.controller.js";
import * as masterController from "../controllers/master.controller.js";
import { validateSchema, validateSchemaGet } from "../helper/validation.js";
import schema from "../validation/user.schema.js"

import {checkGuestAccess} from "../middleware/checkGuestAccess.js"
import { verifyPermissionToken } from "../middleware/checkPemissionAuth.js";



const router = Router();

// router.post("/register", authController.register);
// router.post("/login", authController.login);
// router.post("/resetPassword", authController.resetPassword);
// router.post("/sendOtp", authController.sendOtp);
// router.post("/verifyOtp", authController.verifyOtp);

//form routes


// router.post("/createRequest", validateSchema(schema.validateCreateForm), formController.createForm);
router.post("/createRequest", approvalController.createForm);

router.post("/acceptForm",verifyPermissionToken(), approvalController.acceptForm);

//Running Script
router.post("/reAssignTask", formController.reAssignTask);
router.post("/avoidDuplicate", formController.avoidDuplicate);


router.get("/getForms",checkGuestAccess(), formController.getForms);
router.get("/getFormById", validateSchemaGet(schema.validateGetFormById),formController.getFormById);

//MasterData
router.get("/getMasters", masterController.getMasters);
export default router;
