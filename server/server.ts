import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

import multer from 'multer';
import path from 'path';
import { runAgent } from './agent.js';
import { getTopCourses } from './coursesAgent.js';
import fs from 'fs';

const app = express();
const port = 3000;
app.use(express.json());
app.use(bodyParser.raw({ type: 'application/json' }));

// app.use((req, res, next) => {
//     if (req.body) {
//         console.log('Raw body:', req.body.toString());
//         try {
//             req.body = JSON.parse(req.body.toString());
//         } catch (e) {
//             console.error('Error parsing JSON:', e);
//         }
//     }
//     next();
// });
// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

function cleanUploadsFolder() {
    const directory = 'uploads/';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });
}
const upload = multer({ storage: storage });

// Wrapper for async route handlers
const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

app.post(
    '/api/upload-cv',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        console.log('Received request');

        // Clean uploads folder
        cleanUploadsFolder();

        // Continue with file upload
        upload.single('file')(req, res, async (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send('Error uploading file');
            }

            console.log('Request body:', req.body);
            console.log('Request file:', req.file);

            if (!req.file) {
                return res.status(400).send('No file uploaded.');
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
        });
    })
);

app.post(
    '/api/course-recommendation',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        console.log('Received request');
        console.log('Request body:', req.body.query);
        console.log('Content-Type:', req.get('Content-Type'));

        const query = req.body.query;

        console.log('Query:', query);

        try {
            const result = await getTopCourses(query);

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
