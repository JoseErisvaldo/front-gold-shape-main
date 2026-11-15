import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../../../../../shared/store";
import { handleApiError } from "../../../../../../shared/utils";
import { customerOrdersQueryKeys } from "../../customer-orders/endpoints-keys/customer-orders.keys";
import { storefrontQueryKeys } from "../endpoints-keys/storefront.keys";
import { trackEvent, trackPageview } from "../helpers/storefront-analytics";
import type { CustomerAddressInput } from "../schema/customer-address-schema";
import {
  type CheckoutPayment,
  type CheckoutResponse,
  createCheckoutService,
} from "../services/create-checkout.service";
import { getCartPricesService } from "../services/get-cart-prices.service";
import { useCartStore } from "../store/cart.store";
import { useCartSummary } from "./use-cart-summary";
import { useCustomerAddresses } from "./use-customer-addresses";
import { useDeliveryForm } from "./use-delivery-form";

export type CartDrawerStep = "cart" | "delivery" | "review";

const STEP_PATHS: Record<CartDrawerStep, string> = {
  cart: "/carrinho",
  delivery: "/carrinho/entrega",
  review: "/carrinho/revisao",
};

export function useCartDrawer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const addressesQuery = useCustomerAddresses(Boolean(session));
  const { items, itemsCount, subtotal } = useCartSummary();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const updatePrices = useCartStore((state) => state.updatePrices);
  const clear = useCartStore((state) => state.clear);
  const isOpen = useCartStore((state) => state.isOpen);

  const [step, setStep] = useState<CartDrawerStep>("cart");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [priceRefreshError, setPriceRefreshError] = useState(false);
  const [pricesChanged, setPricesChanged] = useState(false);
  const [checkoutPriceChanged, setCheckoutPriceChanged] = useState(false);

  const deliveryForm = useDeliveryForm(addressesQuery.addresses, addressesQuery.isLoading);
  const { delivery, isValid: isDeliveryValid } = deliveryForm;

  useEffect(() => {
    if (
      isOpen &&
      session &&
      sessionStorage.getItem("goldshape-storefront-checkout-step") === "delivery"
    ) {
      sessionStorage.removeItem("goldshape-storefront-checkout-step");
      setStep("delivery");
    }
  }, [isOpen, session]);

  const originalSubtotal = items.reduce(
    (sum, item) => sum + Math.max(item.originalPrice, item.unitPrice) * item.quantity,
    0,
  );

  const discount = Math.max(0, originalSubtotal - subtotal);

  const isFeeToAgree = false;
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const productNames = useMemo(
    () =>
      items.map((item) =>
        item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName,
      ),
    [items],
  );

  const hasItems = items.length > 0;
  const shouldTrackStep = isOpen && hasItems;

  useEffect(() => {
    if (!shouldTrackStep) return;

    trackPageview(STEP_PATHS[step]);
  }, [shouldTrackStep, step]);

  useEffect(() => {
    if (!shouldTrackStep) return;

    trackEvent("cart_step_viewed", {
      step,
      items_count: itemsCount,
      products: productNames,
    });
  }, [shouldTrackStep, step, itemsCount, productNames]);

  const goToCart = () => setStep("cart");

  const goToDelivery = () => {
    if (items.length === 0) return;
    if (!session) {
      sessionStorage.setItem("goldshape-storefront-checkout-step", "delivery");
      toast.info("Entre ou crie uma conta para continuar com o pedido.");
      void navigate("/session?continue=checkout");
      return;
    }
    setStep("delivery");
  };

  const refreshCartPrices = useCallback(async (): Promise<{
    changed: boolean;
    unavailable: boolean;
  } | null> => {
    if (items.length === 0) return { changed: false, unavailable: false };
    setIsRefreshingPrices(true);
    setPriceRefreshError(false);
    try {
      const latest = await getCartPricesService(items);
      const freshById = new Map(latest.variants.map((variant) => [variant.id, variant]));
      const hasChanges =
        latest.unavailableVariantIds.length > 0 ||
        items.some((item) => {
          const fresh = freshById.get(item.variantId);
          if (!fresh) return true;
          const discount = fresh.discountPercentage ?? 0;
          const freshUnitPrice = Math.round(fresh.price * (1 - discount / 100) * 100) / 100;
          return (
            Math.round(item.originalPrice * 100) !== Math.round(fresh.price * 100) ||
            Math.round(item.unitPrice * 100) !== Math.round(freshUnitPrice * 100) ||
            (item.isAvailable !== undefined && item.isAvailable !== fresh.available)
          );
        });
      updatePrices(latest);
      setPricesChanged(hasChanges);
      return {
        changed: hasChanges,
        unavailable:
          latest.unavailableVariantIds.length > 0 ||
          latest.variants.some((variant) => !variant.available),
      };
    } catch {
      setPriceRefreshError(true);
      toast.error("Não foi possível atualizar os preços do carrinho.");
      return null;
    } finally {
      setIsRefreshingPrices(false);
    }
  }, [items, updatePrices]);

  const goToReview = () => {
    if (!isDeliveryValid) {
      toast.error("Selecione ou cadastre um endereço válido para continuar.");
      return;
    }

    setStep("review");
  };

  const goBack = () => {
    if (step !== "cart") {
      trackEvent("cart_back_clicked", { from_step: step });
    }

    setStep((current) => (current === "review" ? "delivery" : "cart"));
  };

  const handleClear = () => {
    trackEvent("cart_cleared", {
      items_count: itemsCount,
      subtotal,
      products: productNames,
    });

    clear();
  };

  const canContinue = items.length > 0 && !isRefreshingPrices && !priceRefreshError;
  const hasUnavailableItems = items.some((item) => item.isAvailable === false);
  const canReview =
    items.length > 0 &&
    isDeliveryValid &&
    !isRefreshingPrices &&
    !priceRefreshError &&
    !hasUnavailableItems;
  const canCheckout = canReview && !isCheckoutLoading && !isRefreshingPrices;

  const checkout = async (
    whatsapp: string,
    paymentMethodId: string,
    isPix: boolean,
    payment: CheckoutPayment,
  ): Promise<CheckoutResponse | null> => {
    if (!canReview) {
      toast.error("Selecione ou cadastre um endereço válido para continuar.");
      return null;
    }

    if (!delivery.addressId || !whatsapp.trim()) {
      toast.error("Confira seu WhatsApp e o endereço selecionado.");
      return null;
    }

    setIsCheckoutLoading(true);
    const refreshResult = await refreshCartPrices();
    if (!refreshResult) {
      setIsCheckoutLoading(false);
      return null;
    }
    if (refreshResult.changed || refreshResult.unavailable) {
      toast.info("Os valores ou a disponibilidade mudaram. Confira o pedido e confirme novamente.");
      setIsCheckoutLoading(false);
      return null;
    }

    try {
      const order = await createCheckoutService(
        items,
        delivery,
        whatsapp,
        paymentMethodId,
        payment,
        isPix,
      );
      await queryClient.invalidateQueries({ queryKey: customerOrdersQueryKeys.all });
      setCheckoutPriceChanged(false);
      trackEvent("payment_checkout_created", {
        items_count: itemsCount,
        products: productNames,
        subtotal: isPix ? subtotal : originalSubtotal,
        discount: isPix ? discount : 0,
        delivery_fee: deliveryFee,
        total: isPix ? total : originalSubtotal + deliveryFee,
        delivery_address_id: delivery.addressId,
      });
      return order;
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 409 && apiError.message.includes("O preço de um produto mudou")) {
        setCheckoutPriceChanged(true);
        toast.error("O preço mudou. O pedido não foi registrado; revise o total atualizado.");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...storefrontQueryKeys.all, "products"],
          }),
          ...items.map((item) =>
            queryClient.invalidateQueries({
              queryKey: storefrontQueryKeys.product(item.productId),
            }),
          ),
        ]);
        await refreshCartPrices();
      } else {
        toast.error(apiError.message || "Não foi possível processar o pedido. Tente novamente.");
      }
      setIsCheckoutLoading(false);
      return null;
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const saveDeliveryAddress = async () => {
    const { addressId, isSaved: _isSaved, ...data } = delivery;
    const input: CustomerAddressInput = {
      ...data,
      state: data.state.toUpperCase(),
    };
    const address = addressId
      ? await addressesQuery.updateAddress({ id: addressId, ...input })
      : await addressesQuery.createAddress(input);
    deliveryForm.saveAddress(address);
  };

  const deleteDeliveryAddress = async () => {
    if (!delivery.addressId) return;
    const nextAddress =
      addressesQuery.addresses.find((address) => address.id !== delivery.addressId) ?? null;
    await addressesQuery.deleteAddress(delivery.addressId);
    deliveryForm.removeSelectedAddress(nextAddress);
  };

  return {
    step,
    goToCart,
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
    total,
    delivery,
    setQuantity,
    removeItem,
    clear: handleClear,
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
    deliveryForm: {
      delivery,
      addresses: addressesQuery.addresses,
      isAddressListLoading: addressesQuery.isLoading,
      isAddressListError: addressesQuery.isError,
      isEditingAddress: deliveryForm.isEditingAddress,
      isSavingAddress: addressesQuery.isSavingAddress,
      isDeletingAddress: addressesQuery.isDeletingAddress,
      isSearchingCep: deliveryForm.isSearchingCep,
      cepNotFound: deliveryForm.cepNotFound,
      onChange: deliveryForm.update,
      onAddressSelect: (addressId: string) => {
        const address = addressesQuery.addresses.find((item) => item.id === addressId);
        if (address) deliveryForm.selectAddress(address);
      },
      onNewAddress: deliveryForm.startNewAddress,
      onEditAddress: deliveryForm.editAddress,
      onCancelAddressEdit: deliveryForm.cancelAddressEdit,
      onSaveAddress: saveDeliveryAddress,
      onDeleteAddress: deleteDeliveryAddress,
      onCepChange: deliveryForm.changeCep,
    },
  };
}
