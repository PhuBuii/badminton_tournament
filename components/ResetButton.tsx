'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function ResetButton() {
  const handleReset = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu và reset giải đấu?')) {
      localStorage.removeItem('ao-lang-tournament');
      window.location.href = '/';
    }
  };

  return (
    <Button
      onClick={handleReset}
      variant="outline"
      size="sm"
      className="touch-target"
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset
    </Button>
  );
}
