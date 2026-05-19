import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy Law API
// Base URL: http://www.law.go.kr/DRF (Using HTTP to avoid SSL/Handshake issues as noted in blueprint)
const LAW_API_BASE = "http://www.law.go.kr/DRF";
const USER_ID = process.env.LAW_API_KEY || "test";

const apiHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

app.get("/api/laws/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const url = `${LAW_API_BASE}/lawSearch.do?target=law&OC=${USER_ID}&type=XML&query=${encodeURIComponent(query as string)}`;
    const response = await axios.get(url, { headers: apiHeaders });
    const result = await parseStringPromise(response.data);

    const laws = result.LawSearch?.law || [];
    const formattedLaws = laws.map((l: any) => ({
      lawId: l.법령ID?.[0],
      lawName: l.법령명한글?.[0],
      enforceDate: l.시행일자?.[0],
      revisionType: l.제개정구분명?.[0],
      revisionDate: l.공포일자?.[0],
    }));

    res.json({
      count: parseInt(result.LawSearch?.totalCount?.[0] || "0"),
      laws: formattedLaws
    });
  } catch (error: any) {
    console.error("API Search Error:", error.message);
    res.status(500).json({ error: `API Search Failed: ${error.message}` });
  }
});

app.get("/api/laws/detail", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Law ID is required" });

    const url = `${LAW_API_BASE}/lawService.do?target=law&OC=${USER_ID}&type=XML&ID=${id}`;
    const response = await axios.get(url, { headers: apiHeaders });
    const result = await parseStringPromise(response.data);

    const law = result.법령;
    const articles = law.조문?.[0]?.조문단위 || [];
    
    const formattedArticles = articles.map((a: any) => ({
      articleNo: a.조문번호?.[0],
      articleTitle: a.조문제목?.[0],
      articleContent: a.조문내용?.[0]?.replace(/\n/g, '<br/>'),
    }));

    res.json({
      lawName: law.기본정보?.[0]?.법령명한글?.[0],
      articles: formattedArticles
    });
  } catch (error: any) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch law details" });
  }
});

// AI Analysis Endpoint
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { content, task } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `당신은 법률 전문가입니다. 다음 법령 내용을 분석하고 ${task}를 작성해주세요. 답변은 한국어로 정중하게 작성해주세요.\n\n내용:\n${content}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
