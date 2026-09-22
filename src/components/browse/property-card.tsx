"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { LikeButton } from "@/components/properties/like-button";
import {
  budgetHint,
  budgetLabel,
  classifyBudget,
} from "@/lib/properties/budget";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";
import type { Property } from "@/types/database";

export type PropertyCardProps = {
  property: Property;
  liked?: boolean;
  showLike?: boolean;
  /** When multi-unit building, show "From ₦X · N units" */
  unitCount?: number;
  fromPrice?: number;
};

export function PropertyCard({
  property,
  liked = false,
  showLike = false,
  unitCount,
  fromPrice,
}: PropertyCardProps) {
  const cover = property.images[0];
  const tier = classifyBudget(fromPrice ?? property.price);
  const multi = (unitCount ?? 0) > 1;
  const priceValue = multi && fromPrice != null ? fromPrice : Number(property.price);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 40px -28px rgba(60,40,20,0.45)",
          "& .property-media": {
            transform: "scale(1.03)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Link href={`/properties/${property.id}`} style={{ display: "block" }}>
          {cover ? (
            <CardMedia
              component="img"
              image={cover}
              alt={property.title}
              className="property-media"
              sx={{
                aspectRatio: "4 / 3",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                bgcolor: "secondary.light",
              }}
            />
          ) : (
            <Box
              className="property-media"
              sx={{
                aspectRatio: "4 / 3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "secondary.light",
                color: "text.secondary",
                transition: "transform 0.5s ease",
              }}
            >
              No photo
            </Box>
          )}
        </Link>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 52,
            zIndex: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label="Verified"
            color="secondary"
            sx={{ fontWeight: 700, bgcolor: "secondary.light", color: "secondary.contrastText" }}
          />
          <Chip
            size="small"
            label={budgetLabel(tier)}
            sx={{ fontWeight: 700, bgcolor: "rgba(255,252,247,0.95)" }}
          />
          <Chip
            size="small"
            label={districtLabel(property.district)}
            sx={{ fontWeight: 700, bgcolor: "rgba(255,252,247,0.95)" }}
          />
          {property.amenities?.includes("furnished") && (
            <Chip
              size="small"
              label="Furnished"
              sx={{ fontWeight: 700, bgcolor: "rgba(255,252,247,0.95)" }}
            />
          )}
        </Stack>

        {showLike && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <LikeButton propertyId={property.id} liked={liked} path="/browse" />
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          "&:last-child": { pb: 2 },
        }}
      >
        <Box
          component={Link}
          href={`/properties/${property.id}`}
          sx={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            flex: 1,
          }}
        >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {property.title}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <PlaceOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {districtLabel(property.district)}
            {property.address_line ? `, ${property.address_line}` : ""}
          </Typography>
        </Stack>

        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "var(--font-heading), serif" }}
          >
            {multi ? `From ${formatRentLabel(priceValue)}` : formatRentLabel(priceValue)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {multi
              ? `${unitCount} apartments in this building · ${budgetHint(tier)}`
              : budgetHint(tier)}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <Chip size="small" variant="outlined" label={propertyTypeLabel(property.property_type)} />
          {property.bedrooms != null && (
            <Chip size="small" variant="outlined" label={`${property.bedrooms} bed`} />
          )}
          {property.bathrooms != null && (
            <Chip size="small" variant="outlined" label={`${property.bathrooms} bath`} />
          )}
          {property.area_sqm != null && (
            <Chip size="small" variant="outlined" label={`${property.area_sqm} sqm`} />
          )}
        </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
