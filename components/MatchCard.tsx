'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Match, Team } from '@/lib/types';
import { Save, Check } from 'lucide-react';
import { validateMatchScore } from '@/lib/utils/validateMatchScore';

interface MatchCardProps {
  match: Match;
  team1: Team;
  team2: Team;
  onSave: (matchId: string, score1: number, score2: number) => void;
  isNext?: boolean;
}

export default function MatchCard({ match, team1, team2, onSave, isNext = false }: MatchCardProps) {
  const [score1, setScore1] = useState(match.score1?.toString() || '');
  const [score2, setScore2] = useState(match.score2?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  // Reset state when match prop changes
  useEffect(() => {
    setScore1(match.score1?.toString() || '');
    setScore2(match.score2?.toString() || '');
    setIsEditing(false);
  }, [match.id, match.score1, match.score2]);

  const handleSave = () => {
    const result = validateMatchScore(score1, score2);

    if (!result.valid) {
      alert(result.error);
      return;
    }

    onSave(match.id, result.s1, result.s2);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setScore1(match.score1?.toString() || '');
    setScore2(match.score2?.toString() || '');
    setIsEditing(false);
  };

  const isFinished = match.status === 'finished' && !isEditing;
  const winner = isFinished && match.score1 !== undefined && match.score2 !== undefined
    ? match.score1 > match.score2 ? 'team1' : 'team2'
    : null;

  return (
    <Card className={`p-4 ${
      isFinished
        ? 'bg-muted/40 opacity-75 shadow-none border-transparent'
        : isNext
          ? 'court-card animate-border-pulse ring-offset-2 ring-offset-background'
          : 'court-card'
    }`}>
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {match.stage === 'Group' && (
            <Badge variant="outline" className="text-xs">
              {match.round ? `Lượt ${match.round}` : 'Vòng bảng'}
              {match.court ? ` • Sân ${match.court}` : ''}
            </Badge>
          )}
          {match.stage === 'Semi' && (
            <Badge className="text-xs bg-amber-500">Bán Kết</Badge>
          )}
          {match.stage === 'Final' && (
            <Badge className="text-xs bg-yellow-500">Chung Kết</Badge>
          )}
          {match.stage === 'ThirdPlace' && (
            <Badge variant="secondary" className="text-xs">Hạng 3</Badge>
          )}
          {match.stage === 'Placement' && match.round && (
            <Badge variant="outline" className="text-xs">
              Tranh Hạng {(match.round - 1) * 2 + 1}-{(match.round - 1) * 2 + 2}
            </Badge>
          )}
          {isNext && !isFinished && (
            <Badge className="bg-accent text-accent-foreground animate-pulse ml-1">
              Đang thi đấu
            </Badge>
          )}
        </div>
        {match.status === 'finished' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            Hoàn thành
          </Badge>
        )}
      </div>

      {/* Teams & Scores */}
      <div className="space-y-3 mb-4">
        {/* Team 1 */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          winner === 'team1' ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary/30'
        }`}>
          <div className="flex-1">
            <div className="font-semibold">
              {team1.players[0].name} & {team1.players[1].name}
            </div>
            <div className="text-xs text-muted-foreground">
              {team1.group === 'A' ? 'Bảng A' : 'Bảng B'}
            </div>
            {team1.isDisqualified && <Badge variant="destructive" className="mt-1 text-[10px]">Đã bỏ cuộc</Badge>}
          </div>
          {isFinished ? (
            <div className="text-2xl font-bold w-12 text-center">
              {match.score1}
            </div>
          ) : (
            <Input
              type="number"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-16 h-12 text-center text-lg font-bold"
              placeholder="0"
              min="0"
              max="30"
            />
          )}
        </div>

        {/* VS */}
        <div className="text-center text-sm font-bold text-muted-foreground">
          VS
        </div>

        {/* Team 2 */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          winner === 'team2' ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary/30'
        }`}>
          <div className="flex-1">
            <div className="font-semibold">
              {team2.players[0].name} & {team2.players[1].name}
            </div>
            <div className="text-xs text-muted-foreground">
              {team2.group === 'A' ? 'Bảng A' : 'Bảng B'}
            </div>
            {team2.isDisqualified && <Badge variant="destructive" className="mt-1 text-[10px]">Đã bỏ cuộc</Badge>}
          </div>
          {isFinished ? (
            <div className="text-2xl font-bold w-12 text-center">
              {match.score2}
            </div>
          ) : (
            <Input
              type="number"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-16 h-12 text-center text-lg font-bold"
              placeholder="0"
              min="0"
              max="30"
            />
          )}
        </div>
      </div>

      {/* Score Hint */}
      {!isFinished && (
        <div className="text-xs text-muted-foreground text-center mb-3">
          💡 Luật 21 điểm: Thắng tối thiểu 21, cách biệt 2 điểm (VD: 21-19, 22-20, 30-29)
        </div>
      )}

      {/* Action Buttons */}
      {!isFinished ? (
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 touch-target"
            variant="default"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu Điểm
          </Button>
          {isEditing && (
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="touch-target"
            >
              Hủy
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={() => {
            if (confirm('Sửa điểm sẽ ảnh hưởng đến bảng xếp hạng. Bạn có chắc chắn muốn sửa?')) {
              setIsEditing(true);
            }
          }}
          className="w-full touch-target"
          variant="outline"
        >
          📝 Sửa Điểm
        </Button>
      )}
    </Card>
  );
}
