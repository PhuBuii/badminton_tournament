'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Team } from '@/lib/types';
import { Trophy, Medal, UserX } from 'lucide-react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { areGroupMatchesComplete } from '@/lib/utils/groupCompletion';

interface LeaderboardProps {
  teams: Team[];
  group: 'A' | 'B';
}

export default function Leaderboard({ teams, group }: LeaderboardProps) {
  const { disqualifyTeam, matches: allMatches, teams: allTeams } = useTournamentStore();

  if (teams.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Chưa có dữ liệu
      </div>
    );
  }

  const handleDisqualify = (teamId: string, teamName: string) => {
    if (confirm(`Bạn có chắc chắn muốn loại đội "${teamName}"?\n\nTất cả trận đấu của họ sẽ bị xử thua 0-21.`)) {
      disqualifyTeam(teamId);
    }
  };

  // Check if all group matches are complete for this group
  const allGroupFinished = areGroupMatchesComplete(allMatches, group, allTeams);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Badge className="text-base px-3 py-1 bg-primary">
          Bảng {group}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {teams.length} đội
        </span>
      </div>

      {/* Mobile-optimized table */}
      <div className="overflow-x-auto -mx-4 px-4">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Đội</TableHead>
              <TableHead className="text-center w-16">Trận</TableHead>
              <TableHead className="text-center w-16">Thắng</TableHead>
              <TableHead className="text-center w-16 hidden sm:table-cell">Thua</TableHead>
              <TableHead className="text-center w-16">Hiệu</TableHead>
              <TableHead className="text-center w-16 font-bold">Điểm</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team, index) => {
              // Calculate wins and losses from new scoring system
              // Each win = +3, each loss = -3
              // Total points can be: wins*3 - losses*3
              const totalMatches = Math.ceil((team.scored + team.conceded) / 21) || 0;
              // Simple calculation: if points >= 0, wins = points/3, else wins = 0
              const wins = team.points >= 0 ? Math.round(team.points / 3) : 0;
              const losses = totalMatches - wins;
              const qualified = index < 2 && allGroupFinished;
              const teamName = `${team.players[0].name} & ${team.players[1].name}`;

              return (
                <TableRow
                  key={team.id}
                  className={qualified ? 'bg-emerald-50 border-l-4 border-emerald-500 font-medium' : ''}
                >
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-1">
                      {index + 1}
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm leading-tight">
                      {team.players[0].name}
                    </div>
                    <div className="font-medium text-sm leading-tight">
                      {team.players[1].name}
                    </div>
                    {qualified && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Vào Bán Kết
                      </Badge>
                    )}
                    {team.isDisqualified && (
                      <Badge variant="destructive" className="text-xs mt-1 ml-1">
                        Bỏ cuộc
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{totalMatches}</TableCell>
                  <TableCell className="text-center font-semibold text-green-600">
                    {wins}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground hidden sm:table-cell">
                    {losses}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={team.diff >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {team.diff > 0 ? '+' : ''}{team.diff}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    {team.points}
                  </TableCell>
                  <TableCell>
                    {!team.isDisqualified && (
                      <Button
                        onClick={() => handleDisqualify(team.id, teamName)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Loại đội (Bỏ cuộc)"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
