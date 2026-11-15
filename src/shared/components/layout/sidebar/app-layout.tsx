import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { APP_SIDEBAR_CONFIG } from "./sidebar-config";

type AppLayoutProps = {
  onLogout: () => void;
  storeName: string;
  storeImageUrl: string | null;
};

export function AppLayout({ onLogout, storeName, storeImageUrl }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb" }}>
      <AppSidebar
        config={{
          ...APP_SIDEBAR_CONFIG,
          brand: storeName,
          brandImageUrl: storeImageUrl,
        }}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onItemClick={() => setMobileSidebarOpen(false)}
        onAction={(action) => {
          if (action === "logout") onLogout();
        }}
      />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          color: "#242842",
          bgcolor: "rgba(255, 255, 255, 0.94)",
          borderBottom: "1px solid #eceef5",
          backdropFilter: "blur(14px)",
        }}
      >
        <Toolbar sx={{ minHeight: "62px !important" }}>
          <IconButton
            aria-label="Abrir navegação"
            onClick={() => setMobileSidebarOpen(true)}
            edge="start"
            sx={{ width: 42, height: 42, mr: 1.25, color: "#16A34A" }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Avatar
            src={storeImageUrl ?? undefined}
            alt={`Logo da ${storeName}`}
            slotProps={{ img: { sx: { objectFit: "cover" } } }}
            sx={{ width: 34, height: 34, mr: 1, bgcolor: "#DCFCE7", color: "#16A34A" }}
          >
            <StorefrontRoundedIcon fontSize="small" />
          </Avatar>
          <Typography
            component="span"
            sx={{
              fontFamily: 'Manrope, "DM Sans", sans-serif',
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            {storeName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          ml: { xs: 0, md: "264px" },
          pt: { xs: "62px", md: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
