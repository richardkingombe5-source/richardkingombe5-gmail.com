import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GeminiModel } from "../types";

// Initialize the client. 
// Note: In a real production app, you might want to lazily initialize this 
// or handle the key check more robustly.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamChat = async function* (
  modelName: string,
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  images: string[] = []
) {
  const client = getClient();
  
  // Transform history for the SDK
  // The SDK expects 'user' and 'model' roles.
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: h.parts
  }));

  const chat: Chat = client.chats.create({
    model: modelName,
    history: chatHistory,
    config: {
      // Add thinking budget if using Pro model for complex tasks, 
      // but for general chat we keep it simple or 0 to save latency.
      thinkingConfig: modelName === GeminiModel.PRO ? { thinkingBudget: 0 } : undefined
    }
  });

  // If we have images, we need to send them as parts in the new message
  let messageParts: any[] = [{ text: newMessage }];
  
  if (images.length > 0) {
    const imageParts = images.map(img => {
      // Assuming img is "data:image/png;base64,..."
      const [metadata, data] = img.split(',');
      const mimeType = metadata.match(/:(.*?);/)?.[1] || 'image/png';
      return {
        inlineData: {
          mimeType,
          data
        }
      };
    });
    messageParts = [...imageParts, ...messageParts];
  }

  // sendMessageStream only takes 'message' which can be a string or part[]
  // However, the types say 'message: string | Part[] | ...'
  // Let's coerce correctly.
  const responseStream = await chat.sendMessageStream({ 
    message: messageParts.length === 1 && !images.length ? newMessage : messageParts 
  });

  for await (const chunk of responseStream) {
    const c = chunk as GenerateContentResponse;
    if (c.text) {
      yield c.text;
    }
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string[]> => {
  const client = getClient();
  // Using the pro image preview model for high quality
  const response = await client.models.generateContent({
    model: GeminiModel.IMAGE,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    }
  });

  const images: string[] = [];
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64 = part.inlineData.data;
        const mime = part.inlineData.mimeType || 'image/png';
        images.push(`data:${mime};base64,${base64}`);
      }
    }
  }
  
  return images;
};