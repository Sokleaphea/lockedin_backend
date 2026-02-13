const BLOCKED_PATTERNS = [
  /^(who|what|where|when|why|how)\s+(is|are|was|were|do|does|did|can|could|would|should)\b/i,
  /^(tell|explain|describe|define)\s+(me|us)?\s*(about|what|how|why)/i,
  /^(hi|hello|hey|sup|yo|good\s*(morning|afternoon|evening))/i,
  /^(thank|thanks|thx)/i,
  /^(how are you|what's up|how's it going)/i,
  /\b(joke|story|poem|song|recipe|weather|news)\b/i,
  /\b(feel|feeling|emotion|sad|happy|depressed|anxious|stressed)\b/i,
  /^(can you|do you|are you)\b/i,
];

export function validateAiInput(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message is required" };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: "Message exceeds 1000 character limit" };
  }

  return { valid: true };
}

export function isUnrelatedInput(message: string): boolean {
  const trimmed = message.trim();

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}

export interface AiTaskResponse {
  status: "planned" | "clarification_required" | "unsupported_request";
  steps?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  clarification_question?: string;
}

export function parseAiResponse(raw: string): AiTaskResponse {
  let parsed: AiTaskResponse;

  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try extracting JSON object from surrounding text
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI response is not valid JSON");
    }

    parsed = JSON.parse(raw.slice(start, end + 1));
  }

  const validStatuses = ["planned", "clarification_required", "unsupported_request"];
  if (!validStatuses.includes(parsed.status)) {
    throw new Error(`Invalid status in AI response: ${parsed.status}`);
  }

  if (parsed.status === "planned") {
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error("AI response with status 'planned' must include steps");
    }

    for (const step of parsed.steps) {
      if (
        typeof step.step !== "number" ||
        typeof step.title !== "string" ||
        typeof step.description !== "string"
      ) {
        throw new Error("Invalid step format in AI response");
      }
    }
  }

  if (parsed.status === "clarification_required") {
    if (
      !parsed.clarification_question ||
      typeof parsed.clarification_question !== "string"
    ) {
      throw new Error(
        "AI response with status 'clarification_required' must include a clarification_question"
      );
    }
  }

  return parsed;
}
