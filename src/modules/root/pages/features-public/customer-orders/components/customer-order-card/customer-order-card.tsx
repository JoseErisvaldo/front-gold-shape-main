import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { formatPrice } from "../../../storefront/helpers/format-price";
import type { CustomerOrder } from "../../types/customer-order.types";

type Props = {
  order: CustomerOrder;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getOrderStatus(order: CustomerOrder) {
  if (order.status === "PAID") return { label: "Pago", color: "success" as const };
  if (order.status === "CANCELED") return { label: "Cancelado", color: "error" as const };
  return { label: "Aguardando pagamento", color: "warning" as const };
}

function getPaymentStatusDetail(detail: string | null) {
  if (!detail) return null;
  const knownDetails: Record<string, string> = {
    accredited: "Pagamento aprovado",
    pending_waiting_transfer: "Aguardando a transferência Pix",
    pending_waiting_payment: "Aguardando pagamento",
    bad_filled_card_data: "Dados do cartão não aprovados",
    cc_rejected_bad_filled_card_number: "Número do cartão não aprovado",
    cc_rejected_insufficient_amount: "Saldo ou limite insuficiente",
  };
  return knownDetails[detail] ?? detail.replaceAll("_", " ");
}

function getCardDescription(order: CustomerOrder) {
  const paymentType =
    order.mercadoPagoPaymentType === "credit_card"
      ? "Crédito"
      : order.mercadoPagoPaymentType === "debit_card"
        ? "Débito"
        : order.mercadoPagoPaymentType === "prepaid_card"
          ? "Pré-pago"
          : null;
  const brand = order.mercadoPagoPaymentMethodId
    ? order.mercadoPagoPaymentMethodId.toLocaleUpperCase("pt-BR")
    : null;
  const installments =
    order.mercadoPagoInstallments && order.mercadoPagoInstallments > 1
      ? `${order.mercadoPagoInstallments} parcelas`
      : null;
  return [brand, paymentType, installments].filter(Boolean).join(" • ");
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ color: "#858A9D", fontSize: 12 }}>{label}</Typography>
      <Typography sx={{ color: "#292D45", fontSize: 14, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

export function CustomerOrderCard({ order }: Props) {
  const status = getOrderStatus(order);
  const isPaid = order.status === "PAID";
  const isCanceled = order.status === "CANCELED";
  const isPix =
    order.mercadoPagoPaymentType === "bank_transfer" ||
    order.mercadoPagoPaymentMethodId === "pix" ||
    order.paymentMethodName?.toLocaleLowerCase("pt-BR").includes("pix");
  const cardDescription = getCardDescription(order);
  const paymentStatusDetail = getPaymentStatusDetail(order.mercadoPagoStatusDetail);
  const address = [
    `${order.street}, ${order.number}${order.complement ? ` - ${order.complement}` : ""}`,
    order.neighborhood,
    `${order.city}/${order.state}`,
    order.cep ? `CEP ${order.cep}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

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
    <Paper elevation={0} sx={{ border: "1px solid #DFE2EC", borderRadius: "16px" }}>
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          borderRadius: "16px",
          "&::before": { display: "none" },
          "&:first-of-type, &:last-of-type": { borderRadius: "16px" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1,
            "& .MuiAccordionSummary-content": {
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
              justifyContent: "space-between",
              my: 1,
            },
          }}
        >
          <Box>
            <Typography sx={{ color: "#292D45", fontWeight: 700 }}>
              Pedido #{order.orderNsu.slice(0, 8).toLocaleUpperCase("pt-BR")}
            </Typography>
            <Typography sx={{ color: "#858A9D", fontSize: 13 }}>
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip size="small" label={status.label} color={status.color} />
            <Typography sx={{ color: "#292D45", fontWeight: 800 }}>
              {formatPrice(order.amount)}
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              }}
            >
              <Detail label="Forma de pagamento" value={order.paymentMethodName ?? "—"} />
              <Detail label="Endereço de entrega" value={address || "Endereço não informado"} />
              <Detail
                label="Situação do pagamento"
                value={
                  isPaid
                    ? "Pagamento confirmado"
                    : isCanceled
                      ? (paymentStatusDetail ?? "Pagamento não concluído")
                      : (paymentStatusDetail ?? "Aguardando confirmação")
                }
              />
              {isPaid && (
                <Detail
                  label="Pago em"
                  value={order.paidAt ? formatDate(order.paidAt) : "Confirmado"}
                />
              )}
              {cardDescription && <Detail label="Dados do cartão" value={cardDescription} />}
              {order.mercadoPagoPaymentId && (
                <Detail label="Identificador do pagamento" value={order.mercadoPagoPaymentId} />
              )}
              {order.mercadoPagoOrderId && (
                <Detail label="Identificador da transação" value={order.mercadoPagoOrderId} />
              )}
              {order.paymentExpiresAt && !isPaid && !isCanceled && (
                <Detail label="Pagamento válido até" value={formatDate(order.paymentExpiresAt)} />
              )}
            </Box>

            {isPaid ? (
              <Alert icon={<CheckCircleOutlineRoundedIcon />} severity="success">
                Pagamento confirmado. Guarde o número do pedido para acompanhar sua compra.
              </Alert>
            ) : isCanceled ? (
              <Alert icon={<ErrorOutlineRoundedIcon />} severity="error">
                Este pagamento não foi aprovado. Consulte os detalhes acima ou faça um novo pedido.
              </Alert>
            ) : isPix ? (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 2,
                  borderRadius: "12px",
                }}
              >
                {order.pixQrCodeBase64 && (
                  <Box
                    component="img"
                    src={`data:image/png;base64,${order.pixQrCodeBase64}`}
                    alt="QR Code Pix do pedido"
                    sx={{ width: 180, maxWidth: "100%", imageRendering: "pixelated" }}
                  />
                )}
                <Stack spacing={1.25} sx={{ width: "100%", minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: "#292D45" }}>
                    Aguardando pagamento Pix
                  </Typography>
                  {order.pixQrCode ? (
                    <>
                      <Typography
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.25,
                          maxHeight: 88,
                          overflow: "auto",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          borderRadius: 1,
                          bgcolor: "#F4F6FB",
                          color: "#5A5F73",
                          fontSize: 12,
                        }}
                      >
                        {order.pixQrCode}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => void copyPixCode()}
                        sx={{ alignSelf: "flex-start", textTransform: "none" }}
                      >
                        Copiar código Pix
                      </Button>
                    </>
                  ) : (
                    <Typography sx={{ color: "#5A5F73", fontSize: 14 }}>
                      O código Pix não está disponível. Atualize a página ou acesse o link de
                      pagamento.
                    </Typography>
                  )}
                  {order.pixTicketUrl && (
                    <Button
                      component="a"
                      href={order.pixTicketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ alignSelf: "flex-start", textTransform: "none" }}
                    >
                      Abrir pagamento Pix
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : (
              <Alert severity="info">
                Aguardando confirmação do pagamento com cartão. O status será atualizado
                automaticamente.
              </Alert>
            )}

            <Box>
              <Typography sx={{ mb: 1, color: "#292D45", fontWeight: 700 }}>
                Itens do pedido
              </Typography>
              <Stack spacing={1}>
                {order.items.map((item) => (
                  <Box
                    key={`${order.id}-${item.productName}-${item.sku}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      color: "#5A5F73",
                      fontSize: 14,
                    }}
                  >
                    <span>
                      {item.quantity} × {item.productName}
                      {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                    </span>
                    <strong>{formatPrice(item.quantity * item.unitPrice)}</strong>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
