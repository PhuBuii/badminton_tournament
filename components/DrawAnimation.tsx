'use client';

import { motion } from 'framer-motion';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import ResetButton from './ResetButton';

export default function DrawAnimation({ onContinue }: { onContinue: () => void }) {
  const { teams } = useTournamentStore();
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // Show continue button after animation completes
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const groupA = teams.filter(t => t.group === 'A');
  const groupB = teams.filter(t => t.group === 'B');

  return (
    <div className="min-h-screen court-gradient px-4 py-6 pb-safe overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <ResetButton />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              🎲 Kết Quả Bốc Thăm
            </h1>
            <p className="text-muted-foreground">Chia bảng hoàn tất!</p>
          </div>
        </motion.div>

        {/* Groups Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Group A */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="mb-4 text-center">
              <Badge className="text-lg px-4 py-2 bg-primary">Bảng A</Badge>
            </div>
            <div className="space-y-3">
              {groupA.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.2,
                    duration: 0.4,
                    type: 'spring',
                  }}
                >
                  <Card className="p-4 court-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        A{index + 1}
                      </div>
                      <div className="font-semibold text-lg">
                        {team.players[0].name} & {team.players[1].name}
                      </div>
                    </div>
                    <div className="flex gap-2 pl-13">
                      {team.players.map((player) => (
                        <Badge
                          key={player.id}
                          variant={
                            player.tier === 'Strong' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {player.tier === 'Strong' ? '💪 Mạnh' : player.tier === 'Weak' ? '🎯 Yếu' : '⚪'}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Group B */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="mb-4 text-center">
              <Badge className="text-lg px-4 py-2 bg-primary">Bảng B</Badge>
            </div>
            <div className="space-y-3">
              {groupB.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.2,
                    duration: 0.4,
                    type: 'spring',
                  }}
                >
                  <Card className="p-4 court-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        B{index + 1}
                      </div>
                      <div className="font-semibold text-lg">
                        {team.players[0].name} & {team.players[1].name}
                      </div>
                    </div>
                    <div className="flex gap-2 pl-13">
                      {team.players.map((player) => (
                        <Badge
                          key={player.id}
                          variant={
                            player.tier === 'Strong' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {player.tier === 'Strong' ? '💪 Mạnh' : player.tier === 'Weak' ? '🎯 Yếu' : '⚪'}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Continue Button */}
        {showContinue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={onContinue}
              className="w-full max-w-md mx-auto block touch-target text-lg font-bold bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Tiếp Tục Thi Đấu
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
