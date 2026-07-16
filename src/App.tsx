import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Repositories from './components/Repositories';
import PullRequests from './components/PullRequests';
import ReviewDetails from './components/ReviewDetails';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import WebhookSimulator from './components/WebhookSimulator';
import { Repository, PullRequest, Review } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Fetch initial API databases on startup
  useEffect(() => {
    async function fetchData() {
      try {
        const [reposRes, prsRes, reviewsRes] = await Promise.all([
          fetch('/api/repositories'),
          fetch('/api/pull-requests'),
          fetch('/api/reviews/history')
        ]);

        if (reposRes.ok) setRepositories(await reposRes.json());
        if (prsRes.ok) setPullRequests(await prsRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (err) {
        console.error("Failed to fetch initial application context states", err);
      }
    }
    fetchData();
  }, []);

  const handleAddRepo = async (newRepo: { name: string; fullName: string; branchesWhitelist: string; customReviewInstructions: string }) => {
    try {
      const res = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRepo)
      });
      if (res.ok) {
        const savedRepo = await res.json();
        setRepositories(prev => [...prev, savedRepo]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRepo = async (id: string, updates: Partial<Repository>) => {
    try {
      const res = await fetch(`/api/repositories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedRepo = await res.json();
        setRepositories(prev => prev.map(r => r.id === id ? updatedRepo : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerManualReview = async (prId: string, customDiffText?: string) => {
    try {
      const res = await fetch('/api/review/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pullRequestId: prId, customDiffText })
      });
      if (res.ok) {
        const newReview = await res.json();
        // Insert or replace existing review for this pull request
        setReviews(prev => {
          const filtered = prev.filter(r => r.pullRequestId !== prId);
          return [newReview, ...filtered];
        });
        setSelectedReviewId(newReview.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerWebhook = async (payload: any) => {
    try {
      const res = await fetch('/api/webhook/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Refetch active repositories and pull requests to sync UI states
        const [reposRes, prsRes] = await Promise.all([
          fetch('/api/repositories'),
          fetch('/api/pull-requests')
        ]);
        if (reposRes.ok) setRepositories(await reposRes.json());
        if (prsRes.ok) setPullRequests(await prsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedReview = reviews.find(r => r.id === selectedReviewId) || null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            repositories={repositories}
            pullRequests={pullRequests}
            reviews={reviews}
            setActiveTab={setActiveTab}
            setSelectedReviewId={setSelectedReviewId}
          />
        );
      case 'repositories':
        return (
          <Repositories 
            repositories={repositories}
            onAddRepo={handleAddRepo}
            onUpdateRepo={handleUpdateRepo}
          />
        );
      case 'pull-requests':
        return (
          <PullRequests 
            repositories={repositories}
            pullRequests={pullRequests}
            reviews={reviews}
            onTriggerManualReview={(id) => handleTriggerManualReview(id)}
            setActiveTab={setActiveTab}
            setSelectedReviewId={setSelectedReviewId}
          />
        );
      case 'review-details':
        return (
          <ReviewDetails 
            review={selectedReview}
            repositories={repositories}
            pullRequests={pullRequests}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            reviews={reviews}
          />
        );
      case 'webhook-simulator':
        return (
          <WebhookSimulator 
            repositories={repositories}
            pullRequests={pullRequests}
            onTriggerWebhook={handleTriggerWebhook}
            onTriggerManualReview={handleTriggerManualReview}
            setActiveTab={setActiveTab}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            repositories={repositories}
            pullRequests={pullRequests}
            reviews={reviews}
            setActiveTab={setActiveTab}
            setSelectedReviewId={setSelectedReviewId}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
