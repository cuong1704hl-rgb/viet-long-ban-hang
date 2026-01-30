
// Mock AI service - không cần API key
export const askAssistant = async (prompt: string, context: string): Promise<string> => {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simple mock responses
  const responses = [
    "Chào bạn! Tôi có thể giúp bạn tìm sản phẩm phù hợp. Bạn đang tìm loại sản phẩm nào?",
    "Sản phẩm của chúng tôi đều có chất lượng cao và giá cả hợp lý. Bạn muốn xem chi tiết sản phẩm nào?",
    "Cảm ơn bạn đã quan tâm! Tôi là trợ lý AI đơn giản. Hãy xem danh sách sản phẩm để chọn mua nhé!",
    "Chúng tôi có nhiều sản phẩm tốt. Vui lòng xem danh sách và chọn sản phẩm bạn thích!"
  ];

  // Return random response
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};
