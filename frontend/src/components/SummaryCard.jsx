import { Paper, Typography, Box } from "@mui/material";

export default function SummaryCard({ title, value, icon }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ fontSize: 32 }}>{icon}</Box>

      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
