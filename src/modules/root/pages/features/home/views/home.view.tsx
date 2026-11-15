import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Avatar, Box, Paper, Typography } from "@mui/material";
import { useStoresQuery } from "../../store/queries/use-stores-query";

export function HomeView() {
  const { data: stores = [] } = useStoresQuery();
  const store = stores[0];
  const storeName = store?.name ?? "Loja";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: { xs: "24px 20px 32px", sm: "5vw", md: "5vw" },
        background:
          "radial-gradient(circle at 10% 90%, rgba(111, 92, 231, 0.1), transparent 26%), #f4f6fb",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "min(100%, 680px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2.5,
          p: { xs: 3.5, sm: 6, md: 8 },
          border: "1px solid #e8eaf2",
          borderRadius: "24px",
          bgcolor: "#fff",
          boxShadow: "0 24px 70px rgba(35, 43, 77, 0.09)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar
            src={store?.imageUrl ?? undefined}
            alt={`Logo da ${storeName}`}
            slotProps={{ img: { sx: { objectFit: "cover" } } }}
            sx={{ width: 44, height: 44, bgcolor: "#DCFCE7", color: "#16A34A" }}
          >
            <StorefrontRoundedIcon />
          </Avatar>
          <Typography
            component="span"
            sx={{
              color: "#242842",
              fontFamily: 'Manrope, "DM Sans", sans-serif',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {storeName}
          </Typography>
        </Box>
        <Typography
          component="p"
          sx={{
            mt: 2.25,
            mb: -1,
            color: "#16A34A",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.4px",
          }}
        >
          SEU ESPAÇO DE TRABALHO
        </Typography>
        <Typography
          component="h1"
          variant="h3"
          sx={{
            color: "#20243a",
            fontSize: "clamp(30px, 5vw, 46px)",
            fontWeight: 700,
            letterSpacing: "-1.7px",
          }}
        >
          Bem-vindo à {storeName}
        </Typography>
        <Typography
          component="p"
          sx={{
            mt: -1.25,
            mb: 1.25,
            color: "#777d91",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          Seu espaço está pronto. Organize seus catálogos.
        </Typography>
      </Paper>
    </Box>
  );
}
