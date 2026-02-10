import { Container, Typography } from "@mui/material";
import Expense from "./pages/Expense";

function App() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        Expense Tracker
      </Typography>

      <Expense />
    </Container>
  );
}

export default App;
