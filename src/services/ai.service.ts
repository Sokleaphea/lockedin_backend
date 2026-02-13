import { Types } from "mongoose";
import { groq } from "../config/groq";
import { ChatSession, IChatSession } from "../models/chatSession.model";
import { ChatMessage, IChatMessage } from "../models/chatMessage.model";
import { parseAiResponse, AiTaskResponse } from "../utils/aiValidation";

const SYSTEM_PROMPT = `You are LockedIn AI, a structured productivity planning engine.

Your ONLY responsibility is to break down goals into smaller, actionable, realistic steps.

STRICT RULES:
- Do NOT answer general knowledge questions.
- Do NOT engage in casual conversation.
- Do NOT provide emotional advice.
- If the request is unrelated to task breakdown, return:
  { "status": "unsupported_request" }

When given a new goal:
- Break it into clear, ordered, actionable steps.
- Keep steps practical and specific.
- Avoid generic advice.
- Include only necessary steps.

When given a refinement request:
- Modify ONLY affected steps.
- Keep existing steps unless user explicitly asks to remove or regenerate.
- Do NOT restart plan from scratch unless explicitly requested.

If goal is too vague:
- Set status to "clarification_required"
- Ask one clear clarification question.

You MUST return ONLY valid JSON in this format:

{
  "status": "planned" | "clarification_required" | "unsupported_request",
  "steps": [
    {
      "step": number,
      "title": "string",
      "description": "string"
    }
  ],
  "clarification_question": "string"
}`;

const MAX_CONTEXT_MESSAGES = 10;

export async function handleChatMessage(
  userId: Types.ObjectId,
  message: string,
  chatId?: string
): Promise<{ chatId: string; response: AiTaskResponse }> {
  let sessionId: Types.ObjectId;
  let messageType: "goal" | "refinement";

  if (chatId) {
    const session = await ChatSession.findOne({
      _id: chatId,
      userId,
    });

    if (!session) {
      throw new Error("Chat session not found");
    }

    sessionId = session._id;
    messageType = "refinement";
  } else {
    const session = await ChatSession.create({
      userId,
      title: message.slice(0, 100),
      status: "planned",
    });

    sessionId = session._id;
    messageType = "goal";
  }

  await ChatMessage.create({
    chatId: sessionId,
    role: "user",
    type: messageType,
    content: message,
  });

  const recentMessages = await ChatMessage.find({
    chatId: sessionId,
    role: { $ne: "system" },
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_MESSAGES);

  recentMessages.reverse();

  const groqMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...recentMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: groqMessages,
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error("Empty AI response");
  }

  const parsed = parseAiResponse(rawContent);

  let assistantType: "breakdown" | "clarification";
  if (parsed.status === "planned") {
    assistantType = "breakdown";
  } else {
    assistantType = "clarification";
  }

  await ChatMessage.create({
    chatId: sessionId,
    role: "assistant",
    type: assistantType,
    content: rawContent,
  });

  if (parsed.status === "planned" || parsed.status === "clarification_required") {
    await ChatSession.findByIdAndUpdate(sessionId, {
      status: parsed.status,
    });
  }

  return { chatId: sessionId.toString(), response: parsed };
}

export async function getUserChats(
  userId: Types.ObjectId
): Promise<IChatSession[]> {
  return ChatSession.find({ userId }).sort({ updatedAt: -1 });
}

export async function getChatWithMessages(
  userId: Types.ObjectId,
  chatId: string
): Promise<{ session: IChatSession; messages: IChatMessage[] } | null> {
  const session = await ChatSession.findOne({ _id: chatId, userId });

  if (!session) {
    return null;
  }

  const messages = await ChatMessage.find({ chatId: session._id }).sort({
    createdAt: 1,
  });

  return { session, messages };
}
