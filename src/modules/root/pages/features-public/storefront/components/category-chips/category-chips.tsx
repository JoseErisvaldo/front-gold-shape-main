import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { Avatar, Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import type { PublicCategory } from "../../types/storefront.types";
import { SectionHeading } from "../section-heading/section-heading";

type CategoryChipsProps = {
  categories: PublicCategory[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (categoryId: string | null) => void;
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

export function CategoryChips({ categories, selectedId, isLoading, onSelect }: CategoryChipsProps) {
  const tileSx = (selected: boolean) => ({
    minWidth: 0,
    minHeight: 112,
    px: 0.5,
    py: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 0.75,
    borderRadius: "12px",
    color: "#292D45",
    bgcolor: selected ? "#F0FDF4" : "transparent",
    outline: selected ? "1px solid #86EFAC" : "1px solid transparent",
    "&:hover": { bgcolor: "#F7FAF8" },
    "&:focus-visible": { outline: "2px solid #16A34A", outlineOffset: 2 },
  });

  const imageSx = {
    width: { xs: 52, sm: 60 },
    height: { xs: 52, sm: 60 },
    bgcolor: "#F0FDF4",
    color: "#16A34A",
    border: "1px solid #E5EAE6",
    "& img": { objectFit: "cover" },
  } as const;

  return (
    <Box component="section" aria-label="Explore por categoria">
      <SectionHeading
        title="Explore por categoria"
        subtitle="Encontre rapidamente o que você procura."
        icon={<CategoryRoundedIcon fontSize="small" />}
      />
      <Box
        component="nav"
        aria-label="Categorias"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(4, minmax(0, 1fr))",
            sm: "repeat(6, minmax(0, 1fr))",
            md: "repeat(9, minmax(0, 1fr))",
          },
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {isLoading ? (
          SKELETON_KEYS.map((key) => (
            <Box key={key} sx={{ display: "grid", justifyItems: "center", gap: 1, p: 1 }}>
              <Skeleton variant="circular" width={60} height={60} />
              <Skeleton variant="text" width="80%" />
            </Box>
          ))
        ) : (
          <>
            <ButtonBase
              aria-pressed={selectedId === null}
              onClick={() => onSelect(null)}
              sx={tileSx(selectedId === null)}
            >
              <Avatar sx={imageSx}>
                <CategoryRoundedIcon />
              </Avatar>
              <Typography
                sx={{
                  width: "100%",
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                Todos
              </Typography>
            </ButtonBase>
            {categories.map((category) => {
              const isSelected = selectedId === category.id;
              return (
                <ButtonBase
                  key={category.id}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(isSelected ? null : category.id)}
                  sx={tileSx(isSelected)}
                >
                  <Avatar src={category.imageUrl ?? undefined} alt="" sx={imageSx}>
                    <CategoryRoundedIcon />
                  </Avatar>
                  <Typography
                    sx={{
                      width: "100%",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      textAlign: "center",
                    }}
                  >
                    {category.name}
                  </Typography>
                </ButtonBase>
              );
            })}
          </>
        )}
      </Box>
    </Box>
  );
}
