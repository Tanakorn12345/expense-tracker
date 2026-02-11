import { useEffect, useState } from "react";

import DailyExpenseBarChart from "../components/DailyExpenseBarChart";
import CategoryPieChart from "../components/CategoryPieChart";
import api from "../api";
import { 
  Box, Typography, Stack, ToggleButton, 
  ToggleButtonGroup, TextField, IconButton, Card 
} from "@mui/material";
import { 
  BarChartRounded, 
  RestartAltRounded, 
  PieChartRounded,
  AccountBalanceWalletRounded
} from "@mui/icons-material";



console.log("API URL:", import.meta.env.VITE_API_URL);

export default function Dashboard() {
  const [mode, setMode] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/api/summary`, {
        params: { mode, startDate, endDate }
      });
      console.log("SUMMARY DATA:", res.data);
      
      setChartData(res.data.byDate || []);
      setCategoryData(res.data.byCategory || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  useEffect(() => { fetchSummary(); }, [mode, startDate, endDate]);

  const totalAmount = categoryData.reduce((acc, curr) => {
    return acc + (Number(curr.total) || Number(curr.value) || 0);
  }, 0);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", p: 2 }}>
      
      {/* Header & Total (Top Row) */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, px: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1B254B" }}>📊 Expense Overview</Typography>
        <Card sx={{ px: 2, py: 1, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountBalanceWalletRounded sx={{ color: '#4318FF' }} />
            <Typography sx={{ color: "#1B254B", fontSize: 20, fontWeight: 900 }}>
              ฿{totalAmount.toLocaleString()}
            </Typography>
          </Stack>
        </Card>
      </Stack>

      {/* Main Content Area - เรียงเป็นแนวตั้ง (Flex Column) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
        
        {/* --- ส่วนที่ 1: Filters (วางแนวนอนยาวๆ ด้านบนกราฟ) --- */}
        <Card sx={{ p: 2, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Typography sx={{ color: "#1B254B", fontSize: 14, fontWeight: 700 }}>FILTERS</Typography>
            
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(e, v) => v && setMode(v)}
              size="small"
              sx={{ bgcolor: '#F4F7FE' }}
            >
              <ToggleButton value="day" sx={{ px: 3, fontWeight: 700 }}>DAY</ToggleButton>
              <ToggleButton value="month" sx={{ px: 3, fontWeight: 700 }}>MONTH</ToggleButton>
            </ToggleButtonGroup>

            <Stack direction="row" spacing={2} flex={1}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Stack>

            <IconButton 
              onClick={() => {setStartDate(""); setEndDate("");}}
              sx={{ bgcolor: '#FFF5F5', color: '#EE5D50', "&:hover": { bgcolor: '#FFEDED' } }}
            >
              <RestartAltRounded />
            </IconButton>
          </Stack>
        </Card>

        {/* --- ส่วนที่ 2: Expense Trend (ขยายเต็มด้านบน) --- */}
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <BarChartRounded sx={{ color: '#4318FF' }} />
            <Typography sx={{ fontWeight: 800, color: "#1B254B", fontSize: 18 }}>Expense Trend</Typography>
          </Stack>
          <Box sx={{ height: 400, width: '100%' }}>
            <DailyExpenseBarChart data={chartData} mode={mode} />
          </Box>
        </Card>

        {/* --- ส่วนที่ 3: Category (ขยายเต็มด้านล่าง) --- */}
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <PieChartRounded sx={{ color: '#FF3D71' }} />
            <Typography sx={{ fontWeight: 800, color: "#1B254B", fontSize: 18 }}>Category</Typography>
          </Stack>
          <Box sx={{ height: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CategoryPieChart data={categoryData} />
          </Box>
        </Card>

      </Box>
    </Box>
  );
}