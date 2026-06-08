'use client';

import React, { useState } from 'react';
import api from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  formId: string;
}

export const ExportCSVButton: React.FC<ExportButtonProps> = ({ formId }) => {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
    
      const res = await api.get(`/responses/${formId}/export`, {
        responseType: 'blob' as any
      });
      
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
    
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses-${formId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert('Failed to export responses. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={downloading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium text-sm shadow-sm transition-all"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Downloading CSV...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" /> Export CSV
        </>
      )}
    </Button>
  );
};