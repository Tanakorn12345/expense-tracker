import { useEffect, useState } from "react";
import api from "../services/api";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
} from "@mui/material";

export default function ExpenseForm({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/expenses", {
      amount: Number(amount),
      description,
      date,
      categoryId: Number(categoryId),
    });

    setAmount("");
    setDescription("");
    setDate("");
    setCategoryId("");

    onSuccess(); // 🔥 บอก parent ให้ refresh
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        เพิ่มค่าใช้จ่าย
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="จำนวนเงิน"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <TextField
            label="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <TextField
            label="วันที่"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <TextField
            select
            label="หมวดหมู่"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={loadingCategories}
          >
            {loadingCategories ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <Button type="submit" variant="contained">
            บันทึก
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
