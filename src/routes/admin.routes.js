import { Router } from "express";
// import * as authController from "../controllers/user.controller.js";
import * as formController from "../controllers/form.controller.js";
import * as hierarchyController from "../controllers/hierarchy.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";
import * as adminController from "../controllers/admin.controller.js";
import * as adminUserController from "../controllers/adminUser.controller.js";
import * as masterController from "../controllers/master.controller.js";
import * as universalFormController from "../controllers/universalForm.controller.js";
import * as universalHierarchyController from "../controllers/universalHierarchy.controller.js";
import { validateSchema, validateSchemaGet } from "../helper/validation.js";
import schema from "../validation/admin.schema.js"
import { checkGuestAccess } from "../middleware/checkGuestAccess.js"
import { verifyJWT } from "../middleware/checkAdminAuth.js"
import { verifyPermissionToken } from "../middleware/checkPemissionAuth.js";
import { verifyJWTSuperAdmin } from "../middleware/checkSuperAdminAuth.js";




const router = Router();



router.post("/register", checkGuestAccess(), adminController.register);
router.post("/login", checkGuestAccess(), adminController.loginAdmin);
router.post("/super/login", checkGuestAccess(), adminController.loginSuperAdmin);
router.post("/verifyOTP", checkGuestAccess(), adminController.verifyOTP);

//User Routes

router.get("/getUser", verifyJWT(), adminController.getUser);

//Super Admin Exclusive Routes

router.post("/createAdmin", validateSchema(schema.validateCreateAdmin), verifyJWTSuperAdmin(), adminUserController.createAdmin);
router.get("/getAllAdmins", verifyJWTSuperAdmin(), adminUserController.getAllAdmins);
router.get("/exportAdminsToExcel", verifyJWTSuperAdmin(), adminUserController.exportAdminsToExcel);
router.get("/getAdminById", verifyJWTSuperAdmin(), adminUserController.getAdminById);
router.put("/updateAdmin", validateSchema(schema.validateUpdateAdmin), verifyJWTSuperAdmin(), adminUserController.updateAdmin);
router.delete("/deleteAdmin", verifyJWTSuperAdmin(), adminUserController.deleteAdmin);


router.post("/resendEmailToUser", verifyJWTSuperAdmin(), formController.resendEmailToUser);



//master data
router.post("/createMasters", verifyJWT(), masterController.createMasters);

//universal Form
// router.post("/createForm", verifyJWT(), universalFormController.createForm);
router.post("/createForm", universalFormController.createForm);
router.get("/getFormField/:id", universalFormController.getFormField);
router.get("/getFieldOptions", universalFormController.getFieldOptions);
router.get("/getUniversalForms", verifyJWT(), universalFormController.getForms);
router.get("/getFormById", universalFormController.getFormById);
router.post("/createFormResponse", universalFormController.createFormResponse);
router.put("/updateApprovalStatus", universalHierarchyController.updateApprovalStatus);



//dashboard routes
router.get("/getFormStatistics", verifyJWT(), dashboardController.getFormStatistics);
router.get("/getFormBarChartData", verifyJWT(), dashboardController.getFormBarChartData);
router.get("/getRegionPieChartData", verifyJWT(), dashboardController.getRegionPieChartData);
router.get("/getCharts", verifyJWT(), dashboardController.getCharts);
router.get("/getExcelExport",verifyJWT(), dashboardController.getExcelExport);

//notification routes


router.get("/getAllNotifications", verifyJWT(), dashboardController.getAllNotifications);
router.get("/getUnreadCount", verifyJWT(), dashboardController.getUnreadCount);


router.get("/getForms", verifyJWT(), formController.getForms);
router.put("/updateFormOnClick", verifyJWT(), validateSchema(schema.validateUpdateFormOnClick), formController.updateFormOnClick);


//form routes

// router.post("/createRequest", validateSchema(schema.validateCreateForm), formController.createForm);
// router.get("/getForms", formController.getForms);
router.get("/exportFormsToExcel", verifyJWT(), formController.exportFormsToExcel);
router.get("/exportHierarchiesToExcel", verifyJWT(), hierarchyController.exportHierarchiesExcel);

// router.get("/getFormById", validateSchemaGet(schema.validateGetFormById),formController.getFormById);

//Hierarchy routes

router.post("/createHierarchy", verifyJWT(), hierarchyController.createHierarchy);
router.post("/createUniversalHierarchy", hierarchyController.createUniversalHierarchy);
router.get("/getHierarchies", verifyJWT(), hierarchyController.getHierarchies);


router.get("/getRequestById", verifyPermissionToken(), hierarchyController.getRequestById);
router.get("/getRequestByIdPublic", hierarchyController.getRequestByIdPublic);
router.get("/getRequestByIdForAdmin", verifyJWT(), hierarchyController.getRequestByIdForAdmin);



export default router;
