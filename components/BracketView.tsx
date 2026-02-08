'use client';

import { Team, Match } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Flag, Star } from 'lucide-react';

interface BracketViewProps {
  teams: Team[];
  matches: Match[];
  groupATeams: Team[];
  groupBTeams: Team[];
}

export default function BracketView({ teams, matches, groupATeams, groupBTeams }: BracketViewProps) {
  const groupMatches = matches.filter(m => m.stage === 'Group');
  const semiMatches = matches.filter(m => m.stage === 'Semi');
  const finalMatch = matches.find(m => m.stage === 'Final');
  const thirdPlaceMatch = matches.find(m => m.stage === 'ThirdPlace');

  // Helper to get team display info
  const getTeamInfo = (teamId: string | undefined, placeholder: string) => {
    if (!teamId) return { name: placeholder, isPlaceholder: true };
    const team = teams.find(t => t.id === teamId);
    if (!team) return { name: placeholder, isPlaceholder: true };
    return {
      name: `${team.players[0].name} & ${team.players[1].name}`,
      group: team.group,
      isPlaceholder: false,
      id: team.id
    };
  };

  // Helper to get match score display
  const getScoreDisplay = (match: Match | undefined) => {
    if (!match || match.status !== 'finished') return null;
    return { score1: match.score1, score2: match.score2 };
  };

  // Helper to check winner
  const isWinner = (match: Match | undefined, teamId: string | undefined) => {
    if (!match || match.status !== 'finished' || !teamId) return false;
    const s1 = match.score1 || 0;
    const s2 = match.score2 || 0;
    if (match.team1Id === teamId && s1 > s2) return true;
    if (match.team2Id === teamId && s2 > s1) return true;
    return false;
  };

  const GroupDetailCard = ({ group, title, teams }: { group: 'A' | 'B', title: string, teams: Team[] }) => {
    // Get matches for this group
    const groupMatchesForGroup = groupMatches.filter(m => {
      const t1 = teams.find(t => t.id === m.team1Id);
      return t1 !== undefined; // If team1 is in this group, the match is in this group
    });

    // Group by Round
    const rounds: Record<number, Match[]> = {};
    groupMatchesForGroup.forEach(m => {
      const r = m.round || 0;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(m);
    });

    return (
      <Card className="w-full h-full border-2 border-primary/20 bg-background/50 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-primary/10 p-3 border-b border-primary/10 flex justify-between items-center">
          <span className="font-bold text-primary">{title}</span>
          <Badge variant="outline" className="bg-background">{groupMatchesForGroup.length} trận</Badge>
        </div>

        <div className="p-0 overflow-y-auto max-h-[300px] scrollbar-thin">
          {Object.keys(rounds).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground italic">Chưa có lịch thi đấu</div>
          ) : (
            <div className="flex flex-col">
              {Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b)).map(([round, matches]) => (
                <div key={round} className="border-b last:border-0 pb-1">
                  <div className="px-3 py-1 bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground mb-1">Lượt {round}</div>
                  {matches.map(m => {
                    const t1 = teams.find(t => t.id === m.team1Id);
                    const t2 = teams.find(t => t.id === m.team2Id);
                    if (!t1 || !t2) return null;
                    return (
                      <div key={m.id} className="px-3 py-2 grid grid-cols-[1fr_auto_1fr] gap-3 items-center text-xs border-b last:border-0 border-border/50 hover:bg-muted/20 transition-colors">
                        <div className={cn("text-right truncate font-medium", m.status === 'finished' && m.score1! > m.score2! && "text-emerald-600 font-bold")}>
                          {t1.players[0].name} & {t1.players[1].name}
                        </div>
                        <div className="px-2 py-0.5 font-mono font-bold whitespace-nowrap bg-muted/50 rounded min-w-[40px] text-center">
                          {m.status === 'finished' ? `${m.score1}-${m.score2}` : 'vs'}
                        </div>
                        <div className={cn("text-left truncate font-medium", m.status === 'finished' && m.score2! > m.score1! && "text-emerald-600 font-bold")}>
                          {t2.players[0].name} & {t2.players[1].name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const RankedTeamCard = ({ team, rank, label }: { team: Team | undefined, rank: number, label: string }) => {
    return (
      <div className="flex flex-col items-center">
        {/* Connector Line */}
        <div className="h-6 w-0.5 bg-primary/30 mb-[-2px] relative z-0"></div>

        <div className="relative z-10">
          <Badge
            variant="outline"
            className={cn(
              "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] h-5 px-2 z-20 whitespace-nowrap bg-background",
              rank === 1 ? "border-yellow-500 text-yellow-600" : "border-slate-400 text-slate-600"
            )}
          >
            {label}
          </Badge>
          <Card className={cn(
            "p-2 w-32 flex flex-col items-center gap-1 shadow-sm border text-center pt-3",
            rank === 1 ? "bg-yellow-50 border-yellow-200" : "bg-slate-50 border-slate-200"
          )}>
            {team ? (
              <>
                <div className="font-bold text-xs truncate w-full" title={`${team.players[0].name} & ${team.players[1].name}`}>
                  {team.players[0].name} & {team.players[1].name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <span className="flex items-center"><Star className="w-3 h-3 mr-0.5 text-primary/50" />{team.points}đ</span>
                  <span>HS:{team.diff > 0 ? '+' : ''}{team.diff}</span>
                </div>
              </>
            ) : (
              <span className="text-[10px] italic text-muted-foreground py-1">Chưa xác định</span>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const MatchNode = ({
    title,
    match,
    placeholder1,
    placeholder2,
    variant = 'default'
  }: {
    title: string,
    match: Match | undefined,
    placeholder1: string,
    placeholder2: string,
    variant?: 'default' | 'final' | 'third'
  }) => {
    const info1 = getTeamInfo(match?.team1Id, placeholder1);
    const info2 = getTeamInfo(match?.team2Id, placeholder2);
    const scores = getScoreDisplay(match);

    return (
      <Card className={cn(
        "relative p-3 border-2 overflow-hidden w-full max-w-[320px] shadow-md transition-all hover:shadow-lg z-10",
        variant === 'final' ? "border-yellow-400 bg-yellow-50/80" :
          variant === 'third' ? "border-orange-200 bg-orange-50/80" :
            "border-emerald-100 bg-background"
      )}>
        <div className="flex justify-between items-center mb-3">
          <Badge
            variant={variant === 'default' ? "secondary" : "default"}
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              variant === 'final' ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                variant === 'third' ? "bg-orange-400 hover:bg-orange-500 text-white" :
                  "bg-emerald-100 text-emerald-800"
            )}
          >
            {title}
          </Badge>
          {match?.status === 'finished' && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Đã kết thúc" />
          )}
        </div>

        <div className="space-y-2 text-sm">
          {/* Team 1 */}
          <div className={cn(
            "flex justify-between items-center p-2 rounded-md transition-colors",
            isWinner(match, info1.id) ? "bg-emerald-100/60 font-semibold ring-1 ring-emerald-200" : "bg-muted/30",
            info1.isPlaceholder && "italic text-muted-foreground bg-transparent border border-dashed border-muted"
          )}>
            <span className="truncate flex-1 mr-2">{info1.name}</span>
            {scores && <span className="font-mono font-bold text-lg text-primary">{scores.score1}</span>}
          </div>

          {/* Team 2 */}
          <div className={cn(
            "flex justify-between items-center p-2 rounded-md transition-colors",
            isWinner(match, info2.id) ? "bg-emerald-100/60 font-semibold ring-1 ring-emerald-200" : "bg-muted/30",
            info2.isPlaceholder && "italic text-muted-foreground bg-transparent border border-dashed border-muted"
          )}>
            <span className="truncate flex-1 mr-2">{info2.name}</span>
            {scores && <span className="font-mono font-bold text-lg text-primary">{scores.score2}</span>}
          </div>
        </div>

        {/* Connectors Nodes */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-border" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-border" />
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-16 animate-in fade-in duration-500">

      {/* 1. Group Stage Section */}
      <div className="grid md:grid-cols-2 gap-12 relative">
        <div className="relative z-10 flex flex-col items-center">
          <GroupDetailCard group="A" title="Vòng Bảng A" teams={groupATeams} />
          <div className="grid grid-cols-2 gap-8 w-full px-4 transform translate-y-[-10px]">
            <RankedTeamCard team={groupATeams[0]} rank={1} label="Nhất A" />
            <RankedTeamCard team={groupATeams[1]} rank={2} label="Nhì A" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <GroupDetailCard group="B" title="Vòng Bảng B" teams={groupBTeams} />
          <div className="grid grid-cols-2 gap-8 w-full px-4 transform translate-y-[-10px]">
            <RankedTeamCard team={groupBTeams[0]} rank={1} label="Nhất B" />
            <RankedTeamCard team={groupBTeams[1]} rank={2} label="Nhì B" />
          </div>
        </div>
      </div>

      {/* Connector: Group to Semis */}
      <div className="relative h-16 w-full -my-8 pointer-events-none hidden md:block">
        <svg className="absolute inset-0 w-full h-full text-border" style={{ overflow: 'visible' }}>
          {/*
              Points:
              We have two main Group columns.
              Col A (Left): ~25% center. Sub-columns: A1 (Left part of A), A2 (Right part of A).
              Col B (Right): ~75% center. Sub-columns: B1 (Left part of B), B2 (Right part of B).

              Let's refine the coordinates.
              Box A is 0-50%. Center 25%. A1 is roughly 15%, A2 roughly 35%.
              Box B is 50-100%. Center 75%. B1 roughly 65%, B2 roughly 85%.

              Semi 1 (Left) takes A1 + B2.
              Semi 2 (Right) takes B1 + A2.

              Semi 1 center is ~25%.
              Semi 2 center is ~75%.
            */}

          {/* A1 (15%) -> Semi 1 (25%) */}
          <path d="M 15% -10 L 15% 10 L 25% 10 L 25% 40" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* B2 (85%) -> Semi 1 (25%) */}
          <path d="M 85% -10 L 85% 0 L 25% 0 L 25% 40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30 opacity-50" />

          {/* B1 (65%) -> Semi 2 (75%) */}
          <path d="M 65% -10 L 65% 10 L 75% 10 L 75% 40" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* A2 (35%) -> Semi 2 (75%) */}
          <path d="M 35% -10 L 35% 0 L 75% 0 L 75% 40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30 opacity-50" />
        </svg>
      </div>

      {/* 2. Semi Finals Section */}
      <div className="grid md:grid-cols-2 gap-16 relative z-10 pt-4">
        <div className="flex justify-center">
          <MatchNode
            title="BÁN KẾT 1"
            match={semiMatches[0]}
            placeholder1="Nhất Bảng A"
            placeholder2="Nhì Bảng B"
          />
        </div>
        <div className="flex justify-center">
          <MatchNode
            title="BÁN KẾT 2"
            match={semiMatches[1]}
            placeholder1="Nhất Bảng B"
            placeholder2="Nhì Bảng A"
          />
        </div>
      </div>

      {/* Connector: Semis to Finals */}
      <div className="relative h-16 w-full -my-4 pointer-events-none hidden md:block">
        <svg className="absolute inset-0 w-full h-full text-border" style={{ overflow: 'visible' }}>
          {/* Semi 1 (25%) to Final (50%) */}
          <path d="M 25% 0 L 25% 30 L 50% 30 L 50% 60" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Semi 2 (75%) to Final (50%) */}
          <path d="M 75% 0 L 75% 30 L 50% 30 L 50% 60" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* 3. Finals Section */}
      <div className="flex flex-col items-center gap-12 relative z-10">
 {/* Third Place */}
        <div className="flex flex-col items-center w-full max-w-sm scale-90 opacity-90">
          <div className="mb-2 text-orange-600 flex items-center gap-2">
            <Medal className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Tranh Hạng 3</span>
            </div>
          <MatchNode
            title="TRANH HẠNG 3"
            match={thirdPlaceMatch}
            placeholder1="Thua BK 1"
            placeholder2="Thua BK 2"
            variant="third"
          />
        </div>
        {/* Final */}
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Connector dotted up */}
          <div className="absolute -top-12 left-1/2 w-0.5 h-12 border-l-2 border-dashed border-border -z-10" />
          <div className="mb-2 text-yellow-600 flex items-center gap-2 animate-bounce">
            <Trophy className="w-6 h-6" />
            <span className="text-base font-bold uppercase tracking-wider">Chung Kết</span>
            <Trophy className="w-6 h-6" />
            </div>
          <MatchNode
            title="TRANH CHỨC VÔ ĐỊCH"
            match={finalMatch}
            placeholder1="Thắng BK 1"
            placeholder2="Thắng BK 2"
            variant="final"
          />
        </div>



      </div>

    </div>
  );
}
