'use client';

import { useState } from 'react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Plus, Minus, Users, Zap, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player } from '@/lib/types';

export default function PlayerForm({ onGenerate }: { onGenerate: () => void }) {
  const {
    players,
    updatePlayer,
    addPlayers,
    removePlayers,
    importPlayers,
    useTiers,
    useFixedPairs,
    setUseTiers,
    setUseFixedPairs,
    generateDraw,
  } = useTournamentStore();

  const [loading, setLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState(
    JSON.stringify(["Thư", "Thuận", "Lộc", "Phú", "Meo", "Kiệt", "Triển", "Nghĩa", "Phát", "Phúc", "Hậu", "Tân", "Ngọc", "Thanh"], null, 2)
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const validPlayers = players.filter(p => p.name.trim() !== '');
  const totalTeams = validPlayers.length / 2;
  const teamsPerGroup = Math.ceil(totalTeams / 2); // Allow odd teams, A gets extra

  // Calculate unpaired and paired players for the 2-column UI
  const unpairedPlayers = validPlayers.filter(p => !p.partnerId);
  
  const pairedGroups: [Player, Player][] = [];
  const processedPairedIds = new Set<string>();
  
  validPlayers.forEach(p => {
    if (p.partnerId && !processedPairedIds.has(p.id)) {
      const partner = validPlayers.find(v => v.id === p.partnerId);
      if (partner) {
        pairedGroups.push([p, partner]);
        processedPairedIds.add(p.id);
        processedPairedIds.add(partner.id);
      }
    }
  });

  const canGenerate =
    validPlayers.length >= 4 &&
    validPlayers.length % 2 === 0; // Only check player count is even

  const handlePlayerTap = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null); // Deselect
      return;
    }

    if (!selectedPlayerId) {
      setSelectedPlayerId(playerId); // Select first
    } else {
      // Pair them
      const p1 = selectedPlayerId;
      const p2 = playerId;
      
      updatePlayer(p1, { partnerId: p2, isFixed: true });
      updatePlayer(p2, { partnerId: p1, isFixed: true });
      setSelectedPlayerId(null);
    }
  };

  const handleUnpair = (p1: Player, p2: Player) => {
    if (confirm(`Hủy ghép cặp ${p1.name} - ${p2.name}?`)) {
      updatePlayer(p1.id, { partnerId: undefined, isFixed: false });
      updatePlayer(p2.id, { partnerId: undefined, isFixed: false });
    }
  };

  const handleImport = () => {
    try {
      const names = JSON.parse(importText);
      
      if (!Array.isArray(names) || names.length === 0 || !names.every(n => typeof n === 'string')) {
        alert('Dữ liệu không hợp lệ. Vui lòng nhập mảng JSON tên VĐV.');
        return;
      }
      
      importPlayers(names);
      setImportOpen(false);
    } catch (error) {
      alert('Dữ liệu không hợp lệ. Vui lòng nhập mảng JSON tên VĐV.');
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    try {
      generateDraw();
      setTimeout(() => {
        setLoading(false);
        onGenerate();
      }, 500);
    } catch (error) {
      alert((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen court-gradient px-4 py-6 pb-safe">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            🏸 Giải Cầu Lông Ao Làng
          </h1>
          <p className="text-muted-foreground">
            Nhập thông tin VĐV để bắt đầu
          </p>
        </div>

        {/* Quick Import Button */}
        <div className="mb-4">
          <Button
            onClick={() => setImportOpen(true)}
            variant="outline"
            className="w-full touch-target"
          >
            <FileText className="w-4 h-4 mr-2" />
            📋 Nhập Nhanh Danh Sách
          </Button>
        </div>

        {/* Quick Import Dialog */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nhập Nhanh Danh Sách VĐV</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-lg border border-input bg-background text-sm font-mono"
                placeholder='["Tên 1", "Tên 2", ...]'
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button onClick={handleImport}>Nhập</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Player Count Info & Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-3 mb-1 text-primary">
              <Users className="w-8 h-8" />
              <span className="text-4xl font-bold tabular-nums tracking-tight">
                {validPlayers.length}
              </span>
              <span className="text-lg font-medium text-muted-foreground self-end mb-1">VĐV</span>
            </div>
            <div className="text-sm font-medium text-muted-foreground bg-primary/5 border border-primary/10 px-4 py-1 rounded-full">
              {totalTeams} đội • {teamsPerGroup} đội/bảng
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => addPlayers(2)}
              variant="outline"
              className="flex-1 touch-target"
              disabled={players.length >= 16}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm 2 người
            </Button>
            <Button
              onClick={() => removePlayers(2)}
              variant="outline"
              className="flex-1 touch-target"
              disabled={players.length <= 4}
            >
              <Minus className="w-4 h-4 mr-2" />
              Bớt 2 người
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-3 mb-6">
          <label className="flex items-center gap-3 p-4 court-card cursor-pointer">
            <input
              type="checkbox"
              checked={useTiers}
              onChange={(e) => setUseTiers(e.target.checked)}
              className="w-5 h-5 rounded accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium">Phân loại Mạnh/Yếu</div>
              <div className="text-xs text-muted-foreground">
                Bốc thăm ưu tiên ghép 1 Mạnh + 1 Yếu
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 court-card cursor-pointer">
            <input
              type="checkbox"
              checked={useFixedPairs}
              onChange={(e) => setUseFixedPairs(e.target.checked)}
              className="w-5 h-5 rounded accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium">Chỉ định cặp cố định</div>
              <div className="text-xs text-muted-foreground">
                Ghép sẵn một số cặp VĐV
              </div>
            </div>
          </label>
        </div>

        {/* Player Inputs */}
        <div className="space-y-3 mb-6">
          {players.map((player, index) => (
            <Card key={player.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center shrink-0">
                    {index + 1}
                  </Badge>
                  <Input
                    placeholder={`Tên VĐV ${index + 1}`}
                    value={player.name}
                    onChange={(e) =>
                      updatePlayer(player.id, { name: e.target.value })
                    }
                    className="flex-1 touch-target"
                  />
                </div>

                {useTiers && (
                  <div className="flex gap-2 pl-11">
                    <Button
                      size="sm"
                      variant={player.tier === 'Strong' ? 'default' : 'outline'}
                      onClick={() =>
                        updatePlayer(player.id, { tier: 'Strong' })
                      }
                      className="flex-1 touch-target"
                    >
                      💪 Mạnh
                    </Button>
                    <Button
                      size="sm"
                      variant={player.tier === 'Weak' ? 'default' : 'outline'}
                      onClick={() =>
                        updatePlayer(player.id, { tier: 'Weak' })
                      }
                      className="flex-1 touch-target"
                    >
                      🎯 Yếu
                    </Button>
                  </div>
                )}

              </div>
            </Card>
          ))}
        </div>

        {/* Fixed Pairs Selection UI - Two Column Layout */}
        {useFixedPairs && validPlayers.length > 0 && (
          <div className="court-card p-4 mb-6">
            <h3 className="text-lg font-bold text-primary mb-4">Ghép cặp cố định</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column: Unpaired */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Chưa ghép ({unpairedPlayers.length})
                </div>
                <div className="space-y-2">
                  {unpairedPlayers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handlePlayerTap(p.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer touch-target transition-all",
                        selectedPlayerId === p.id 
                          ? "ring-2 ring-primary bg-primary/10 border-primary"
                          : "bg-secondary/50 border-transparent hover:bg-secondary"
                      )}
                    >
                      {p.name}
                    </div>
                  ))}
                  {unpairedPlayers.length === 0 && (
                    <div className="text-xs text-muted-foreground italic py-2">
                      Đã ghép hết
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Paired */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Đã ghép ({pairedGroups.length})
                </div>
                <div className="space-y-2">
                  {pairedGroups.map(([p1, p2]) => (
                    <div
                      key={p1.id}
                      onClick={() => handleUnpair(p1, p2)}
                      className="flex flex-col gap-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer touch-target hover:bg-emerald-100 transition-colors"
                    >
                      <div className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                        <span className="truncate max-w-[45%]">{p1.name}</span>
                        <span className="text-emerald-500 shrink-0">🔗</span>
                        <span className="truncate max-w-[45%]">{p2.name}</span>
                      </div>
                    </div>
                  ))}
                  {pairedGroups.length === 0 && (
                    <div className="text-xs text-muted-foreground italic py-2">
                      Chưa có cặp nào
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground bg-primary/5 p-2 rounded border border-primary/10">
              💡 Chạm vào tên để chọn/ghép cặp. Chạm vào cặp đã ghép để hủy.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full touch-target text-lg font-bold bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? (
              <>
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Đang bốc thăm...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Bốc Thăm Giải Đấu
              </>
            )}
          </Button>

          {/* Clear Data Button */}
          <Button
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu đã lưu?')) {
                localStorage.removeItem('ao-lang-tournament');
                window.location.reload();
              }
            }}
            variant="outline"
            className="w-full touch-target text-sm"
            size="lg"
          >
            🗑️ Xóa Dữ Liệu & Reset
          </Button>
        </div>

        {!canGenerate && validPlayers.length > 0 && (
          <p className="text-sm text-destructive text-center mt-3">
            {validPlayers.length % 2 !== 0
              ? '⚠️ Số người chơi phải là số chẵn (2, 4, 6, 8...)'
              : '⚠️ Cần ít nhất 4 người chơi'}
          </p>
        )}
      </div>
    </div>
  );
}
