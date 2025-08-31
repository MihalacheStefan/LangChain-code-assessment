import dotenv from "dotenv";

dotenv.config();

export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  port: process.env.PORT || 3001,
};

export const validateConfig = () => {
  if (!config.gemini.apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
};
