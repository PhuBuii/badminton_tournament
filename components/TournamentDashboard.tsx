'use client';

import { useState } from 'react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MatchCard from './MatchCard';
import Leaderboard from './Leaderboard';
import ResetButton from './ResetButton';
import BracketView from './BracketView';
import { Trophy, Calendar, Eye } from 'lucide-react';

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

  const finishedGroupCount = groupMatches.filter(m => m.status === 'finished').length;
  const nextMatchId = matches.find(m => m.status !== 'finished')?.id;

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 relative">
          <TabsList className="grid w-full grid-cols-3 mb-6 sticky top-0 z-20 bg-background/95 backdrop-blur-sm shadow-sm py-1">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Lịch Thi Đấu</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>BXH</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Tabs 
              defaultValue={finalMatch || thirdPlaceMatch || placementMatches.length > 0 ? "final" : semiMatches.length > 0 ? "semi" : "group"} 
              className="w-full"
            >
              <TabsList className="flex w-full justify-start gap-2 bg-transparent p-0 mb-4 overflow-x-auto no-scrollbar">
                <TabsTrigger 
                  value="group" 
                  className="rounded-full border bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 h-8 text-xs sm:text-sm shadow-sm"
                >
                  Vòng bảng
                </TabsTrigger>
                {semiMatches.length > 0 && (
                  <TabsTrigger 
                    value="semi" 
                    className="rounded-full border bg-background data-[state=active]:bg-amber-500 data-[state=active]:text-white px-4 h-8 text-xs sm:text-sm shadow-sm"
                  >
                    Bán kết
                  </TabsTrigger>
                )}
                {(finalMatch || thirdPlaceMatch || placementMatches.length > 0) && (
                  <TabsTrigger 
                    value="final" 
                    className="rounded-full border bg-background data-[state=active]:bg-yellow-500 data-[state=active]:text-white px-4 h-8 text-xs sm:text-sm shadow-sm"
                  >
                    Chung kết
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="group" className="mt-0 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Đã đấu {finishedGroupCount}/{groupMatches.length} trận
                  </span>
                </div>
                {(() => {
                  const hasRounds = groupMatches.some(m => m.round !== undefined);
                  
                  if (hasRounds) {
                    const rounds = groupMatches.reduce((acc, match) => {
                      const r = match.round || 0;
                      if (!acc[r]) acc[r] = [];
                      acc[r].push(match);
                      return acc;
                    }, {} as Record<number, typeof groupMatches>);

                    return Object.entries(rounds)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([round, matches]) => (
                        <div key={round} className="space-y-3">
                          <h3 className="font-medium text-sm text-muted-foreground ml-1">Lượt {round}</h3>
                          <div className="space-y-4">
                            {matches.map(match => {
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
                                  isNext={match.id === nextMatchId}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ));
                  } else {
                    return [...groupMatches].reverse().map(match => {
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
                          isNext={match.id === nextMatchId}
                        />
                      );
                    });
                  }
                })()}

                {groupMatches.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có trận đấu nào
                  </div>
                )}

                {canStartKnockout && (
                  <div className="pt-4 pb-2">
                    <Button
                      onClick={advanceToKnockout}
                      className="w-full touch-target text-lg bg-primary animate-pulse"
                      size="lg"
                    >
                      🏆 Bắt Đầu Vòng Knockout
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="semi" className="mt-0 space-y-4">
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
                      isNext={match.id === nextMatchId}
                    />
                  );
                })}
              </TabsContent>

              <TabsContent value="final" className="mt-0 space-y-6">
                {finalMatch && (() => {
                  const team1 = getTeam(finalMatch.team1Id);
                  const team2 = getTeam(finalMatch.team2Id);
                  if (!team1 || !team2) return null;
                  return (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">Chung Kết</Badge>
                      </div>
                      <MatchCard
                        key={finalMatch.id}
                        match={finalMatch}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                        isNext={finalMatch.id === nextMatchId}
                      />
                    </div>
                  );
                })()}

                {thirdPlaceMatch && (() => {
                  const team1 = getTeam(thirdPlaceMatch.team1Id);
                  const team2 = getTeam(thirdPlaceMatch.team2Id);
                  if (!team1 || !team2) return null;
                  return (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="border-yellow-600 text-yellow-600">Tranh Hạng 3</Badge>
                      </div>
                      <MatchCard
                        key={thirdPlaceMatch.id}
                        match={thirdPlaceMatch}
                        team1={team1}
                        team2={team2}
                        onSave={handleScoreUpdate}
                        isNext={thirdPlaceMatch.id === nextMatchId}
                      />
                    </div>
                  );
                })()}

                {placementMatches.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium text-muted-foreground border-t pt-4">Phân Hạng</h3>
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
                            isNext={match.id === nextMatchId}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard teams={groupATeams} group="A" />
            <Leaderboard teams={groupBTeams} group="B" />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <BracketView teams={teams} matches={matches} getRankedTeams={getRankedTeams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
