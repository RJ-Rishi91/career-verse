import React, { useEffect, useState } from 'react';
import { ApiService } from './services/api.js';
import { CallState, CareerState, ScorecardResult } from './types/index.js';
import { TopBar } from './components/TopBar.js';
import { ViewBar } from './components/ViewBar.js';
import { Sidebar } from './components/Sidebar.js';
import { BottomNav } from './components/BottomNav.js';
import { PreviewBar, PreviewMode } from './components/PreviewBar.js';
import { Toast } from './components/Toast.js';

import { DeskView } from './views/DeskView.js';
import { CallView } from './views/CallView.js';
import { ScoreView } from './views/ScoreView.js';
import { RewardsView } from './views/RewardsView.js';
import { ClientsView } from './views/ClientsView.js';

export const App: React.FC = () => {
  const [career, setCareer] = useState<CareerState | null>(null);
  const [callState, setCallState] = useState<CallState | null>(null);
  const [scorecard, setScorecard] = useState<ScorecardResult | null>(null);

  const [route, setRoute] = useState<string>('desk');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);

  const [saveState, setSaveState] = useState<'saved' | 'saving' | null>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('auto');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Parse current hash route
  const parseHash = () => {
    const raw = (window.location.hash || '#/desk').replace(/^#\/?/, '');
    const [name, param] = raw.split('/');
    return { name: name || 'desk', param };
  };

  const navigateTo = (newRoute: string) => {
    window.location.hash = `#/${newRoute}`;
  };

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 2000);
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const connected = await ApiService.checkBackend();
      setIsBackendConnected(connected);

      const careerData = await ApiService.getCareer();
      setCareer(careerData);

      const parsed = parseHash();
      setRoute(parsed.name);
      setRouteParam(parsed.param);

      if (parsed.name === 'call') {
        const cState = await ApiService.getActiveCall();
        setCallState(cState);
      } else if (parsed.name === 'score' || parsed.name === 'rewards') {
        try {
          const sc = await ApiService.getScorecard();
          setScorecard(sc);
        } catch {
          navigateTo('desk');
        }
      }
    };

    init();

    const handleHashChange = async () => {
      const parsed = parseHash();
      setRoute(parsed.name);
      setRouteParam(parsed.param);

      if (parsed.name === 'call') {
        const cState = await ApiService.getActiveCall();
        setCallState(cState);
      } else if (parsed.name === 'score' || parsed.name === 'rewards') {
        try {
          const sc = await ApiService.getScorecard();
          setScorecard(sc);
        } catch {
          navigateTo('desk');
        }
      } else if (parsed.name === 'desk') {
        const careerData = await ApiService.getCareer();
        setCareer(careerData);
      }

      window.scrollTo(0, 0);
      const frameEl = document.getElementById('frame');
      if (frameEl) frameEl.scrollTop = 0;
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update preview mode class on body
  useEffect(() => {
    document.body.classList.remove('preview-phone', 'preview-desktop');
    if (previewMode === 'phone') {
      document.body.classList.add('preview-phone');
    } else if (previewMode === 'desktop') {
      document.body.classList.add('preview-desktop');
    }
  }, [previewMode]);

  if (!career) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--chrome)' }}>
        <p className="muted">Loading CareerVerse…</p>
      </div>
    );
  }

  const marcus = career.clients.find(c => c.id === 'marcus')!;
  const dana = career.clients.find(c => c.id === 'dana')!;

  // Actions
  const handleStartCall = async () => {
    const cState = await ApiService.getActiveCall();
    setCallState(cState);
    navigateTo('call');
  };

  const handleNextOption = async () => {
    if (!callState) return;
    const updated = await ApiService.revealNextOption(
      callState.scenarioId,
      callState.nodeId,
      callState.optionIndex
    );
    setCallState(updated);
  };

  const handleCommitOption = async (optionId: string, optionIndex: number) => {
    if (!callState) return;
    setIsSaving(true);
    setSaveState('saving');

    try {
      const result = await ApiService.commitDecision(
        callState.scenarioId,
        callState.nodeId,
        optionId,
        optionIndex
      );

      setCallState(result.callState);
      setSaveState('saved');
      showToast('Said, and saved to your career');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueCall = async () => {
    if (!callState) return;
    const result = await ApiService.continueCall(callState.scenarioId);

    if (result.finished) {
      const sc = await ApiService.getScorecard(callState.scenarioId);
      setScorecard(sc);
      navigateTo('score');
    } else {
      setCallState(result.callState);
    }
  };

  const handleCollectRewards = async () => {
    const sc = scorecard || (await ApiService.getScorecard());
    setScorecard(sc);
    const updated = await ApiService.collectRewards();
    setCareer(updated.career);
    navigateTo('rewards');
  };

  const handleResetDemo = async () => {
    const fresh = await ApiService.resetCareer();
    setCareer(fresh);
    setCallState(null);
    setScorecard(null);
    navigateTo('desk');
    showToast('Demo reset to initial state');
  };

  // Determine layout shell
  const hasSidebar = route === 'desk' || route === 'clients' || route === 'client';
  const showBottomNav = route === 'desk' || route === 'clients';

  return (
    <>
      <div className="frame" id="frame">
        <div
          className={`app ${hasSidebar ? 'has-sidebar' : ''}`}
          data-route={route}
        >
          {/* Desktop Sidebar (Desk & Clients only) */}
          {hasSidebar && (
            <Sidebar
              activeRoute={route}
              inboxCount={career.inbox.length}
              player={career.player}
              onNavigate={navigateTo}
            />
          )}

          {/* Top Bars */}
          {route === 'desk' && (
            <TopBar
              player={career.player}
              isBackendConnected={isBackendConnected}
            />
          )}

          {route === 'clients' && (
            <TopBar
              player={career.player}
              isBackendConnected={isBackendConnected}
            />
          )}

          {route === 'client' && (
            <ViewBar
              backHref="#/clients"
              backLabel="Back to clients"
              title={career.clients.find(c => c.id === routeParam)?.name || 'Client'}
              sub={career.clients.find(c => c.id === routeParam)?.company}
              onBackClick={(e) => {
                e.preventDefault();
                navigateTo('clients');
              }}
            />
          )}

          {route === 'call' && (
            <ViewBar
              backHref="#/desk"
              backLabel="Pause and return to desk"
              backIcon="pause"
              title={marcus.name}
              sub={`${career.scenario.type} · ${marcus.company}`}
              saveState={saveState}
              onBackClick={(e) => {
                e.preventDefault();
                navigateTo('desk');
              }}
            />
          )}

          {route === 'score' && (
            <ViewBar
              backHref="#/desk"
              backLabel="Back to desk"
              title="Call scorecard"
              sub={marcus.name}
              onBackClick={(e) => {
                e.preventDefault();
                navigateTo('desk');
              }}
            />
          )}

          {route === 'rewards' && (
            <ViewBar
              backHref="#/desk"
              backLabel="Back to desk"
              title="Rewards"
              onBackClick={(e) => {
                e.preventDefault();
                navigateTo('desk');
              }}
            />
          )}

          {/* Main View Body */}
          <main className="main" id="main">
            {route === 'desk' && (
              <DeskView
                career={career}
                onNavigate={navigateTo}
                onStartCall={handleStartCall}
              />
            )}

            {route === 'call' && callState && (
              <CallView
                callState={callState}
                client={marcus}
                scenario={career.scenario}
                onNextOption={handleNextOption}
                onCommitOption={handleCommitOption}
                onContinue={handleContinueCall}
                isSaving={isSaving}
              />
            )}

            {route === 'score' && scorecard && (
              <ScoreView
                scorecard={scorecard}
                client={marcus}
                scenario={career.scenario}
                onCollect={handleCollectRewards}
              />
            )}

            {route === 'rewards' && scorecard && (
              <RewardsView
                scorecard={scorecard}
                player={career.player}
                dana={dana}
                onBackToDesk={() => navigateTo('desk')}
                onSelectDana={() => navigateTo('client/dana')}
              />
            )}

            {(route === 'clients' || route === 'client') && (
              <ClientsView
                clients={career.clients}
                selectedClientId={routeParam}
                onSelectClient={(id) => navigateTo(`client/${id}`)}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          {showBottomNav && (
            <BottomNav
              activeRoute={route}
              inboxCount={career.inbox.length}
              onNavigate={navigateTo}
            />
          )}

          {/* Toast Notification */}
          <Toast message={toastMessage} />
        </div>
      </div>

      {/* Prototype / Evaluator Preview Bar */}
      <PreviewBar
        currentMode={previewMode}
        onModeChange={setPreviewMode}
        onResetDemo={handleResetDemo}
      />
    </>
  );
};
