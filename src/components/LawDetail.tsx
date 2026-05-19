import { useState, useEffect } from "react";
import { LawArticle } from "../types";
import { ArrowLeft, Sparkles, BookOpen, Loader2 } from "lucide-react";
import axios from "axios";

interface LawDetailProps {
  lawId: string;
  onBack: () => void;
}

export function LawDetail({ lawId, onBack }: LawDetailProps) {
  const [data, setData] = useState<{ lawName: string; articles: LawArticle[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/laws/detail?id=${lawId}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch detail", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [lawId]);

  const handleAIAnalyze = async () => {
    if (!data) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      // Pick first 5 articles for analysis to avoid token limit in this example
      const contentToAnalyze = data.articles.slice(0, 5).map(a => `${a.articleNo}: ${a.articleTitle}\n${a.articleContent}`).join("\n\n");
      const response = await axios.post("/api/ai/analyze", {
        content: contentToAnalyze,
        task: "이 법령의 핵심 취지와 행정적 의무사항 요약"
      });
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-mono text-xs mt-4">LOADING_LAW_DETAILS_OID_{lawId}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#E4E3E0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-[#141414]">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-full border border-[#141414]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-sans font-bold text-2xl uppercase tracking-tighter">{data?.lawName}</h2>
            <p className="font-mono text-[10px] opacity-60 mt-1 uppercase tracking-widest">Master OID: {lawId}</p>
          </div>
        </div>
        
        <button 
          onClick={handleAIAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-3 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="font-sans font-bold text-xs uppercase tracking-widest">AI Legal Analysis</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {data?.articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 opacity-20">
              <BookOpen className="w-16 h-16 mb-4" />
              <p className="font-serif italic">No articles found for this version</p>
            </div>
          ) : (
            data?.articles.map((article, idx) => (
              <div key={idx} className="max-w-4xl">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="font-mono text-sm font-bold bg-[#141414] text-[#E4E3E0] px-2 py-0.5">
                    ARTICLE_{article.articleNo}
                  </span>
                  <h3 className="font-sans font-bold text-lg">{article.articleTitle}</h3>
                </div>
                <div 
                  className="font-sans text-sm leading-relaxed text-[#141414]/80 ml-1 mt-2"
                  dangerouslySetInnerHTML={{ __html: article.articleContent }}
                />
              </div>
            ))
          )}
        </div>

        {/* AI Analysis Sidebar */}
        {(analysis || analyzing) && (
          <div className="w-[450px] border-l border-[#141414] bg-[#141414] text-[#E4E3E0] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Inference Result
              </h3>
              {analyzing && <span className="font-mono text-[9px] animate-pulse">PROCESSING...</span>}
            </div>
            <div className="flex-1 p-8 overflow-y-auto font-sans text-sm leading-relaxed text-zinc-300">
              {analyzing ? (
                <div className="space-y-4 opacity-50">
                  <div className="h-4 bg-zinc-700 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-700 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-zinc-700 rounded w-4/6 animate-pulse" />
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                   {analysis?.split('\n').map((line, i) => (
                     <p key={i} className="mb-4 last:mb-0">{line}</p>
                   ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/10 mt-auto">
              <p className="font-serif italic text-[10px] opacity-40">
                Generated by Gemini-2.0-Flash. Legal summaries should be verified against official gazettes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
