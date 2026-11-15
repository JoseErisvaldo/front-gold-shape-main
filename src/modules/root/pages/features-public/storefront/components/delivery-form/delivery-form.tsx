import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { formatPhoneNumber } from "../../../../../../../shared/utils";
import type { CustomerAddress } from "../../schema/customer-address-schema";
import type { DeliveryInfo } from "../../types/storefront.types";

type DeliveryFormProps = {
  addresses: CustomerAddress[];
  delivery: DeliveryInfo;
  isAddressListLoading: boolean;
  isAddressListError: boolean;
  isEditingAddress: boolean;
  isSavingAddress: boolean;
  isDeletingAddress: boolean;
  isSearchingCep: boolean;
  cepNotFound: boolean;
  customerName: string;
  customerWhatsapp: string;
  onCustomerWhatsappChange: (value: string) => void;
  onAddressSelect: (id: string) => void;
  onNewAddress: () => void;
  onEditAddress: () => void;
  onCancelAddressEdit: () => void;
  onSaveAddress: () => Promise<void>;
  onDeleteAddress: () => Promise<void>;
  onChange: (patch: Partial<DeliveryInfo>) => void;
  onCepChange: (cep: string) => void;
};

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#FFFFFF" },
};

export function DeliveryForm({
  addresses,
  delivery,
  isAddressListLoading,
  isAddressListError,
  isEditingAddress,
  isSavingAddress,
  isDeletingAddress,
  isSearchingCep,
  cepNotFound,
  customerName,
  customerWhatsapp,
  onCustomerWhatsappChange,
  onAddressSelect,
  onNewAddress,
  onEditAddress,
  onCancelAddressEdit,
  onSaveAddress,
  onDeleteAddress,
  onChange,
  onCepChange,
}: DeliveryFormProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const handleSave = () => void onSaveAddress().catch(() => undefined);
  const handleDelete = async () => {
    try {
      await onDeleteAddress();
      setIsDeleteDialogOpen(false);
    } catch {
      return;
    }
  };

  const addressIsComplete =
    delivery.label.trim() !== "" &&
    delivery.cep.replace(/\D/g, "").length === 8 &&
    delivery.street.trim() !== "" &&
    delivery.number.trim() !== "" &&
    delivery.neighborhood.trim() !== "" &&
    delivery.city.trim() !== "" &&
    delivery.state.trim().length === 2;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Typography sx={{ color: "#292D45", fontSize: 15, fontWeight: 700 }}>Seus dados</Typography>
        <TextField
          label="Nome"
          value={customerName}
          disabled
          sx={fieldSx}
          helperText="Nome e e-mail vinculados à sua conta."
        />
        <TextField
          required
          label="WhatsApp"
          type="tel"
          autoComplete="tel"
          value={customerWhatsapp}
          onChange={(event) => onCustomerWhatsappChange(formatPhoneNumber(event.target.value))}
          sx={fieldSx}
          slotProps={{ htmlInput: { inputMode: "tel" } }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LocalShippingRoundedIcon sx={{ color: "#16A34A" }} fontSize="small" />
        <Typography sx={{ color: "#292D45", fontSize: 15, fontWeight: 700 }}>Entrega</Typography>
      </Box>

      <Alert severity="success" sx={{ borderRadius: "10px" }}>
        Frete grátis por enquanto.
      </Alert>

      {isAddressListError && (
        <Alert severity="error">
          Não foi possível carregar seus endereços. Atualize a página e tente novamente.
        </Alert>
      )}

      {isAddressListLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        addresses.length > 0 && (
          <TextField
            select
            required
            label="Endereço salvo"
            value={delivery.addressId ?? ""}
            onChange={(event) => onAddressSelect(event.target.value)}
            sx={fieldSx}
          >
            {addresses.map((address) => (
              <MenuItem key={address.id} value={address.id}>
                {address.label} — {address.street}, {address.number}, {address.city}
              </MenuItem>
            ))}
          </TextField>
        )
      )}

      {isEditingAddress ? (
        <Stack spacing={2}>
          <Typography sx={{ color: "#292D45", fontSize: 14, fontWeight: 700 }}>
            {delivery.addressId ? "Editar endereço" : "Novo endereço"}
          </Typography>
          <TextField
            required
            label="Nome do endereço"
            placeholder="Casa, trabalho..."
            value={delivery.label}
            onChange={(event) => onChange({ label: event.target.value })}
            sx={fieldSx}
          />
          <TextField
            required
            label="CEP"
            placeholder="00000-000"
            value={delivery.cep}
            onChange={(event) => onCepChange(event.target.value)}
            error={delivery.cep !== "" && delivery.cep.replace(/\D/g, "").length !== 8}
            helperText={
              delivery.cep !== "" && delivery.cep.replace(/\D/g, "").length !== 8
                ? "Informe um CEP com 8 números."
                : "O CEP pode preencher automaticamente os dados do endereço."
            }
            sx={fieldSx}
            slotProps={{
              htmlInput: { inputMode: "numeric", maxLength: 9, required: true },
              input: {
                endAdornment: isSearchingCep ? <CircularProgress size={16} /> : undefined,
              },
            }}
          />

          {cepNotFound && (
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              CEP não localizado. Preencha o endereço manualmente.
            </Alert>
          )}

          <TextField
            required
            label="Rua / avenida"
            value={delivery.street}
            onChange={(event) => onChange({ street: event.target.value })}
            sx={fieldSx}
          />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 2fr" }}>
            <TextField
              required
              label="Número"
              value={delivery.number}
              onChange={(event) => onChange({ number: event.target.value })}
              sx={fieldSx}
            />
            <TextField
              label="Complemento"
              value={delivery.complement}
              onChange={(event) => onChange({ complement: event.target.value })}
              sx={fieldSx}
            />
          </Box>
          <TextField
            required
            label="Bairro"
            value={delivery.neighborhood}
            onChange={(event) => onChange({ neighborhood: event.target.value })}
            sx={fieldSx}
          />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "2fr 1fr" }}>
            <TextField
              required
              label="Cidade"
              value={delivery.city}
              onChange={(event) => onChange({ city: event.target.value })}
              sx={fieldSx}
            />
            <TextField
              required
              label="UF"
              value={delivery.state}
              onChange={(event) =>
                onChange({ state: event.target.value.toUpperCase().slice(0, 2) })
              }
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!addressIsComplete || isSearchingCep || isSavingAddress}
              sx={{ textTransform: "none" }}
            >
              {isSavingAddress ? "Salvando..." : "Salvar endereço"}
            </Button>
            {delivery.addressId && (
              <Button
                onClick={onCancelAddressEdit}
                disabled={isSavingAddress}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {delivery.addressId && (
            <Box
              sx={{
                display: "grid",
                gap: 0.25,
                p: 1.75,
                border: "1px solid #DFE2EC",
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography sx={{ color: "#292D45", fontSize: 14, fontWeight: 700 }}>
                {delivery.label}
              </Typography>
              <Typography sx={{ color: "#5A5F73", fontSize: 13 }}>
                {delivery.street}, {delivery.number}
                {delivery.complement ? ` — ${delivery.complement}` : ""}
              </Typography>
              <Typography sx={{ color: "#5A5F73", fontSize: 13 }}>
                {delivery.neighborhood} — {delivery.city}/{delivery.state}
              </Typography>
              <Typography sx={{ color: "#858A9D", fontSize: 12 }}>CEP: {delivery.cep}</Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {delivery.addressId && (
              <>
                <Button onClick={onEditAddress} sx={{ textTransform: "none" }}>
                  Editar endereço
                </Button>
                <Button
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeletingAddress}
                  sx={{ textTransform: "none" }}
                >
                  Excluir
                </Button>
              </>
            )}
            <Button onClick={onNewAddress} sx={{ textTransform: "none" }}>
              Cadastrar outro endereço
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Excluir endereço?</DialogTitle>
        <DialogContent>
          <Typography>
            O endereço será removido da sua lista. Pedidos anteriores continuarão com os dados
            registrados no momento da compra.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => void handleDelete()}
            disabled={isDeletingAddress}
            sx={{ textTransform: "none" }}
          >
            Excluir endereço
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
