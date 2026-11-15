import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { toast } from "sonner";
import { formatPrice } from "../../helpers/format-price";
import type { CheckoutStatus } from "../../services/create-checkout.service";

type Props = {
  order: CheckoutStatus;
  refreshError: unknown;
  onRetry: () => void;
  onClose: () => void;
};

export function CheckoutResultView({ order, refreshError, onRetry, onClose }: Props) {
  const isPaid = order.status === "PAID";
  const isCanceled = order.status === "CANCELED";

  async function copyPixCode() {
    if (!order.pixQrCode) return;
    try {
      await navigator.clipboard.writeText(order.pixQrCode);
      toast.success("Código Pix copiado.");
    } catch (error) {
      console.error("Could not copy Pix code", error);
      toast.error("Não foi possível copiar o código Pix.");
    }
  }

  return (
    <Stack
      spacing={2.5}
      sx={{
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        p: { xs: 2.5, sm: 3 },
        textAlign: "center",
      }}
    >
      {isPaid ? (
        <Box
          sx={{
            width: 108,
            height: 108,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "#16A34A",
            color: "#FFFFFF",
          }}
        >
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 74 }} />
        </Box>
      ) : isCanceled ? (
        <Box
          sx={{
            width: 108,
            height: 108,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "#B42318",
            color: "#FFFFFF",
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 74 }} />
        </Box>
      ) : (
        <Box
          sx={{
            width: 108,
            height: 108,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "#FFF7ED",
            color: "#C2410C",
          }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: 64 }} />
        </Box>
      )}
      <Box>
        <Typography variant="h6" sx={{ color: "#292D45", fontWeight: 800 }}>
          {isPaid
            ? "Pagamento confirmado"
            : isCanceled
              ? "Não foi possível concluir o pagamento"
              : order.paymentMethodName?.toLocaleLowerCase("pt-BR").includes("pix")
                ? "Aguardando pagamento Pix"
                : "Aguardando confirmação do pagamento"}
        </Typography>
        <Typography sx={{ mt: 0.75, color: "#5A5F73", fontSize: 14 }}>
          Pedido {order.orderNsu}
        </Typography>
        <Typography sx={{ mt: 0.5, color: "#292D45", fontSize: 18, fontWeight: 700 }}>
          {formatPrice(order.amount)}
        </Typography>
      </Box>

      {isCanceled && (
        <Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
          {order.paymentStatusDetail === "bad_filled_card_data"
            ? "Os dados do cartão ou documento foram recusados. Confira os dados e, em ambiente de teste, use um cartão de teste válido do Mercado Pago."
            : "O pagamento não foi aprovado. Confira os dados e tente novamente."}
        </Alert>
      )}

      {order.deliveryFeePending && (
        <Alert severity="warning" sx={{ width: "100%", textAlign: "left" }}>
          A taxa de entrega está pendente e não foi incluída neste pagamento. O valor será definido
          pela loja.
        </Alert>
      )}

      {!isPaid && !isCanceled && order.pixQrCodeBase64 && (
        <Box
          component="img"
          src={`data:image/png;base64,${order.pixQrCodeBase64}`}
          alt="QR Code Pix para pagamento"
          sx={{ width: 220, maxWidth: "100%", imageRendering: "pixelated" }}
        />
      )}
      {!isPaid && !isCanceled && order.pixQrCode && (
        <Button
          variant="outlined"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={() => void copyPixCode()}
          sx={{ textTransform: "none" }}
        >
          Copiar código Pix
        </Button>
      )}
      {!isPaid && !isCanceled && order.pixTicketUrl && (
        <Button
          component="a"
          href={order.pixTicketUrl}
          target="_blank"
          rel="noreferrer"
          sx={{ textTransform: "none" }}
        >
          Abrir página de pagamento
        </Button>
      )}
      {Boolean(refreshError) && (
        <Alert severity="warning" sx={{ width: "100%", textAlign: "left" }}>
          Não foi possível atualizar o status. Mantenha esta tela aberta para tentar novamente.
        </Alert>
      )}
      <Button
        variant="contained"
        onClick={isCanceled ? onRetry : onClose}
        sx={{
          minWidth: 180,
          bgcolor: "#16A34A",
          textTransform: "none",
          "&:hover": { bgcolor: "#15803D" },
        }}
      >
        {isCanceled ? "Tentar novamente" : isPaid ? "Concluir" : "Fechar"}
      </Button>
    </Stack>
  );
}
