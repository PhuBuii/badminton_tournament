'use client';

import { Team, Match, Player } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface BracketViewProps {
  teams: Team[];
  matches: Match[];
  getRankedTeams: (group: 'A' | 'B') => Team[];
}

export default function BracketView({ teams, matches, getRankedTeams }: BracketViewProps) {
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

  const renderMatchNode = (
    title: string, 
    match: Match | undefined, 
    placeholder1: string, 
    placeholder2: string,
    variant: 'default' | 'final' | 'third' = 'default'
  ) => {
    const info1 = getTeamInfo(match?.team1Id, placeholder1);
    const info2 = getTeamInfo(match?.team2Id, placeholder2);
    const scores = getScoreDisplay(match);
    
    // Logic for semi-finals specifically to ensure correct placeholders if match exists but not played? 
    // Actually if match exists, teamIds are set.

    return (
      <Card className={cn(
        "relative p-3 border-2 overflow-hidden min-w-[280px]",
        variant === 'final' ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10" :
        variant === 'third' ? "border-orange-200 bg-orange-50/50 dark:bg-orange-900/10" :
        "border-emerald-100"
      )}>
        <div className="flex justify-between items-center mb-2">
          <Badge 
            variant={variant === 'default' ? "secondary" : "default"}
            className={cn(
              "text-xs font-normal",
              variant === 'final' ? "bg-yellow-500 hover:bg-yellow-600" :
              variant === 'third' ? "bg-orange-400 hover:bg-orange-500" : 
              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
            )}
          >
            {title}
          </Badge>
          {match?.status === 'finished' && (
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Kết thúc</span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {/* Team 1 */}
          <div className={cn(
            "flex justify-between items-center p-2 rounded",
            isWinner(match, info1.id) ? "bg-emerald-100/80 dark:bg-emerald-900/40 font-semibold" : "bg-muted/30",
            info1.isPlaceholder && "italic text-muted-foreground"
          )}>
            <div className="flex flex-col">
              <span className="truncate max-w-[180px]">{info1.name}</span>
            </div>
            {scores && <span className="font-mono font-bold text-lg">{scores.score1}</span>}
          </div>

          {/* Team 2 */}
          <div className={cn(
            "flex justify-between items-center p-2 rounded",
            isWinner(match, info2.id) ? "bg-emerald-100/80 dark:bg-emerald-900/40 font-semibold" : "bg-muted/30",
            info2.isPlaceholder && "italic text-muted-foreground"
          )}>
            <div className="flex flex-col">
              <span className="truncate max-w-[180px]">{info2.name}</span>
            </div>
            {scores && <span className="font-mono font-bold text-lg">{scores.score2}</span>}
          </div>
        </div>
      </Card>
    );
  };

  // Find matches safely
  // Semi matches might not be in order in the array, but usually they are generated 1 then 2.
  // However, relying on index is risky if array is shuffled. 
  // But generateKnockoutMatches usually pushes them in order.
  // Let's try to identify by checking if one team is from A and one from B?
  // Actually, standard is Semi 1: 1A vs 2B, Semi 2: 1B vs 2A.
  
  // If semi matches exist, we can try to identify them.
  // Or just display them in order if they exist.
  // If not exist, we just render placeholders.
  
  let semi1Match = semiMatches[0];
  let semi2Match = semiMatches[1];

  // Try to sort semis to be consistent: Semi 1 (1A vs 2B) usually first
  if (semiMatches.length === 2) {
    // We can't easily check "1A" vs "2B" without logic, but usually array order is stable from generation
    // Let's just trust the order for now or use the fact that they are distinct
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-4 animate-in fade-in duration-500">
      
      {/* Semi Finals Section */}
      <div className="w-full max-w-md space-y-8 relative">
        
        {/* Semi 1 */}
        <div className="relative z-10">
          {renderMatchNode(
            "BÁN KẾT 1", 
            semi1Match, 
            "Nhất Bảng A", 
            "Nhì Bảng B"
          )}
          {/* Connector Down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-0.5 bg-border -z-10" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-8 text-[10px] text-muted-foreground bg-background px-1 z-20">
            vs
          </div>
        </div>

        {/* Semi 2 */}
        <div className="relative z-10">
          {renderMatchNode(
            "BÁN KẾT 2", 
            semi2Match, 
            "Nhất Bảng B", 
            "Nhì Bảng A"
          )}
          {/* Connector Down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-0.5 bg-border -z-10" />
        </div>
      </div>

      {/* Branching to Final/Third */}
      <div className="w-full max-w-lg relative pt-4">
        {/* Horizontal Connector */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 border-t-2 border-x-2 border-border rounded-t-xl -mt-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Final */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-yellow-600 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Vô Địch</span>
            </div>
            {renderMatchNode(
              "CHUNG KẾT", 
              finalMatch, 
              "Thắng BK 1", 
              "Thắng BK 2",
              "final"
            )}
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center mt-8 md:mt-0">
            <div className="mb-2 text-orange-600 flex items-center gap-1">
              <Medal className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tranh Hạng 3</span>
            </div>
            {renderMatchNode(
              "TRANH HẠNG 3", 
              thirdPlaceMatch, 
              "Thua BK 1", 
              "Thua BK 2",
              "third"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
