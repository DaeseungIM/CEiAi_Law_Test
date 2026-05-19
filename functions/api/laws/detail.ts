/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseStringPromise } from "xml2js";

export const onRequestGet = async (context: any) => {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  const env = context.env;
  
  if (!id) {
    return new Response(JSON.stringify({ error: "Law ID is required" }), { status: 400 });
  }

  const LAW_API_BASE = "http://www.law.go.kr/DRF";
  const USER_ID = env.LAW_API_KEY || "test";
  
  const url = `${LAW_API_BASE}/lawService.do?target=law&OC=${USER_ID}&type=XML&ID=${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData);

    const law = result.법령;
    const articles = law.조문?.[0]?.조문단위 || [];
    
    const formattedArticles = articles.map((a: any) => ({
      articleNo: a.조문번호?.[0],
      articleTitle: a.조문제목?.[0],
      articleContent: a.조문내용?.[0]?.replace(/\n/g, '<br/>'),
    }));

    return new Response(JSON.stringify({
      lawName: law.기본정보?.[0]?.법령명한글?.[0],
      articles: formattedArticles
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `API Detail Failed: ${error.message}` }), { status: 500 });
  }
};
