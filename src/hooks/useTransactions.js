import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';

export const useTransactions = (month = null, year = null) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    incomeTargetReached: 0,
    expenseBudgetStatus: 0
  });
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      let queryParams = '';
      if (month !== null && year !== null) {
        queryParams = `?month=${month}&year=${year}`;
      }

      const [transactionsRes, statsRes, forecastRes] = await Promise.all([
        fetchWithAuth(`http://34.58.58.40/api/transactions${queryParams}`),
        fetchWithAuth(`http://34.58.58.40/api/transactions/stats${queryParams}`),
        fetchWithAuth(`http://34.58.58.40/api/transactions/forecast${queryParams}`)
      ]);
      
      if (!transactionsRes.ok || !statsRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const transactionsData = await transactionsRes.json();
      const statsData = await statsRes.json();
      const forecastData = await forecastRes.json();
      
      setTransactions(transactionsData);
      setStats(statsData);
      setForecast(forecastData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, year]);

  return { transactions, stats, forecast, isLoading, error, refresh: fetchTransactions };
};
