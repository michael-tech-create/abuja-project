"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

export type UnitDraft = {
  key: string;
  label: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  areaSqm: string;
};

type UnitsEditorProps = {
  units: UnitDraft[];
  onChange: (units: UnitDraft[]) => void;
};

export function createEmptyUnit(): UnitDraft {
  return {
    key: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
    areaSqm: "",
  };
}

export function UnitsEditor({ units, onChange }: UnitsEditorProps) {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Apartments in this building
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onChange([...units, createEmptyUnit()])}
        >
          Add apartment
        </Button>
      </Stack>

      <input type="hidden" name="unitsJson" value={JSON.stringify(units)} />

      {units.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Add at least one apartment (e.g. Flat 1A, 2-bed, ₦4,500,000/year).
        </Typography>
      )}

      {units.map((unit, index) => (
        <Box
          key={unit.key}
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Unit {index + 1}
            </Typography>
            <IconButton
              size="small"
              aria-label="Remove unit"
              onClick={() =>
                onChange(units.filter((u) => u.key !== unit.key))
              }
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={1.5}>
            <TextField
              label="Label"
              size="small"
              fullWidth
              required
              placeholder="Flat 2A"
              value={unit.label}
              onChange={(e) =>
                onChange(
                  units.map((u) =>
                    u.key === unit.key ? { ...u, label: e.target.value } : u,
                  ),
                )
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Price (₦/year)"
                size="small"
                type="number"
                required
                fullWidth
                value={unit.price}
                onChange={(e) =>
                  onChange(
                    units.map((u) =>
                      u.key === unit.key ? { ...u, price: e.target.value } : u,
                    ),
                  )
                }
              />
              <TextField
                label="Beds"
                size="small"
                type="number"
                fullWidth
                value={unit.bedrooms}
                onChange={(e) =>
                  onChange(
                    units.map((u) =>
                      u.key === unit.key
                        ? { ...u, bedrooms: e.target.value }
                        : u,
                    ),
                  )
                }
              />
              <TextField
                label="Baths"
                size="small"
                type="number"
                fullWidth
                value={unit.bathrooms}
                onChange={(e) =>
                  onChange(
                    units.map((u) =>
                      u.key === unit.key
                        ? { ...u, bathrooms: e.target.value }
                        : u,
                    ),
                  )
                }
              />
              <TextField
                label="Area sqm"
                size="small"
                type="number"
                fullWidth
                value={unit.areaSqm}
                onChange={(e) =>
                  onChange(
                    units.map((u) =>
                      u.key === unit.key
                        ? { ...u, areaSqm: e.target.value }
                        : u,
                    ),
                  )
                }
              />
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
