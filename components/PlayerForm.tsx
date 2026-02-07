'use client';

import { useState } from 'react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Users, Zap } from 'lucide-react';

export default function PlayerForm({ onGenerate }: { onGenerate: () => void }) {
  const {
    players,
    updatePlayer,
    addPlayers,
    removePlayers,
    useTiers,
    useFixedPairs,
    setUseTiers,
    setUseFixedPairs,
    generateDraw,
  } = useTournamentStore();

  const [loading, setLoading] = useState(false);

  const validPlayers = players.filter(p => p.name.trim() !== '');
  const totalTeams = validPlayers.length / 2;
  const teamsPerGroup = Math.ceil(totalTeams / 2); // Allow odd teams, A gets extra

  const canGenerate =
    validPlayers.length >= 4 &&
    validPlayers.length % 2 === 0; // Only check player count is even

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

                {useFixedPairs && player.name.trim() !== '' && (
                  <div className="pl-11">
                    <select
                      value={player.partnerId || ''}
                      onChange={(e) => {
                        const partnerId = e.target.value;
                        if (partnerId) {
                          // Set this player's partner
                          updatePlayer(player.id, {
                            partnerId,
                            isFixed: true,
                          });
                          // Set reverse relationship
                          updatePlayer(partnerId, {
                            partnerId: player.id,
                            isFixed: true,
                          });
                        } else {
                          // Clear partnership
                          updatePlayer(player.id, {
                            partnerId: undefined,
                            isFixed: false,
                          });
                        }
                      }}
                      className="w-full p-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">-- Chọn đồng đội --</option>
                      {players
                        .filter(
                          (p) =>
                            p.id !== player.id &&
                            p.name.trim() !== '' &&
                            (!p.partnerId || p.partnerId === player.id)
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.partnerId === player.id ? ' ✓' : ''}
                          </option>
                        ))}
                    </select>
                    {player.partnerId && (
                      <div className="text-xs text-primary mt-1 flex items-center gap-1">
                        🔗 Cặp với: {players.find(p => p.id === player.partnerId)?.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

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
