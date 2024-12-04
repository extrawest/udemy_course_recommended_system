import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { runAgent } from './agent.js';

const app = express();
const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Wrapper for async route handlers
const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

app.post(
    '/api/upload-cv',
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
        console.log('Received request');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        try {
            const filePath = req.file.path;
            console.log('File path:', filePath);

            const result = await runAgent(filePath);

            console.log('Result:', result);
            res.json(result);
        } catch (error) {
            console.error('Error processing CV:', error);
            res.status(500).send('Error processing CV');
        }
    })
);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
