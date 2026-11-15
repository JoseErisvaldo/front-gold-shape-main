import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { apiClient } from "../../../../../../../shared/services/api-client";
import { useAuthStore } from "../../../../../../../shared/store";
import { logError } from "../../../../../../../shared/utils";
import { formatPrice } from "../../helpers/format-price";
import { isValidBrazilianDocument } from "../../helpers/is-valid-brazilian-document";
import { useCartDrawer } from "../../hooks/use-cart-drawer";
import {
  type CheckoutPayment,
  type CheckoutResponse,
  getCheckoutStatusService,
} from "../../services/create-checkout.service";
import { CartItemRow } from "../cart-item-row/cart-item-row";
import { DeliveryForm } from "../delivery-form/delivery-form";
import { OrderReview } from "../order-review/order-review";
import { CheckoutResultView } from "./checkout-result.view";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const PRIMARY_BUTTON_SX = {
  mt: 2,
  minHeight: 48,
  borderRadius: "10px",
  bgcolor: "#16A34A",
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#15803D" },
} as const;

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
if (publicKey) initMercadoPago(publicKey, { locale: "pt-BR" });

type CardPaymentSubmit = NonNullable<ComponentProps<typeof CardPayment>["onSubmit"]>;
type CardPaymentType = "credit_card" | "debit_card" | "prepaid_card";

const CARD_PAYMENT_OPTION_ID = "mercado-pago-card";

