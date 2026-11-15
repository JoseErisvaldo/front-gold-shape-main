import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Badge,
  Box,
  Button,
  ButtonBase,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import goldShapeLogo from "../../../../../../../assets/goldshape-logo.png";
import { trackEvent } from "../../helpers/storefront-analytics";

type StorefrontHeaderProps = {
  storeName: string;
  isStoreLoading: boolean;
  logoSrc?: string;
  isAuthenticated: boolean;
  itemsCount: number;
  onHomeClick: () => void;
  onLogout: () => void;
  onOrdersClick: () => void;
  onStoreClick: () => void;
  onCartClick: () => void;
};

const ICON_BUTTON_SX = { width: { xs: 40, sm: 44 }, height: 44, color: "#292D45" } as const;

export function StorefrontHeader({
  storeName,
  isStoreLoading,
  isAuthenticated,
  itemsCount,
  onHomeClick,
  onLogout,
  onOrdersClick,
  onStoreClick,
  onCartClick,
}: StorefrontHeaderProps) {
  const handleStoreClick = () => {
    trackEvent("store_profile_opened", { source: "header" });
    onStoreClick();
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid #DFE2EC",
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        pt: "env(safe-area-inset-top)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 4 },
          py: 1.25,
        }}
      >
        <ButtonBase
          onClick={onHomeClick}
          aria-label={`${storeName || "Loja"}, ir para o início`}
          sx={{ gap: 1.5, borderRadius: "12px", textAlign: "left" }}
        >
          <img className="brand-mark" src={goldShapeLogo} alt="" width={44} height={44} />

          {isStoreLoading ? (
            <Skeleton width={110} height={26} />
          ) : (
            <Typography
              sx={{
                color: "#1D2A22",
                fontSize: { xs: 17, sm: 19 },
                fontWeight: 800,
                letterSpacing: "-0.3px",
              }}
            >
              {storeName}
            </Typography>
          )}
        </ButtonBase>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Sobre a loja">
            <IconButton
              aria-label="Ver perfil da loja"
              onClick={handleStoreClick}
              sx={{ ...ICON_BUTTON_SX, display: { xs: "none", sm: "inline-flex" } }}
            >
              <StorefrontOutlinedIcon />
            </IconButton>
          </Tooltip>

          {isAuthenticated && (
            <Tooltip title="Meus pedidos">
              <IconButton aria-label="Ver meus pedidos" onClick={onOrdersClick} sx={ICON_BUTTON_SX}>
                <ReceiptLongRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            aria-label={`Abrir carrinho, ${itemsCount} ${itemsCount === 1 ? "item" : "itens"}`}
            onClick={onCartClick}
            sx={ICON_BUTTON_SX}
          >
            <Badge
              badgeContent={itemsCount}
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  color: "#FFFFFF",
                  bgcolor: "#F58A33",
                  fontWeight: 700,
                },
              }}
            >
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>

          {isAuthenticated && (
            <Button
              aria-label="Sair da conta"
              onClick={onLogout}
              startIcon={<LogoutRoundedIcon />}
              sx={{
                minWidth: 44,
                minHeight: 44,
                px: { xs: 1, sm: 1.5 },
                borderRadius: "10px",
                color: "#292D45",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Sair
              </Box>
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
