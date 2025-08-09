import React from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "myStock", label: "بضاعتي" },
  { id: "shortages", label: "النواقص" },
  { id: "marketCompare", label: "مقارنات السوق" },
  { id: "bestSellers", label: "الأكثر مبيعًا" },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isListening, transcript, isSupported, toggleListening } = useVoiceRecognition();
  const queryClient = useQueryClient();

  const aiMutation = useMutation({
    mutationFn: (prompt: string) => 
      apiRequest("/api/ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    onSuccess: (data) => {
      alert(data.text);
    },
    onError: (error) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const addProductMutation = useMutation({
    mutationFn: (product: any) =>
      apiRequest("/api/items", {
        method: "POST",
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
  });

  // Handle voice command processing
  const handleVoiceCommand = (text: string) => {
    if (/اضف|أضف/i.test(text)) {
      // Simple voice-to-product creation
      const name = text.replace(/اضف|أضف|سعر|شراء|بيع|كمية|كميه/ig, '').trim();
      const productName = prompt('اسم الصنف (مستخرج من كلامك):', name || '');
      const purchasePrice = parseFloat(prompt('سعر الشراء؟','0') || '0');
      const sellPrice = parseFloat(prompt('سعر البيع؟','0') || '0');
      const qty = parseInt(prompt('الكمية؟','0') || '0');
      
      if (productName) {
        addProductMutation.mutate({
          name: productName,
          purchasePrice,
          sellPrice,
          qty,
          img: ''
        });
      }
    } else {
      // Send to AI for answer
      aiMutation.mutate(text);
    }
  };

  // Process transcript when it changes
  React.useEffect(() => {
    if (transcript && !isListening) {
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  return (
    <aside className="w-56 card flex flex-col items-center">
      {/* Navigation Tabs */}
      <div className="w-full space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`w-full p-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gold text-black"
                : "bg-transparent border border-border-secondary text-gold hover:bg-gold hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voice Recognition */}
      <div className="mt-auto text-center w-full">
        <button
          data-testid="button-microphone"
          onClick={toggleListening}
          disabled={!isSupported}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isListening
              ? "bg-red-600 border-red-600 text-white animate-pulse"
              : "bg-gold border-gold text-black hover:bg-opacity-90"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <div className="mt-2 text-sm text-text-muted">
          {!isSupported
            ? "المايك غير مدعوم"
            : isListening
            ? "اسمعك..."
            : transcript || "اضغط للتكلم"}
        </div>
      </div>
    </aside>
  );
}