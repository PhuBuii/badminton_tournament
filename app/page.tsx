'use client';

import { useState, useEffect } from 'react';
import { useTournamentStore } from '@/lib/store/useTournamentStore';
import PlayerForm from '@/components/PlayerForm';
import DrawAnimation from '@/components/DrawAnimation';
import TournamentDashboard from '@/components/TournamentDashboard';
import AwardsDisplay from '@/components/AwardsDisplay';

export default function Home() {
  const { currentStage, matches, resetTournament } = useTournamentStore();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if tournament is completed
  const finalMatch = matches.find(m => m.stage === 'Final');
  const isCompleted = finalMatch?.status === 'finished';

  useEffect(() => {
    if (isCompleted) {
      useTournamentStore.setState({ currentStage: 'completed' });
    }
  }, [isCompleted]);

  if (!mounted) {
    return (
      <div className="min-h-screen court-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏸</div>
          <div className="text-lg text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Setup screen
  if (currentStage === 'setup') {
    return (
      <PlayerForm
        onGenerate={() => {
          useTournamentStore.setState({ currentStage: 'drawn' });
        }}
      />
    );
  }

  // Draw animation screen
  if (currentStage === 'drawn') {
    return (
      <DrawAnimation
        onContinue={() => {
          useTournamentStore.setState({ currentStage: 'group_stage' });
        }}
      />
    );
  }

  // Tournament in progress (group_stage or knockout)
  if (currentStage === 'group_stage' || currentStage === 'knockout') {
    return <TournamentDashboard />;
  }

  // Completed - Awards
  if (currentStage === 'completed') {
    return (
      <AwardsDisplay
        onReset={() => {
          resetTournament();
        }}
      />
    );
  }

  return null;
}
