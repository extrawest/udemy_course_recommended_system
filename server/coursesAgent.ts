import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_DATASOURCE_INDEX_NAME!);

// Custom tool for querying Pinecone
const queryPineconeTool = new DynamicStructuredTool({
    name: 'query_pinecone',
    description: 'Query Pinecone vector store for relevant courses',
    schema: z.object({
        query: z.string(),
    }),
    func: async ({ query }) => {
        const embeddings = new OpenAIEmbeddings();
        const queryEmbedding = await embeddings.embedQuery(query);

        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 3,
            includeMetadata: true,
        });

        return JSON.stringify(queryResponse.matches);
    },
});

// Define the tools for the agent to use
const tools = [queryPineconeTool];
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

export async function getTopCourses(input: string) {
    const instruction = `Based on the following input: "${input}", query the Pinecone database for the top 3 relevant Udemy courses. Then, provide a list of these courses with their titles and URLs in the following format:

    1. [Course Title] - [Course URL]
    2. [Course Title] - [Course URL]
    3. [Course Title] - [Course URL]

    Make sure to include only the most relevant courses based on the input.`;

    const finalState = await app.invoke({
        messages: [new HumanMessage(instruction)],
    });

    return finalState.messages[finalState.messages.length - 1].content;
}

// Example usage
// getTopCourses(
//     'Junior Level, Frontend developer with skillset of Html, Css, React.js, Vercel'
// )
//     .then(console.log)
//     .catch(console.error);
