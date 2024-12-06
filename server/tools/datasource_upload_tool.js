import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Buffer } from 'buffer';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_DATASOURCE_INDEX_NAME;
const CHUNK_SIZE = 10; // Number of rows per chunk

// Initialize Pinecone client
const client = new Pinecone({ apiKey: PINECONE_API_KEY });

/**
 * Parses a CSV file into chunks and uploads them to Pinecone.
 * @param {string} filePath - The path to the CSV file.
 */
async function parseCSVAndUploadToPinecone(filePath) {
    let chunk = [];
    let chunkIndex = 0;

    const stream = fs
        .createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
            chunk.push(row);

            if (chunk.length === CHUNK_SIZE) {
                stream.pause();
                await processAndUploadChunk(chunk, chunkIndex);
                chunk = [];
                chunkIndex++;
                stream.resume();
            }
        })
        .on('end', async () => {
            if (chunk.length > 0) {
                await processAndUploadChunk(chunk, chunkIndex);
            }
            console.log(
                'CSV file successfully processed and uploaded to Pinecone.'
            );
        });
}

/**
 * Processes a chunk of data by generating embeddings and uploading them to Pinecone.
 * @param {Array} chunk - Array of rows from the CSV file.
 * @param {number} chunkIndex - Index of the current chunk.
 */

async function processAndUploadChunk(filePath) {
    try {
        console.log('Starting to process file:', filePath);
        const index = client.Index(PINECONE_INDEX_NAME);
        console.log('Pinecone index initialized');

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 400,
        });

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: OPENAI_API_KEY,
        });
        console.log('OpenAI embeddings initialized');

        const fileExtension = path.extname(filePath).toLowerCase();
        const loader = await _getLoaderForFileType(fileExtension, filePath);
        console.log('File loader created');

        const documents = await loader.load();
        // console.log('Documents loaded, count:', documents);

        const text = documents.map((doc) => doc.pageContent).join('\n');
        const textChunks = await textSplitter.splitText(text);
        // console.log(`Chunks created: ${textChunks}`);

        console.log('Starting to generate embeddings...');
        const vectorEmbeddings = await Promise.all(
            textChunks.map((chunk) => embeddings.embedQuery(chunk))
        );
        console.log('Embeddings generated, count:', vectorEmbeddings.length);

        console.log('Sample embedding:', vectorEmbeddings[0]);

        const vectors = _prepareVectorsForPinecone(
            textChunks,
            vectorEmbeddings
        );
        console.log('Vectors prepared for Pinecone, count:', vectors.length);
        // console.log(
        //     'Sample vector:',
        //     JSON.stringify(vectors[0]).slice(0, 200) + '...'
        // ); // Log a truncated sample vector

        await _upsertVectorsToPinecone(index, vectors);
    } catch (error) {
        console.error(`Error processing file:`, error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}
async function _getLoaderForFileType(fileExtension, filePath) {
    switch (fileExtension) {
        case '.pdf':
            return new PDFLoader(filePath, { splitPages: false });
        case '.docx':
            return new DocxLoader(filePath);
        case '.csv':
            return new CSVLoader(filePath);
        default:
            throw new Error(`Unsupported file type: ${fileExtension}`);
    }
}
function decodeIfNeeded(text) {
    try {
        return Buffer.from(text, 'base64').toString('utf-8');
    } catch (error) {
        return text; // If it's not base64, return the original text
    }
}

function _prepareVectorsForPinecone(textChunks, vectorEmbeddings) {
    return textChunks.map((chunk, i) => ({
        id: `${i}`,
        values: vectorEmbeddings[i],
        metadata: {
            text: chunk.slice(0, 1000), // Store raw text, limited to 1000 characters
            chunkIndex: i,
        },
    }));
}
// ... previous code ...

async function _upsertVectorsToPinecone(index, vectors) {
    console.log('Upserting vectors to Pinecone...');

    try {
        const batchSize = 50; // Batch size for upserts
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);

            // Ensure batch contains valid vector objects
            if (
                !Array.isArray(batch) ||
                !batch.every((v) => Array.isArray(v.values) && v.id)
            ) {
                throw new Error('Invalid vector format in batch');
            }

            console.log(
                'Sample vector format:',
                JSON.stringify(batch[0], null, 2)
            );

            // The key change is here - pass vectors as an object property
            await index.upsert(batch);

            console.log(
                `Upserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
                    vectors.length / batchSize
                )}`
            );
        }

        console.log('All vectors upserted successfully');
    } catch (error) {
        console.error('Error upserting vectors:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw new Error('Failed to upsert vectors to Pinecone');
    }
}

// ... rest of the code ...

/**
 * Upserts vectors into Pinecone.
 * @param {Array} vectors - Array of vectors to upsert.
 */
async function upsertVectors(vectors) {
    try {
        await client.index(PINECONE_INDEX_NAME).upsert({ vectors });
    } catch (error) {
        console.error('Error upserting vectors:', error);
    }
}

// Usage example
const csvFilePath = 'path/to/your/csv/file'; // Replace with your CSV file path
processAndUploadChunk(csvFilePath);