function normalizePaymentMethodName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function getCardPaymentMethodId(
  methods: { id: string; name: string }[],
  paymentTypeId: CardPaymentType,
) {
  const cardMethods = methods.filter(({ name }) =>
    normalizePaymentMethodName(name).includes("cartao"),
  );
  const genericCardMethod = cardMethods.find(({ name }) => {
    const normalizedName = normalizePaymentMethodName(name);
    return !normalizedName.includes("credito") && !normalizedName.includes("debito");
  });
  if (genericCardMethod) return genericCardMethod.id;

  if (paymentTypeId === "prepaid_card") return undefined;
  const cardType = paymentTypeId === "debit_card" ? "debito" : "credito";
  return cardMethods.find(({ name }) => normalizePaymentMethodName(name).includes(cardType))?.id;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [cardSubmissionError, setCardSubmissionError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const session = useAuthStore((state) => state.session);
  const customerName = typeof session?.name === "string" ? session.name : "";
  const customerEmail = typeof session?.email === "string" ? session.email : "";
  useEffect(() => {
    apiClient
      .get("/public/payment-methods")
      .then(({ data }) => {
        setPaymentMethods(data);
      })
      .catch(() => setPaymentMethods([]));
  }, []);
  const {
    step,
    goToDelivery,
    goToReview,
    goBack,
    items,
    itemsCount,
    originalSubtotal,
    discount,
    subtotal,
    deliveryFee,
    isFeeToAgree,
    delivery,
    setQuantity,
    removeItem,
    clear,
    canContinue,
    canReview,
    canCheckout,
    isCheckoutLoading,
    isRefreshingPrices,
    priceRefreshError,
    pricesChanged,
    checkoutPriceChanged,
    hasUnavailableItems,
    refreshCartPrices,
    checkout,
    deliveryForm,
  } = useCartDrawer();

  const checkoutStatusQuery = useQuery({
    queryKey: ["storefront", "checkout-status", checkoutResult?.orderNsu],
    queryFn: () => {
      const orderNsu = checkoutResult?.orderNsu;
      if (!orderNsu) throw new Error("Identificador do pedido indisponível.");
      return getCheckoutStatusService(orderNsu);
    },
    enabled: Boolean(checkoutResult?.orderNsu && checkoutResult.status === "PENDING"),
    refetchInterval: (query) =>
      (query.state.data?.status ?? checkoutResult?.status) === "PENDING" ? 5_000 : false,
  });
  const currentCheckout = checkoutStatusQuery.data ?? checkoutResult;
  const clearedOrderNsu = useRef<string | null>(null);

  useEffect(() => {
    if (
      currentCheckout?.status === "PAID" &&
      clearedOrderNsu.current !== currentCheckout.orderNsu
    ) {
      clearedOrderNsu.current = currentCheckout.orderNsu;
      clear();
    }
  }, [clear, currentCheckout?.orderNsu, currentCheckout?.status]);

  const refreshCartPricesRef = useRef(refreshCartPrices);
  useEffect(() => {
    refreshCartPricesRef.current = refreshCartPrices;
  }, [refreshCartPrices]);

  useEffect(() => {
    if (open && items.length > 0) void refreshCartPricesRef.current();
  }, [open, items.length]);

  const isEmpty = items.length === 0;
  const isDeliveryStep = step === "delivery" && !isEmpty;
  const isReviewStep = step === "review" && !isEmpty;
  const cardMethods = paymentMethods.filter(({ name }) =>
    normalizePaymentMethodName(name).includes("cartao"),
  );
  const paymentMethodOptions = [
    ...paymentMethods.filter(({ name }) => !normalizePaymentMethodName(name).includes("cartao")),
    ...(cardMethods.length > 0
      ? [{ id: CARD_PAYMENT_OPTION_ID, name: "Cartão de crédito ou débito" }]
      : []),
  ];
  const selectedPaymentMethod =
    paymentMethodId === CARD_PAYMENT_OPTION_ID
      ? { id: CARD_PAYMENT_OPTION_ID, name: "Cartão de crédito ou débito" }
      : paymentMethods.find(({ id }) => id === paymentMethodId);
  const normalizedPaymentMethodName = selectedPaymentMethod
    ? normalizePaymentMethodName(selectedPaymentMethod.name)
    : "";
  const isPixSelected = normalizedPaymentMethodName.includes("pix");
  const isCardSelected =
    paymentMethodId === CARD_PAYMENT_OPTION_ID || normalizedPaymentMethodName.includes("cartao");
  const isCustomerEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const displayedSubtotal = isPixSelected ? subtotal : originalSubtotal;
  const displayedDiscount = isPixSelected ? discount : 0;
  const displayedTotal = displayedSubtotal + deliveryFee;

  const handlePaymentMethodChange = (nextPaymentMethodId: string) => {
    setPaymentMethodId(nextPaymentMethodId);
    setCardSubmissionError(null);
  };

  const submitPixPayment = async () => {
    const result = await checkout(customerWhatsapp, paymentMethodId, true, { type: "pix" });
    if (result) {
      clearedOrderNsu.current = null;
      setCheckoutResult(result);
      setIsConfirmDialogOpen(false);
    }
  };

  const submitCardPayment: CardPaymentSubmit = async (formData, additionalData) => {
    setCardSubmissionError(null);
    try {
      const paymentTypeId = additionalData?.paymentTypeId;
      if (
        paymentTypeId !== "credit_card" &&
        paymentTypeId !== "debit_card" &&
        paymentTypeId !== "prepaid_card"
      ) {
        throw new Error("Não foi possível identificar o tipo do cartão.");
      }
      const cardPaymentMethodId = getCardPaymentMethodId(paymentMethods, paymentTypeId);
      if (!cardPaymentMethodId) {
        throw new Error("A loja não aceita esse tipo de cartão.");
      }

      const identification = formData.payer?.identification;
      const identificationType =
        identification?.type === "CPF" || identification?.type === "CNPJ"
          ? identification.type
          : undefined;
      if (
        identificationType &&
        identification?.number &&
        !isValidBrazilianDocument(identificationType, identification.number)
      ) {
        throw new Error(`Informe um ${identificationType} válido no formulário do cartão.`);
      }

      const payment: CheckoutPayment = {
        type: "card",
        token: formData.token,
        paymentMethodId: formData.payment_method_id,
        paymentTypeId,
        installments: Number(formData.installments),
        ...(identificationType && identification?.number
          ? {
              identification: {
                type: identificationType,
                number: identification.number,
              },
            }
          : {}),
      };
      const result = await checkout(customerWhatsapp, cardPaymentMethodId, false, payment);
      if (!result) throw new Error("Não foi possível iniciar o pagamento.");
      clearedOrderNsu.current = null;
      setCheckoutResult(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível processar o cartão.";
      setCardSubmissionError(message);
      throw error;
    }
  };

  const retryCheckout = () => {
    setCheckoutResult(null);
    setPaymentMethodId("");
    clearedOrderNsu.current = null;
  };
  const showBackButton = isDeliveryStep || isReviewStep;

  const title = isReviewStep
    ? "Revisar pedido"
    : isDeliveryStep
      ? "Entrega"
      : `Seu carrinho${itemsCount > 0 ? ` (${itemsCount})` : ""}`;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: isReviewStep ? 560 : 420 },
            maxWidth: "100%",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {!isCheckoutLoading && !currentCheckout && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderBottom: "1px solid #DFE2EC",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {showBackButton && (
                <IconButton aria-label="Voltar" onClick={goBack} size="small" edge="start">
                  <ArrowBackRoundedIcon />
                </IconButton>
              )}
              <Typography component="h2" sx={{ color: "#292D45", fontSize: 18, fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
            <IconButton aria-label="Fechar carrinho" onClick={onClose} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        )}

        {isCheckoutLoading ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            <Stack spacing={2} sx={{ alignItems: "center" }}>
              <CircularProgress size={44} sx={{ color: "#16A34A" }} />
              <Typography sx={{ color: "#5A5F73", fontSize: 14 }}>
                Processando pagamento…
              </Typography>
            </Stack>
          </Box>
        ) : currentCheckout ? (
          <CheckoutResultView
            order={currentCheckout}
            isRefreshing={checkoutStatusQuery.isFetching}
            refreshError={checkoutStatusQuery.error}
            onRetry={retryCheckout}
            onClose={() => {
              if (currentCheckout.status !== "PENDING") setCheckoutResult(null);
              onClose();
            }}
          />
        ) : isEmpty ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                display: "grid",
                placeItems: "center",
                mb: 2,
                borderRadius: "18px",
                color: "#16A34A",
                bgcolor: "#F0FDF4",
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography sx={{ color: "#292D45", fontSize: 17, fontWeight: 700 }}>
              Seu carrinho está vazio
            </Typography>
            <Typography sx={{ mt: 1, color: "#858A9D", fontSize: 13, lineHeight: 1.7 }}>
              Adicione produtos para montar o seu pedido.
            </Typography>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                mt: 2.5,
                minHeight: 40,
                px: 3,
                borderRadius: "9px",
                color: "#16A34A",
                borderColor: "#16A34A",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Continuar comprando
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: { xs: 2.5, sm: 3 },
                py: isDeliveryStep || isReviewStep ? 2.5 : 0,
              }}
            >
              {isReviewStep ? (
                <>
                  <OrderReview
                    items={items}
                    delivery={delivery}
                    customerName={customerName}
                    customerWhatsapp={customerWhatsapp}
                    originalSubtotal={displayedSubtotal}
                    discount={displayedDiscount}
                    subtotal={displayedSubtotal}
                    deliveryFee={deliveryFee}
                    isFeeToAgree={isFeeToAgree}
                    total={displayedTotal}
                    isPixSelected={isPixSelected}
                    isCardSelected={isCardSelected}
                    onEditDelivery={goBack}
                  />
                  <Typography
                    component="h3"
                    sx={{ mt: 3, mb: 1.5, color: "#292D45", fontSize: 16, fontWeight: 700 }}
                  >
                    Pagamento
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1.5, mb: 2 }}>
                    <TextField
                      fullWidth
                      type="email"
                      label="E-mail da conta"
                      value={customerEmail}
                      disabled
                      autoComplete="email"
                    />
                    <TextField
                      select
                      required
                      label="Forma de pagamento"
                      value={paymentMethodId}
                      onChange={(event) => handlePaymentMethodChange(event.target.value)}
                      helperText={
                        !paymentMethodId
                          ? "Selecione uma forma de pagamento para continuar."
                          : undefined
                      }
                    >
                      {paymentMethodOptions.map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  {isCardSelected && (
                    <Box sx={{ mb: 3 }}>
                      {!isCustomerEmailValid ? (
                        <Alert severity="info">
                          Informe um e-mail válido para carregar o formulário do cartão.
                        </Alert>
                      ) : !publicKey ? (
                        <Alert severity="warning">
                          Configure VITE_MP_PUBLIC_KEY no frontend para habilitar o pagamento com
                          cartão.
                        </Alert>
                      ) : (
                        <>
                          <Alert severity="info" sx={{ mb: 1.5 }}>
                            Use como referência os valores por parcela e o total final exibidos pelo
                            Mercado Pago.
                          </Alert>
                          {cardSubmissionError && (
                            <Alert severity="error" sx={{ mb: 1.5 }}>
                              {cardSubmissionError}
                            </Alert>
                          )}
                          <Paper
                            variant="outlined"
                            sx={{ p: { xs: 1.5, sm: 2 }, borderColor: "#DFE2EC" }}
                          >
                            <CardPayment
                              initialization={{
                                amount: displayedTotal,
                                payer: { email: customerEmail },
                              }}
                              onSubmit={submitCardPayment}
                              onError={(error) => {
                                logError("mercadoPagoCardBrick", error);
                              }}
                              locale="pt-BR"
                            />
                          </Paper>
                        </>
                      )}
                    </Box>
                  )}
                  {!isPixSelected && !isCardSelected && paymentMethodId && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Esta forma de pagamento não está disponível para compras online.
                    </Alert>
                  )}
                </>
              ) : isDeliveryStep ? (
                <DeliveryForm
                  {...deliveryForm}
                  customerName={customerName}
                  customerWhatsapp={customerWhatsapp}
                  onCustomerWhatsappChange={setCustomerWhatsapp}
                />
              ) : (
                <>
                  {isRefreshingPrices && (
                    <Alert severity="info" sx={{ my: 2 }}>
                      Atualizando preços e disponibilidade...
                    </Alert>
                  )}
                  {priceRefreshError && (
                    <Alert severity="error" sx={{ my: 2 }}>
                      Não foi possível atualizar o carrinho. Tente novamente antes de continuar.
                    </Alert>
                  )}
                  {pricesChanged && (
                    <Alert severity="warning" sx={{ my: 2 }}>
                      Os preços foram atualizados. Confira os novos valores antes de continuar.
                    </Alert>
                  )}
                  {hasUnavailableItems && (
                    <Alert severity="error" sx={{ my: 2 }}>
                      Um ou mais produtos não têm estoque suficiente. Remova-os ou ajuste a
                      quantidade para continuar.
                    </Alert>
                  )}
                  {items.map((item) => (
                    <CartItemRow
                      key={item.variantId}
                      item={item}
                      onQuantityChange={setQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </>
              )}
            </Box>

            <Box
              sx={{
                px: { xs: 2.5, sm: 3 },
                pt: 2,
                pb: "calc(16px + env(safe-area-inset-bottom))",
                borderTop: "1px solid #DFE2EC",
                bgcolor: "#FFFFFF",
              }}
            >
              {isReviewStep ? (
                <Box>
                  {priceRefreshError && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => void refreshCartPrices()}
                        >
                          Tentar novamente
                        </Button>
                      }
                    >
                      Não foi possível atualizar os preços. Tente novamente antes de continuar.
                    </Alert>
                  )}
                  {pricesChanged && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Os valores foram atualizados. Confira o novo total antes de confirmar.
                    </Alert>
                  )}
                  {checkoutPriceChanged && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => setIsConfirmDialogOpen(true)}
                        >
                          Tentar novamente
                        </Button>
                      }
                    >
                      O preço mudou durante o pedido. Ele não foi registrado. Confira o total
                      atualizado e tente novamente.
                    </Alert>
                  )}
                  {hasUnavailableItems && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Há produto sem estoque suficiente. Volte ao carrinho e ajuste os itens.
                    </Alert>
                  )}
                  {isCardSelected ? (
                    <Typography sx={{ color: "#5A5F73", fontSize: 13, lineHeight: 1.6 }}>
                      O total do cartão é o valor indicado pelo Mercado Pago para as parcelas
                      selecionadas.
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ color: "#5A5F73", fontSize: 14 }}>
                        {isFeeToAgree ? "Total parcial (sem entrega)" : "Total"}
                      </Typography>
                      <Typography sx={{ color: "#292D45", fontSize: 22, fontWeight: 800 }}>
                        {formatPrice(displayedTotal)}
                      </Typography>
                    </Box>
                  )}
                  {isPixSelected && (
                    <Button
                      fullWidth
                      disableElevation
                      variant="contained"
                      disabled={
                        !canCheckout ||
                        !customerName.trim() ||
                        customerWhatsapp.replace(/\D/g, "").length < 10 ||
                        !isCustomerEmailValid ||
                        !paymentMethodId
                      }
                      startIcon={<PaymentRoundedIcon />}
                      onClick={() => setIsConfirmDialogOpen(true)}
                      sx={PRIMARY_BUTTON_SX}
                    >
                      Gerar Pix
                    </Button>
                  )}
                  {!isPixSelected && !isCardSelected && paymentMethodId && (
                    <Alert severity="error">
                      Esta forma de pagamento não está disponível para compras online.
                    </Alert>
                  )}

                  {isFeeToAgree ? (
                    <Alert severity="info" sx={{ mt: 1.5, borderRadius: "10px" }}>
                      A taxa de entrega não está incluída neste pagamento e será definida pela loja.
                    </Alert>
                  ) : null}
                </Box>
              ) : isDeliveryStep ? (
                <>
                  <Typography sx={{ color: "#858A9D", fontSize: 12, lineHeight: 1.6 }}>
                    Na próxima etapa você confere os produtos, os descontos e o valor da entrega.
                  </Typography>

                  <Button
                    fullWidth
                    disableElevation
                    variant="contained"
                    disabled={
                      !canReview ||
                      !customerName.trim() ||
                      customerWhatsapp.replace(/\D/g, "").length < 10
                    }
                    startIcon={<ReceiptLongRoundedIcon />}
                    onClick={goToReview}
                    sx={PRIMARY_BUTTON_SX}
                  >
                    Revisar pedido
                  </Button>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ color: "#5A5F73", fontSize: 14 }}>Subtotal</Typography>
                    <Typography sx={{ color: "#292D45", fontSize: 22, fontWeight: 800 }}>
                      {formatPrice(subtotal)}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#858A9D",
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    Na próxima etapa você escolhe o bairro e informa o endereço de entrega.
                  </Typography>

                  <Button
                    fullWidth
                    disableElevation
                    variant="contained"
                    disabled={!canContinue}
                    startIcon={<LocalShippingRoundedIcon />}
                    onClick={goToDelivery}
                    sx={PRIMARY_BUTTON_SX}
                  >
                    Continuar para entrega
                  </Button>

                  <Button
                    fullWidth
                    color="inherit"
                    onClick={clear}
                    sx={{
                      mt: 1,
                      color: "#858A9D",
                      fontSize: 13,
                      textTransform: "none",
                    }}
                  >
                    Limpar carrinho
                  </Button>
                </>
              )}
            </Box>
          </>
        )}
      </Box>
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => {
          if (!isCheckoutLoading) setIsConfirmDialogOpen(false);
        }}
        aria-labelledby="confirm-pix-payment-title"
      >
        <DialogTitle id="confirm-pix-payment-title">Confirmar pagamento Pix?</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ borderRadius: "10px" }}>
            Ao confirmar, vamos gerar seu código Pix para concluir o pagamento do pedido.
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            "& > :not(style) ~ :not(style)": { ml: { xs: 0, sm: 1 } },
          }}
        >
          <Button
            onClick={() => setIsConfirmDialogOpen(false)}
            disabled={isCheckoutLoading}
            color="inherit"
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={isCheckoutLoading || !isCustomerEmailValid}
            fullWidth
            onClick={async () => {
              setIsConfirmDialogOpen(false);
              await submitPixPayment();
            }}
          >
            Gerar Pix
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
