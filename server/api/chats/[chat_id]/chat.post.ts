import { chatMessageSchema, chatSchema, repoSchema } from '~/server/schemas';
import { and, eq } from 'drizzle-orm';

import type { Document } from '@langchain/core/documents';

import { Runnable, RunnableSequence, RunnableMap, RunnableBranch, RunnableLambda } from '@langchain/core/runnables';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate, ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/memory';

// Combine search results together into a coherent answer.
// Do not repeat text.
// Cite search results using [\${{number}}] notation.
// Only cite the most relevant results that answer the question accurately.
// Place these citations at the end of the sentence or paragraph that reference them - do not put them all at the end.
// If different results refer to different entities within the same name, write separate answers for each entity.

const RESPONSE_TEMPLATE = `You are an expert programmer and problem-solver, tasked to answer any question about a repository.
Using the provided context, answer the user's question to the best of your ability using the resources provided.
Generate a comprehensive and informative answer (but no more than 80 words) for a given question based solely on the provided search results (URL and content).
You should mainly reply on the search results, but you can also use your general knowledge of programming to provide a more accurate answer.
Use an unbiased and journalistic tone.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.

You should use bullet points and markdown in your answer for readability.
Put code citations where they apply rather than putting them all at the end.

Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.

<context>
{context}
<context/>

REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." Don't try to make up an answer.
Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`;

