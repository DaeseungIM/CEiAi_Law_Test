import { LawInfo } from "../types";
import { ChevronRight, Download, History } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LawListProps {
  laws: LawInfo[];
  onSelectLawDetail: (id: string) => void;
  isLoading: boolean;
}

export function LawList({ laws, onSelectLawDetail, isLoading }: LawListProps) {
  const exportToCSV = () => {
    if (laws.length === 0) return;
    const headers = ["Law ID", "Law Name", "Enforce Date", "Revision Type", "Revision Date"];
    const rows = laws.map(l => [l.lawId, l.lawName, l.enforceDate, l.revisionType, l.revisionDate]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "law_history_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#E4E3E0]">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-[#141414]">
        <div>
          <h2 className="font-sans font-bold text-3xl uppercase tracking-tighter">Revision History</h2>
          <p className="font-sans text-xs opacity-60 mt-1">Found {laws.length} records matching your selection</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={laws.length === 0 || isLoading}
          className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 hover:bg-zinc-800 transition-colors disabled:opacity-30"
        >
          <Download className="w-4 h-4" />
          <span className="font-sans font-bold text-xs uppercase tracking-wider">Export CSV</span>
        </button>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-[100px_1fr_150px_150px_150px_50px] px-8 py-4 bg-[#141414] text-[#E4E3E0]">
        <div className="font-serif italic text-[10px] opacity-60 uppercase tracking-widest">ID</div>
        <div className="font-serif italic text-[10px] opacity-60 uppercase tracking-widest">Law Name</div>
        <div className="font-serif italic text-[10px] opacity-60 uppercase tracking-widest">Enforce Date</div>
        <div className="font-serif italic text-[10px] opacity-60 uppercase tracking-widest">Revision Type</div>
        <div className="font-serif italic text-[10px] opacity-60 uppercase tracking-widest">Revision Date</div>
        <div></div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="font-mono text-xs animate-pulse">FETCHING_DATA...</span>
          </div>
        ) : laws.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 opacity-20 grayscale">
            <History className="w-20 h-20 mb-4" />
            <p className="font-serif italic">Select a law from the sidebar to begin</p>
          </div>
        ) : (
          laws.map((law, idx) => (
            <div 
              key={`${law.lawId}-${idx}`}
              onClick={() => onSelectLawDetail(law.lawId)}
              className="grid grid-cols-[100px_1fr_150px_150px_150px_50px] px-8 py-4 border-b border-[#141414]/10 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer group"
            >
              <div className="font-mono text-xs self-center">{law.lawId}</div>
              <div className="font-sans font-bold text-sm self-center">{law.lawName}</div>
              <div className="font-mono text-[11px] self-center">{law.enforceDate}</div>
              <div className="font-sans text-[11px] self-center capitalize">{law.revisionType}</div>
              <div className="font-mono text-[11px] self-center">{law.revisionDate}</div>
              <div className="flex items-center justify-center">
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
