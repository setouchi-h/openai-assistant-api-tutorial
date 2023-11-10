// 必要なライブラリをインポート
const { OpenAIAPI } = require("openai");

// APIキーを設定（実際の開発では環境変数や別のセキュアな方法で管理する）
const openai = new OpenAIAPI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ステップ 1: アシスタントの作成
const createAssistant = async () => {
  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    instructions:
      "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview",
  });
  return assistant;
};

// ステップ 2: スレッドの作成
const createThread = async () => {
  const thread = await openai.beta.threads.create();
  return thread;
};

// ステップ 3: スレッドへのメッセージの追加
const addMessageToThread = async (threadId, userMessage) => {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: userMessage,
  });
  return message;
};

// ステップ 4: アシスタントの実行
const runAssistant = async (threadId, assistantId, additionalInstructions) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    instructions: additionalInstructions,
  });
  return run;
};

// ステップ 5: アシスタントの応答の表示
const getAssistantResponse = async (threadId, runId) => {
  // 実行が完了するまで待機
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  while (run.status !== "completed") {
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
  }

  // アシスタントが追加したメッセージを取得
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages;
};

// 実際にアシスタントを使用する例
const useMathTutor = async () => {
  const assistant = await createAssistant();
  const thread = await createThread();
  const userMessage =
    "I need to solve the equation `3x + 11 = 14`. Can you help me?";
  await addMessageToThread(thread.id, userMessage);
  const run = await runAssistant(
    thread.id,
    assistant.id,
    "Please address the user as Jane Doe. The user has a premium account."
  );
  const messages = await getAssistantResponse(thread.id, run.id);
  console.log(messages);
};

// チューターの使用を開始
useMathTutor();
