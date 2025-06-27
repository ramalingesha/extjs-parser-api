import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../middlewares/asyncHandler';
import { handleParse } from '../controllers/parseController';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/parse', upload.single('file'), asyncHandler(handleParse));

export default router;