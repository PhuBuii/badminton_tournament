'use client';

import { useState } from 'react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MatchCard from './MatchCard';
import Leaderboard from './Leaderboard';
import ResetButton from './ResetButton';
import { Trophy, Calendar } from 'lucide-react';

export default function TournamentDashboard() {
  const {
    teams,
    matches,
    currentStage,
    updateMatchScore,
    advanceToKnockout,
    completeKnockout,
    getRankedTeams,
    getMatchesByStage,
  } = useTournamentStore();

  const [activeTab, setActiveTab] = useState('schedule');

  const groupMatches = getMatchesByStage('Group');
  const semiMatches = getMatchesByStage('Semi');
  const placementMatches = getMatchesByStage('Placement');
  const thirdPlaceMatch = matches.find(m => m.stage === 'ThirdPlace');
  const finalMatch = matches.find(m => m.stage === 'Final');

  const groupATeams = getRankedTeams('A');
  const groupBTeams = getRankedTeams('B');

  const allGroupFinished = groupMatches.every(m => m.status === 'finished');
  const canStartKnockout = allGroupFinished && semiMatches.length === 0;
  const allSemiFinished = semiMatches.every(m => m.status === 'finished');
  const canStartFinals = allSemiFinished && !finalMatch;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const handleScoreUpdate = (matchId: string, score1: number, score2: number) => {
    updateMatchScore(matchId, score1, score2);

    // Auto-advance logic
    setTimeout(() => {
      const { matches, currentStage } = useTournamentStore.getState();
      const groupMatches = matches.filter(m => m.stage === 'Group');
      const semiMatches = matches.filter(m => m.stage === 'Semi');
      
      if (groupMatches.every(m => m.status === 'finished') && semiMatches.length === 0) {
        // Ready for knockout but don't auto-advance
      } else if (semiMatches.length > 0 && semiMatches.every(m => m.status === 'finished')) {
        const finalMatch = matches.find(m => m.stage === 'Final');
        if (!finalMatch) {
          try {
            completeKnockout();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 500);
  };

  return (
    <div className="min-h-screen court-gradient px-4 py-6 pb-safe">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <ResetButton />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              🏸 Giải Đấu Đang Diễn Ra
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-primary">
                {currentStage === 'group_stage' ? 'Vòng Bảng' : 'Vòng Knockout'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {teams.length} đội • {matches.length} trận
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Lịch Thi Đấu</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>BXH</span>
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Finals Section - Shown first as requested */}
            {(thirdPlaceMatch || finalMatch) && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Badge className="bg-yellow-500">Chung Kết & Trao Giải</Badge>
                </h2>
                <div className="space-y-4">
                  {finalMatch && (() => {
                    const team1 = getTeam(finalMatch.team1Id);
                    const team2 = getTeam(finalMatch.team2Id);
                    if (!team1 || !team2) return null;
                    return (
                      <MatchCard
                        key={finalMatch.id}
                        match={finalMatch}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                      />
                    );
                  })()}

                  {thirdPlaceMatch && (() => {
                    const team1 = getTeam(thirdPlaceMatch.team1Id);
                    const team2 = getTeam(thirdPlaceMatch.team2Id);
                    if (!team1 || !team2) return null;
                    return (
                      <MatchCard
                        key={thirdPlaceMatch.id}
                        match={thirdPlaceMatch}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Semi-Finals */}
            {semiMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  <Badge className="bg-amber-500">Bán Kết</Badge>
                </h2>
                <div className="space-y-4">
                  {semiMatches.map(match => {
                    const team1 = getTeam(match.team1Id);
                    const team2 = getTeam(match.team2Id);
                    if (!team1 || !team2) return null;
                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Placement Matches */}
            {placementMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  <Badge variant="outline">Phân Hạng</Badge>
                </h2>
                <div className="space-y-4">
                  {placementMatches.sort((a, b) => (a.round || 0) - (b.round || 0)).map(match => {
                    const team1 = getTeam(match.team1Id);
                    const team2 = getTeam(match.team2Id);
                    if (!team1 || !team2) return null;
                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Group Stage - Shown last or kept separate? User didn't specify group position, but implied "schedule" order. 
               Usually current matches are top. If Final is happening, Group is done.
               So putting Group at bottom is fine if we want "Newest" on top. 
               But user said "sắp xếp lại cho tôi thứ tự các trận [trong lịch thi đấu]".
               I will keep Group matches at the bottom if Knockout started? Or maybe keep them at top if they are active?
               Currently logic:
               - If group active: Group matches shown.
               - If knockout active: Group + Knockout shown.
               
               I'll move Group matches to bottom to keep "Important/Latest" (Finals) at top.
            */}
            
            {groupMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-8 border-t pt-8">
                  <Badge>Vòng Bảng</Badge>
                  <span className="text-sm text-muted-foreground">
                    {groupMatches.filter(m => m.status === 'finished').length}/{groupMatches.length} trận
                  </span>
                </h2>
                <div className="space-y-4">
                  {[...groupMatches].reverse().map(match => {
                    const team1 = getTeam(match.team1Id);
                    const team2 = getTeam(match.team2Id);
                    if (!team1 || !team2) return null;

                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                      />
                    );
                  })}
                </div>

                {canStartKnockout && (
                  <Button
                    onClick={advanceToKnockout}
                    className="w-full mt-6 touch-target text-lg bg-primary"
                    size="lg"
                  >
                    🏆 Bắt Đầu Vòng Knockout
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard teams={groupATeams} group="A" />
            <Leaderboard teams={groupBTeams} group="B" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
