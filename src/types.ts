/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Law ID mapping for easier access
export const LAW_CODE_MAP = {
  CUSTOMS: "000201", // 관세법
  FOREIGN_TRADE: "004144", // 대외무역법
  FOREIGN_EXCHANGE: "005510", // 외국환거래법
} as const;

export type LawType = keyof typeof LAW_CODE_MAP;

export interface LawInfo {
  lawId: string;
  lawName: string;
  enforceDate: string;
  revisionType: string;
  revisionDate: string;
}

export interface LawRevision {
  seq: string;
  lawId: string;
  lawName: string;
  revisionDate: string;
  revisionNo: string;
  revisionType: string;
}

export interface LawArticle {
  articleNo: string;
  articleTitle: string;
  articleContent: string;
}

export interface LawSearchResult {
  count: number;
  laws: LawInfo[];
}
