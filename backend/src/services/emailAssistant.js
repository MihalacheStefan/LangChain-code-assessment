import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, StateGraph } from "@langchain/langgraph";
import { config } from "../config/env.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: config.gemini.apiKey,
  model: "gemini-1.5-flash",
  temperature: 0.7,
});

const stateSchema = {
  recipientName: "",
  messageContext: "",
  emailType: "",
  subject: "",
  body: "",
  error: null,
};

const emailTypeRouterNode = async (state) => {
  const { recipientName, messageContext } = state;

  const routerPrompt = PromptTemplate.fromTemplate(`
    Analyze the following email context and determine the most appropriate email type:
    
    Recipient: {recipientName}
    Context: {messageContext}
    
    Choose from these categories:
    1. "sales" - for business, formal communications, work-related matters, tailored to the recipient business description
    2. "follow_up" - for already sent sales emails, formal communications, polite follow-up emails
    
    Respond with only the category name (sales, follow_up).
  `);

  const response = await llm.invoke(
    await routerPrompt.format({ recipientName, messageContext })
  );
  const emailType = response.content.toLowerCase().trim();

  return {
    ...state,
    emailType,
  };
};

const salesEmailGeneratorNode = async (state) => {
  const { recipientName, messageContext } = state;

  const prompt = PromptTemplate.fromTemplate(`
    You are a sales assistant.
    Generate a professional sale email, tailored to the recipient business description:
    
    Recipient: {recipientName}
    Context: {messageContext}
    
    Create an email with:
    1. An attention-grabbing subject line. Clear and concise.
    2. A persuasive body that addresses the context and includes a call-to-action
    3. Keep the email under 40 words total. So it can be read under 10 seconds.
    4. max 7-10 words/sentence
    
    Respond with a JSON object containing "subject" and "body" fields.
  `);

  try {
    const response = await llm.invoke(
      await prompt.format({ recipientName, messageContext })
    );

    let content = response.content;

    // Remove markdown code blocks if present
    if (content.includes("```json")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      content = content.replace(/```\n?/g, "");
    }

    content = content.trim();
    const result = JSON.parse(content);

    return {
      ...state,
      subject: result.subject,
      body: result.body,
    };
  } catch (error) {
    return {
      ...state,
      error: "Failed to generate sales email",
    };
  }
};

const followUpEmailGeneratorNode = async (state) => {
  const { recipientName, messageContext } = state;

  const prompt = PromptTemplate.fromTemplate(`
    You are a follow-up assistant.
    Generate a sales follow-up email for the following context:
    
    Recipient: {recipientName}
    Context: {messageContext}
    
    Create a follow-up email with:
    1. A friendly, polite, professional subject line
    2. A warm, polite and concise body that addresses the context
    3. (e.g., “just checking in”)
    
    Respond with a JSON object containing "subject" and "body" fields.
  `);

  try {
    const response = await llm.invoke(
      await prompt.format({ recipientName, messageContext })
    );
    let content = response.content;

    // Remove markdown code blocks if present
    if (content.includes("```json")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      content = content.replace(/```\n?/g, "");
    }

    content = content.trim();
    const result = JSON.parse(content);

    return {
      ...state,
      subject: result.subject,
      body: result.body,
    };
  } catch (error) {
    return {
      ...state,
      error: "Failed to generate follow-up email",
    };
  }
};

const createEmailGraph = () => {
  const workflow = new StateGraph({
    channels: stateSchema,
  });

  workflow.addNode("router", emailTypeRouterNode);
  workflow.addNode("sales", salesEmailGeneratorNode);
  workflow.addNode("follow_up", followUpEmailGeneratorNode);

  workflow.addConditionalEdges(
    "router",
    (state) => {
      switch (state.emailType) {
        case "sales":
          return "sales";
        case "follow_up":
          return "follow_up";
        default:
          return "sales";
      }
    },
    {
      sales: "sales",
      follow_up: "follow_up",
    }
  );

  workflow.addEdge("sales", END);
  workflow.addEdge("follow_up", END);

  workflow.setEntryPoint("router");

  return workflow.compile();
};

export const generateEmail = async (recipientName, messageContext) => {
  try {
    const graph = createEmailGraph();

    const result = await graph.invoke({
      recipientName,
      messageContext,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      success: true,
      emailType: result.emailType,
      subject: result.subject,
      body: result.body,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to generate email",
    };
  }
};
