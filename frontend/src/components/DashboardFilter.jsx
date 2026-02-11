import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function DashboardFilter({ mode, onChange }) {
  const handleChange = (_, value) => {
    if (value) onChange(value);
  };

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleChange}
      sx={{ mb: 3 }}
    >
      <ToggleButton value="day">รายวัน</ToggleButton>
      <ToggleButton value="month">รายเดือน</ToggleButton>
    </ToggleButtonGroup>
  );
}
