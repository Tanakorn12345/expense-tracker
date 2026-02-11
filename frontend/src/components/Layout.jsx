import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            💸 Expense Tracker
          </Typography>

          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/expenses"
            >
              Expenses
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
