/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "./components/Sidebar";
import { LawList } from "./components/LawGrid";
import { LawDetail } from "./components/LawDetail";
import { LawInfo, LawType, LAW_CODE_MAP } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [selectedLawType, setSelectedLawType] = useState<LawType | null>(null);
  const [laws, setLaws] = useState<LawInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLawDetailId, setSelectedLawDetailId] = useState<string | null>(null);

  const handleSelectLaw = async (type: LawType) => {
    setSelectedLawType(type);
    setSelectedLawDetailId(null);
    setIsLoading(true);
    
    try {
      // Search for the law using its mapped code name
      const queryMap = {
        CUSTOMS: "관세법",
        FOREIGN_TRADE: "대외무역법",
        FOREIGN_EXCHANGE: "외국환거래법"
      };
      const response = await axios.get(`/api/laws/search?query=${encodeURIComponent(queryMap[type])}`);
      setLaws(response.data.laws);
    } catch (err) {
      console.error("Failed to search laws", err);
      setLaws([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#E4E3E0] text-[#141414] antialiased select-none font-sans overflow-hidden">
      <Sidebar 
        selectedLaw={selectedLawType} 
        onSelectLaw={handleSelectLaw} 
        isLoading={isLoading} 
      />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {!selectedLawDetailId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <LawList 
                laws={laws} 
                onSelectLawDetail={setSelectedLawDetailId} 
                isLoading={isLoading} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <LawDetail 
                lawId={selectedLawDetailId} 
                onBack={() => setSelectedLawDetailId(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative visible grid lines */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#141414]/5" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-[#141414]/5" />
      </div>
    </div>
  );
}
