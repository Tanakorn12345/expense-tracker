import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import { 
  ShoppingBagRounded, 
  FastfoodRounded, 
  DirectionsCarRounded, 
  ConfirmationNumberRounded,
  MoreHorizRounded 
} from "@mui/icons-material";

// Helper to get icon based on category name
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("food") || name.includes("อาหาร")) return <FastfoodRounded fontSize="small" />;
  if (name.includes("travel") || name.includes("เดินทาง")) return <DirectionsCarRounded fontSize="small" />;
  if (name.includes("shop") || name.includes("ช้อปปิ้ง")) return <ShoppingBagRounded fontSize="small" />;
  if (name.includes("bill")) return <ConfirmationNumberRounded fontSize="small" />;
  return <MoreHorizRounded fontSize="small" />;
};

export default function ExpenseList({ expenses = [] }) {
  if (expenses.length === 0) {
    return (
      <Box sx={{ p: 10, textAlign: "center" }}>
        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
          No transactions found.
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Your recent activities will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {expenses.map((e, index) => (
        <Box key={e.id || index}>
          <ListItem
            sx={{
              py: 2,
              px: 3,
              transition: "0.2s",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
            }}
          >
            {/* 1. Category Icon Avatar */}
            <Avatar
              sx={{
                bgcolor: "primary.light",
                color: "primary.main",
                mr: 2,
                width: 40,
                height: 40,
                borderRadius: 2, // Modern squircle shape
              }}
            >
              {getCategoryIcon(e.category?.name)}
            </Avatar>

            {/* 2. Main Info (Category & Date) */}
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 700, color: "#1B254B", fontSize: "0.95rem" }}>
                  {e.category?.name || "Uncategorized"}
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: "0.8rem", color: "#A3AED0" }}>
                  {new Date(e.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {e.description && ` • ${e.description}`}
                </Typography>
              }
            />

            {/* 3. Amount & Status Chip */}
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 800, color: "#1B254B", fontSize: "1rem" }}>
                ${e.amount.toLocaleString()}
              </Typography>
              <Chip 
                label="Completed" 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: "0.65rem", 
                  fontWeight: 800, 
                  bgcolor: "#E6F6F0", 
                  color: "#01B574",
                  borderRadius: 1 
                }} 
              />
            </Box>
          </ListItem>

          {index < expenses.length - 1 && (
            <Divider sx={{ mx: 3, opacity: 0.6 }} />
          )}
        </Box>
      ))}
    </List>
  );
}