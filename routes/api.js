import { Router} from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";
import authMiddleware from "../middleware/Authenticate.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../db/redis.config.js";
const router = Router();


router.post('/auth/register',AuthController.register)
router.post('/auth/login',AuthController.login)
router.get('/send-email',AuthController.sendTestEmail)

// * Profile Routes * 
router.get('/profile',authMiddleware,ProfileController.index);
router.put('/profile/:id',authMiddleware,ProfileController.update)

// * News Routes * 
router.get('/news', redisCache.route(),NewsController.index);
router.post('/news',authMiddleware,NewsController.store);
router.get('/news/:id',NewsController.show);
router.put('/news/:id',authMiddleware,NewsController.update);
router.delete('/news/:id',authMiddleware,NewsController.destroy);

export default router;