/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

export const onRequestPost = async (context: any) => {
  const env = context.env;
  
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare" }), { status: 500 });
  }

  try {
    const { content, task } = await context.request.json();
    
    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'cloudflare-pages-functions',
        }
      }
    });

    const prompt = `당신은 법률 전문가입니다. 다음 법령 내용을 분석하고 ${task}를 작성해주세요. 답변은 한국어로 정중하게 작성해주세요.\n\n내용:\n${content}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return new Response(JSON.stringify({ analysis: response.text }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `AI Analysis Failed: ${error.message}` }), { status: 500 });
  }
};
