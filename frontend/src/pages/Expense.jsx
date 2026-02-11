import { useEffect, useState } from "react";
import api from "../api";
import {
  TextField, Button, Stack, Typography, Box, InputAdornment, Card
} from "@mui/material";
import {
  PaymentsRounded, SaveRounded, AddCircleOutlineRounded,
  DescriptionRounded, CalendarMonthRounded, CategoryRounded
} from "@mui/icons-material";
import ExpenseList from "../components/ExpenseList";

console.log("API URL:", import.meta.env.VITE_API_URL);

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/expenses", { 
        amount: Number(amount), 
        description, 
        date, 
        categoryName 
      });
      setAmount(""); 
      setDescription(""); 
      setDate(""); 
      setCategoryName("");
      await fetchExpenses();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Box sx={{ 
      bgcolor: "#F0F2F5", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      overflow: "hidden" 
    }}>
      
      {/* 1. Header (Top) */}
      <Box sx={{ p: 3, bgcolor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1, bgcolor: "primary.main", borderRadius: 2, color: "white", display: 'flex' }}>
            <PaymentsRounded fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Expense Management
          </Typography>
        </Stack>
      </Box>

      {/* 2. Main Content Area (Flex Row) */}
      <Box sx={{ 
        display: "flex", 
        flex: 1, 
        p: 2, 
        gap: 2, 
        flexDirection: { xs: "column", lg: "row" }, 
        overflow: "hidden" 
      }}>
        
        {/* --- Left Side: Entry Form (Fixed Width) --- */}
        <Card sx={{ 
          p: 3, 
          borderRadius: 4, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          flex: { lg: "0 0 350px" }, 
          display: "flex",
          flexDirection: "column"
        }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <AddCircleOutlineRounded color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Add New Transaction
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Amount" 
                size="small" 
                fullWidth 
                required 
                type="number"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">$</InputAdornment> 
                }}
              />
              <TextField
                label="Date" 
                size="small" 
                fullWidth 
                required 
                type="date"
                InputLabelProps={{ shrink: true }}
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthRounded fontSize="small" sx={{color: '#94a3b8'}}/>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Description" 
                size="small" 
                fullWidth 
                required
                placeholder="What did you buy?"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionRounded fontSize="small" sx={{color: '#94a3b8'}}/>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Category" 
                size="small" 
                fullWidth 
                required
                placeholder="Food, Travel, etc."
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryRounded fontSize="small" sx={{color: '#94a3b8'}}/>
                    </InputAdornment>
                  )
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                startIcon={<SaveRounded />}
                sx={{ borderRadius: 2, fontWeight: 700, py: 1.2, mt: 2 }}
              >
                {loading ? "Saving..." : "Save Transaction"}
              </Button>
            </Stack>
          </form>
        </Card>

        {/* --- Right Side: Expense History (Flex Grow) --- */}
        <Card sx={{ 
          borderRadius: 4, 
          flex: 1, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden" 
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#fff' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Transaction History
            </Typography>
          </Box>
          
          {/* Scrollable List Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: "auto", 
            p: 1,
            bgcolor: "#F8FAFC" 
          }}>
            <ExpenseList expenses={expenses} />
          </Box>
        </Card>

      </Box>
    </Box>
  );
}