const REPHRASE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:`;

type RetrievalChainInput = {
  chat_history: string;
  question: string;
};

const createRetrieverChain = (llm: BaseChatModel, retriever: Runnable) => {
  // Small speed/accuracy optimization: no need to rephrase the first question
  // since there shouldn't be any meta-references to prior chat history
  const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(REPHRASE_TEMPLATE);
  const condenseQuestionChain = RunnableSequence.from([
    CONDENSE_QUESTION_PROMPT,
    llm,
    new StringOutputParser(),
  ]).withConfig({
    runName: 'CondenseQuestion',
  });
  const hasHistoryCheckFn = RunnableLambda.from(
    (input: RetrievalChainInput) => input.chat_history.length > 0,
  ).withConfig({ runName: 'HasChatHistoryCheck' });
  const conversationChain = condenseQuestionChain.pipe(retriever).withConfig({
    runName: 'RetrievalChainWithHistory',
  });
  const basicRetrievalChain = RunnableLambda.from((input: RetrievalChainInput) => input.question)
    .withConfig({
      runName: 'Itemgetter:question',
    })
    .pipe(retriever)
    .withConfig({ runName: 'RetrievalChainWithNoHistory' });

  return RunnableBranch.from([[hasHistoryCheckFn, conversationChain], basicRetrievalChain]).withConfig({
    runName: 'FindDocs',
  });
};

const formatDocs = (docs: Document[]) => {
  return docs.map((doc, i) => `<doc id='${i}'>${doc.pageContent}</doc>`).join('\n');
};

const formatChatHistoryAsString = (history: BaseMessage[]) => {
  return history.map((message) => `${message._getType()}: ${message.content}`).join('\n');
};

const serializeHistory = (input: any) => {
  const chatHistory = input.chat_history || [];
  const convertedChatHistory = [];
  for (const message of chatHistory) {
    if (message.human !== undefined) {
      convertedChatHistory.push(new HumanMessage({ content: message.human }));
    }
    if (message['ai'] !== undefined) {
      convertedChatHistory.push(new AIMessage({ content: message.ai }));
    }
  }
  return convertedChatHistory;
};

const createChain = (llm: BaseChatModel, retriever: Runnable) => {
  const retrieverChain = createRetrieverChain(llm, retriever);
  const context = RunnableMap.from({
    context: RunnableSequence.from([
      ({ question, chat_history }) => ({
        question,
        chat_history: formatChatHistoryAsString(chat_history),
      }),
      retrieverChain,
      RunnableLambda.from(formatDocs).withConfig({
        runName: 'FormatDocumentChunks',
      }),
    ]),
    question: RunnableLambda.from((input: RetrievalChainInput) => input.question).withConfig({
      runName: 'Itemgetter:question',
    }),
    chat_history: RunnableLambda.from((input: RetrievalChainInput) => input.chat_history).withConfig({
      runName: 'Itemgetter:chat_history',
    }),
  }).withConfig({ tags: ['RetrieveDocs'] });
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', RESPONSE_TEMPLATE],
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ]);

  const responseSynthesizerChain = RunnableSequence.from([prompt, llm]).withConfig({
    tags: ['GenerateResponse'],
  });
  return RunnableSequence.from([
    {
      question: RunnableLambda.from((input: RetrievalChainInput) => input.question).withConfig({
        runName: 'Itemgetter:question',
      }),
      chat_history: RunnableLambda.from(serializeHistory).withConfig({
        runName: 'SerializeHistory',
      }),
    },
    context,
    responseSynthesizerChain,
  ]);
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const chatId = getRouterParam(event, 'chat_id');
  if (!chatId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'chat_id is required',
    });
  }

  const chat = await db
    .select()
    .from(chatSchema)
    .where(and(eq(chatSchema.id, parseInt(chatId, 10)), eq(chatSchema.userId, user.id)))
    .get();

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found',
    });
  }

  const body = await readBody<{
    message: string;
  }>(event);
  const message = body?.message;
  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'message and chat_id are required',
    });
  }

  const repo = await db.select().from(repoSchema).where(eq(repoSchema.id, chat.repoId)).get();
  if (!repo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Repo not found',
    });
  }

  const config = useRuntimeConfig();

  const llm = new ChatOpenAI({ modelName: config.ai.model, openAIApiKey: config.ai.token, temperature: 0 });

  const vectorStore = await getRepoVectorStore(repo.id);

  const retriever = vectorStore.asRetriever({
    // searchType: 'mmr', // Use max marginal relevance search
    // searchKwargs: { fetchK: 5 },
    k: 6,
  });

  const chatHistory = new ChatMessageHistory();

  const messages = await db.select().from(chatMessageSchema).where(eq(chatMessageSchema.chatId, chat.id)).all();
  for (const message of messages) {
    if (message.from === 'user') {
      await chatHistory.addAIMessage(message.content);
    } else if (message.from === 'ai') {
      await chatHistory.addUserMessage(message.content);
    }
  }

  const answerChain = createChain(llm, retriever);

  const llmDisplayName = config.ai.model;

  let runIdResolver: (runId: string) => void;
  const runIdPromise = new Promise<string>((resolve) => {
    runIdResolver = resolve;
  });

  const stream = await answerChain.stream(
    {
      question: message,
      chat_history: await chatHistory.getMessages(),
    },
    {
      tags: ['model:' + llmDisplayName, 'RetrieveDocs'],
      metadata: {
        conversation_id: chat.id,
        llm: llmDisplayName,
      },
      callbacks: [
        {
          handleChainStart(_llm, _prompts, runId) {
            runIdResolver(runId);
          },
        },
      ],
    },
    // {
    //   includeNames: ['FindDocs'],
    // },
  );

  async function finishChat(result: string) {
    console.log('result', result);

    // summarize the dialog when we got the second question from the user
    if (messages.length >= 2 && chat && chat.name.startsWith('Chat with')) {
      const context = [
        'Provide keywords or a short summary with maximal six words for the following dialog:\n',
        ...messages.map((m) => `${m.from}: ${m.content}`),
        `user: ${message}`,
        `ai: ${result}`,
      ];
      const chatSummary = await llm.invoke(context.join('\n'));
      await db.update(chatSchema).set({ name: chatSummary.content.toString() }).where(eq(chatSchema.id, chat.id)).run();
    }

    await db
      .insert(chatMessageSchema)
      .values([
        {
          chatId: chat!.id,
          from: 'user',
          content: message,
          createdAt: new Date(),
        },
        {
          chatId: chat!.id,
          from: 'ai',
          content: result,
          createdAt: new Date(),
        },
      ])
      .run();
  }

  // Only return a selection of output to the frontend
  let result = '';
  const textEncoder = new TextEncoder();
  const clientStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        result += chunk.content;
        controller.enqueue(textEncoder.encode('event: data\ndata: ' + chunk.content + '\n\n'));
      }
      controller.enqueue(textEncoder.encode('event: end\n\n'));

      await finishChat(result);

      controller.close();
    },
  });

  // setResponseHeader(event, 'Content-Type', 'text/html');
  // setResponseHeader(event, 'Cache-Control', 'no-cache');
  // setResponseHeader(event, 'Transfer-Encoding', 'chunked');

  const runId = await runIdPromise;
  return new Response(clientStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'X-Langsmith-Run-Id': runId,
    },
  });
});
