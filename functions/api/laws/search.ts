/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseStringPromise } from "xml2js";

export const onRequestGet = async (context: any) => {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get("query");
  const env = context.env;
  
  if (!query) {
    return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
  }

  const LAW_API_BASE = "http://www.law.go.kr/DRF";
  const USER_ID = env.LAW_API_KEY || "test";
  
  const url = `${LAW_API_BASE}/lawSearch.do?target=law&OC=${USER_ID}&type=XML&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData);

    const laws = result.LawSearch?.law || [];
    const formattedLaws = laws.map((l: any) => ({
      lawId: l.법령ID?.[0],
      lawName: l.법령명한글?.[0],
      enforceDate: l.시행일자?.[0],
      revisionType: l.제개정구분명?.[0],
      revisionDate: l.공포일자?.[0],
    }));

    return new Response(JSON.stringify({
      count: parseInt(result.LawSearch?.totalCount?.[0] || "0"),
      laws: formattedLaws
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `API Search Failed: ${error.message}` }), { status: 500 });
  }
};
