import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { Document } from 'langchain/document';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as path from 'path';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

import pdf from 'pdf-parse';

dotenv.config();

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

// Custom tools for file parsing and Pinecone storage
const parseFileTool = new DynamicStructuredTool({
    name: 'parse_file',
    description: 'Parse PDF, DOCX, or CSV file',
    schema: z.object({
        filePath: z.string(),
    }),

    func: async ({ filePath }) => {
        const fileExtension = path.extname(filePath).toLowerCase();
        const loader = _getLoaderForFileType(fileExtension, filePath);
        const documents = await loader.load();

        return documents;
    },
});

function _getLoaderForFileType(fileExtension: string, filePath: string) {
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

const saveToPineconeTool = new DynamicStructuredTool({
    name: 'save_to_pinecone',
    description: 'Save parsed content to Pinecone vector store',
    schema: z.object({
        content: z.string(),
        metadata: z.record(z.any()),
    }),
    func: async ({ content, metadata }) => {
        const index = pinecone.Index('udemy-offer');
        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex: index }
        );

        const doc = new Document({ pageContent: content, metadata });
        await vectorStore.addDocuments([doc]);

        return 'Content saved to Pinecone successfully';
    },
});

// Define the tools for the agent to use
const tools = [parseFileTool, saveToPineconeTool];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
}).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.additional_kwargs.tool_calls) {
        return 'tools';
    }
    return '__end__';
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addEdge('__start__', 'agent')
    .addNode('tools', toolNode)
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', shouldContinue);

// Compile the graph into a LangChain Runnable
const app = workflow.compile();

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

export async function runAgent(filePath: string) {
    try {
        // Parse the file directly
        const documents = await parseFileTool.func({ filePath });
        console.log('Parsed documents:', documents);

        // Extract the pageContent from the first document (assuming there's only one)
        const fullContent = documents[0].pageContent;

        // Split the content into chunks
        const chunks = await textSplitter.splitText(fullContent);
        console.log(`Split into ${chunks.length} chunks`);

        // Generate a unique ID for this document
        const documentId = `doc_${Date.now()}`;

        // Prepare vectors for Pinecone
        const embeddings = new OpenAIEmbeddings();
        const vectors = await Promise.all(
            chunks.map(async (chunk, index) => {
                const vector = await embeddings.embedQuery(chunk);
                return {
                    id: `${documentId}_chunk_${index}`,
                    values: vector,
                    metadata: {
                        text: chunk,
                        documentId: documentId,
                        filePath: filePath,
                        chunkIndex: index,
                    },
                };
            })
        );

        // Save to Pinecone
        const index = pinecone.Index('udemy-offer');
        await index.upsert(vectors);

        console.log(`Saved ${vectors.length} vectors to Pinecone`);

        // Use the agent to analyze and summarize the content
        const analyzeInstruction = ` Provide a comprehensive summary of the following document fragments:

             ${fullContent}

             Summary should be divided into 3 aections:
            1. Level (Junior/Middle/Senior/Architect/etc.)
            2. Developer Role (Frontend, Backend, Full Stack, Mobile, Designer, PM, etc.)
            3. Skillset (java, .net, html, css, angular, react, flutter, etc.)`;
        const analyzeState = await app.invoke({
            messages: [new HumanMessage(analyzeInstruction)],
        });
        const analysis =
            analyzeState.messages[analyzeState.messages.length - 1].content;
        console.log('Analysis:', analysis);
        return analysis;
    } catch (error) {
        console.error('Error in runAgent:', error);
    }
}
