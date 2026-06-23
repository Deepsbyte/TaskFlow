import { useState, useEffect } from 'react';
import api from './api';

export default function useAnalyticsData() {
  const [data, setData] = useState({
    statusSummary: null,
    userProductivity: [],
    projectOverview: [],
    completionTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch all endpoints in parallel using the authenticated axios instance
      const [statusRes, userRes, projectRes, trendRes] = await Promise.all([
        api.get('analytics/task-status-summary/'),
        api.get('analytics/user-productivity/'),
        api.get('analytics/project-overview/'),
        api.get('analytics/completion-trend/')
      ]);

      setData({
        statusSummary: statusRes.data,
        userProductivity: userRes.data,
        projectOverview: projectRes.data,
        completionTrend: trendRes.data
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data. Please check your network connection and permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { data, loading, error, refetch: fetchAnalytics };
}
