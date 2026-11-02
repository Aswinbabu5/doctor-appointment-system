import { Router } from 'express';
import { AuthController, registerUserSchema, registerDoctorSchema, loginSchema } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', validate(registerUserSchema), AuthController.registerUser);
router.post('/register-doctor', validate(registerDoctorSchema), AuthController.registerDoctor);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

export default router;
