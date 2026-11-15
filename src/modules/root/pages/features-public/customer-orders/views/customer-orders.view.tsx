import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Box, Button, Pagination, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorefrontLayout } from "../../storefront/components/storefront-layout/storefront-layout";
import { CustomerOrderCard } from "../components/customer-order-card/customer-order-card";
import { useCustomerOrdersQuery } from "../queries/use-customer-orders-query";
import { CUSTOMER_ORDERS_PAGE_SIZE } from "../services/list-customer-orders.service";

function CustomerOrdersContent() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching, refetch } = useCustomerOrdersQuery(page);
  const totalPages = Math.ceil((data?.total ?? 0) / CUSTOMER_ORDERS_PAGE_SIZE);

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "#292D45", fontWeight: 800 }}>
            Meus pedidos
          </Typography>
          <Typography sx={{ color: "#6B7082", mt: 0.5 }}>
            Acompanhe seus pedidos e pagamentos.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void refetch()}
          disabled={isFetching}
          sx={{ textTransform: "none" }}
        >
          {isFetching ? "Atualizando…" : "Atualizar"}
        </Button>
      </Box>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar seus pedidos.
        </Alert>
      )}

      {isPending ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={100} />
        </Stack>
      ) : data?.total === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            border: "1px solid #DFE2EC",
            borderRadius: "16px",
          }}
        >
          <Typography variant="h6" sx={{ color: "#292D45", fontWeight: 700 }}>
            Você ainda não tem pedidos
          </Typography>
          <Typography sx={{ mt: 1, color: "#6B7082" }}>
            Seus pedidos aparecerão aqui depois que você finalizar uma compra.
          </Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={1.5}>
            {data?.orders.map((order) => (
              <CustomerOrderCard key={order.id} order={order} />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Pagination
              aria-label="Paginação dos meus pedidos"
              count={totalPages}
              page={page}
              onChange={(_, nextPage) => setPage(nextPage)}
              disabled={isFetching}
              sx={{ display: "flex", justifyContent: "center", py: 1 }}
            />
          )}
        </>
      )}
    </Stack>
  );
}

export function CustomerOrdersView() {
  const navigate = useNavigate();

  return (
    <StorefrontLayout
      onHomeClick={() => void navigate("/")}
      onStoreClick={() => void navigate("/loja")}
    >
      <CustomerOrdersContent />
    </StorefrontLayout>
  );
}
