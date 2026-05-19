import { Search, Scale, FileText, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { LAW_CODE_MAP, LawType } from "../types";

interface SidebarProps {
  selectedLaw: LawType | null;
  onSelectLaw: (law: LawType) => void;
  isLoading: boolean;
}

export function Sidebar({ selectedLaw, onSelectLaw, isLoading }: SidebarProps) {
  const laws: { id: LawType; name: string }[] = [
    { id: "CUSTOMS", name: "관세법 (Customs Law)" },
    { id: "FOREIGN_TRADE", name: "대외무역법 (Foreign Trade Law)" },
    { id: "FOREIGN_EXCHANGE", name: "외국환거래법 (Foreign Exchange)" },
  ];

  return (
    <div className="w-80 h-full border-r border-[#141414] bg-[#E4E3E0] flex flex-col p-6 overflow-y-auto shrink-0">
      <div className="flex items-center gap-3 mb-10">
        <Scale className="w-8 h-8 text-[#141414]" />
        <div>
          <h1 className="font-sans font-bold text-lg leading-tight tracking-tighter uppercase">CeiAi Law</h1>
          <p className="font-serif italic text-[10px] opacity-60">Economic Law Management System</p>
        </div>
      </div>

      <nav className="space-y-8">
        <div>
          <h2 className="font-serif italic text-xs opacity-50 uppercase tracking-widest mb-4">Target Laws</h2>
          <div className="space-y-2">
            {laws.map((law) => (
              <button
                key={law.id}
                onClick={() => onSelectLaw(law.id)}
                disabled={isLoading}
                className={cn(
                  "w-full text-left p-3 flex items-center justify-between transition-all group border border-transparent",
                  selectedLaw === law.id
                    ? "bg-[#141414] text-[#E4E3E0]"
                    : "hover:border-[#141414] text-[#141414]"
                )}
              >
                <span className="font-sans font-medium text-sm">{law.name}</span>
                <ChevronRight className={cn("w-4 h-4 opacity-0 transition-opacity group-hover:opacity-100", selectedLaw === law.id && "opacity-100")} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif italic text-xs opacity-50 uppercase tracking-widest mb-4">Resources</h2>
          <div className="space-y-4">
            <a href="https://open.law.go.kr" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#141414] hover:underline decoration-[#141414]">
              <FileText className="w-4 h-4" />
              <span className="font-sans text-xs font-medium">National Law API</span>
            </a>
            <div className="bg-yellow-100/50 border border-yellow-200 p-4 rounded-sm flex gap-3">
              <Info className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-800 leading-normal">
                This system uses the Open Law API. Ensure your API Key is configured in the backend for full access.
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">System Ready</span>
        </div>
      </div>
    </div>
  );
}
