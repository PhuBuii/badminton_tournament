'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { calculateAwards } from '@/lib/utils/rankingCalculator';
import ResetButton from './ResetButton';
import { Trophy, Medal, Gift, Sparkles } from 'lucide-react';

interface AwardsDisplayProps {
  onReset: () => void;
}

export default function AwardsDisplay({ onReset }: AwardsDisplayProps) {
  const { teams, matches } = useTournamentStore();
  const awards = calculateAwards(teams, matches);

  // Group awardsfor display
  const champion = awards.find(a => a.rank === 1);
  const runnerUp = awards.find(a => a.rank === 2);
  const semiFinalists = awards.filter(a => a.rank === 3);
  const groupPrizes = awards.filter(a => a.rank >= 5);

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div className="min-h-screen court-gradient px-4 py-6 pb-safe">
      <div className="max-w-3xl mx-auto">
        {/* Header with confetti */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <ResetButton />
          </div>
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              🎉 Danh Sách Nhận Thưởng
            </h1>
            <p className="text-lg text-muted-foreground">
              Giải Cầu Lông Ao Làng
            </p>
          </motion.div>
        </motion.div>

        <div className="space-y-6 mb-8">
          {/* Champion */}
          {champion && getTeam(champion.teamId) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-4 border-yellow-400">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-900" />
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2 bg-yellow-500">Vô Địch 🏆</Badge>
                    <div className="font-bold text-xl text-yellow-900">
                      {getTeam(champion.teamId)?.players[0].name} &{' '}
                      {getTeam(champion.teamId)?.players[1].name}
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">
                      {champion.prize}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Runner Up */}
          {runnerUp && getTeam(runnerUp.teamId) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 border-4 border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2 bg-gray-400">Á Quân 🥈</Badge>
                    <div className="font-bold text-xl text-gray-900">
                      {getTeam(runnerUp.teamId)?.players[0].name} &{' '}
                      {getTeam(runnerUp.teamId)?.players[1].name}
                    </div>
                    <div className="text-2xl font-bold text-gray-600 mt-1">
                      {runnerUp.prize}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Semi-finalists */}
          {semiFinalists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="mb-3">
                <Badge className="bg-orange-500">Top 4 - Bán Kết 💪</Badge>
              </div>
              <div className="space-y-3">
                {semiFinalists.map((award, index) => {
                  const team = getTeam(award.teamId);
                  if (!team || award.teamId === champion?.teamId || award.teamId === runnerUp?.teamId) return null;
                  
                  return (
                    <Card key={award.teamId} className="p-4 bg-orange-50 border-2 border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {team.players[0].name} & {team.players[1].name}
                          </div>
                          <div className="text-orange-600 font-medium">
                            {award.prize}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Group Stage Prizes */}
          {groupPrizes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="mb-3">
                <Badge variant="secondary">Giải Khuyến Khích 💛</Badge>
              </div>
              <div className="space-y-3">
                {groupPrizes.map((award) => {
                  const team = getTeam(award.teamId);
                  if (!team) return null;
                  
                  return (
                    <Card key={award.teamId} className="p-4 bg-yellow-50/50 border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {team.players[0].name} & {team.players[1].name}
                          </div>
                          <div className="text-sm text-yellow-600">
                            {award.prize}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
