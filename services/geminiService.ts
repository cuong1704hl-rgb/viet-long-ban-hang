
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAssistant = async (prompt: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful sales assistant for "SGE Store". 
      Context of current products: ${context}.
      User query: ${prompt}`,
      config: {
        systemInstruction: "Trả lời ngắn gọn, lịch sự bằng tiếng Việt. Giúp khách hàng chọn sản phẩm phù hợp.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, tôi gặp chút trục trặc khi kết nối. Tôi có thể giúp gì khác cho bạn?";
  }
};
