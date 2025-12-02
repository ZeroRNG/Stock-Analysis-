import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { TechnicalIndicators } from "@shared/schema";

interface PdfExportProps {
  ticker: string | null;
  question: string | null;
  aiAnalysis: string | null;
  indicators: TechnicalIndicators | null;
}

export function PdfExport({ ticker, question, aiAnalysis, indicators }: PdfExportProps) {
  const [isReady, setIsReady] = useState(false);

  const pdfMutation = useMutation({
    mutationFn: async () => {
      if (!ticker || !question || !aiAnalysis || !indicators) {
        throw new Error("Missing required data for PDF generation");
      }
      
      const response = await apiRequest("POST", "/api/generate-pdf", {
        ticker,
        question,
        aiAnalysis,
        indicators,
      });
      
      const blob = await response.blob();
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stocksense_${ticker}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });

  const canGenerate = ticker && question && aiAnalysis && indicators;

  return (
    <section className="mb-12" data-testid="pdf-export-section">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Export Analysis as PDF
      </h2>

      <Card className="p-6 text-center">
        {canGenerate ? (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                Generate a comprehensive PDF report for{" "}
                <span className="font-mono font-semibold text-foreground">{ticker}</span>{" "}
                including your AI analysis and technical indicators.
              </p>
            </div>
            <Button
              onClick={() => pdfMutation.mutate()}
              disabled={pdfMutation.isPending}
              size="lg"
              data-testid="download-pdf-btn"
            >
              {pdfMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>
            {pdfMutation.isError && (
              <p className="mt-4 text-sm text-bearish">
                Error generating PDF. Please try again.
              </p>
            )}
          </>
        ) : (
          <div className="py-6">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Ask a question in the chatbot and look up a stock ticker to generate a PDF report.
            </p>
            <ul className="mt-4 text-sm text-muted-foreground space-y-1">
              <li className="flex items-center justify-center gap-2">
                <span className={ticker ? "text-bullish" : ""}>
                  {ticker ? "✓" : "○"}
                </span>
                Stock ticker selected{ticker ? `: ${ticker}` : ""}
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className={question ? "text-bullish" : ""}>
                  {question ? "✓" : "○"}
                </span>
                Asked a question in chatbot
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className={aiAnalysis ? "text-bullish" : ""}>
                  {aiAnalysis ? "✓" : "○"}
                </span>
                Received AI analysis
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className={indicators ? "text-bullish" : ""}>
                  {indicators ? "✓" : "○"}
                </span>
                Technical indicators loaded
              </li>
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}
