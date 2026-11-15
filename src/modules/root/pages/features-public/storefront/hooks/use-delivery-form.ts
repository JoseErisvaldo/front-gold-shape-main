import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomerAddress } from "../schema/customer-address-schema";
import { fetchCep, formatCep } from "../services/fetch-cep";
import type { DeliveryInfo } from "../types/storefront.types";

const EMPTY: DeliveryInfo = {
  addressId: null,
  isSaved: false,
  label: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function toDeliveryInfo(address: CustomerAddress): DeliveryInfo {
  return {
    addressId: address.id,
    isSaved: true,
    label: address.label,
    cep: address.cep,
    street: address.street,
    number: address.number,
    complement: address.complement ?? "",
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  };
}

export function useDeliveryForm(addresses: CustomerAddress[], isAddressListLoading: boolean) {
  const [delivery, setDelivery] = useState<DeliveryInfo>(EMPTY);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const cepLookupId = useRef(0);

  const selectAddress = useCallback((address: CustomerAddress | null) => {
    setDelivery(address ? toDeliveryInfo(address) : EMPTY);
    setIsEditingAddress(false);
    setCepNotFound(false);
  }, []);

  useEffect(() => {
    if (isEditingAddress || isAddressListLoading) return;
    const selected = addresses.find((address) => address.id === delivery.addressId);
    if (selected && delivery.isSaved) return;
    if (addresses.length > 0) {
      selectAddress(addresses[0]);
    } else {
      setDelivery(EMPTY);
      setIsEditingAddress(true);
    }
  }, [
    addresses,
    delivery.addressId,
    delivery.isSaved,
    isAddressListLoading,
    isEditingAddress,
    selectAddress,
  ]);

  const update = (patch: Partial<DeliveryInfo>) =>
    setDelivery((current) => ({ ...current, ...patch, isSaved: false }));

  const startNewAddress = () => {
    setDelivery(EMPTY);
    setIsEditingAddress(true);
    setCepNotFound(false);
  };

  const editAddress = () => setIsEditingAddress(true);

  const cancelAddressEdit = () => {
    const saved = addresses.find((address) => address.id === delivery.addressId);
    if (saved) {
      selectAddress(saved);
    } else if (addresses.length > 0) {
      selectAddress(addresses[0]);
    } else {
      startNewAddress();
    }
  };

  const saveAddress = (address: CustomerAddress) => selectAddress(address);

  const removeSelectedAddress = (nextAddress: CustomerAddress | null) => {
    selectAddress(nextAddress);
    if (!nextAddress) setIsEditingAddress(true);
  };

  const changeCep = async (value: string) => {
    const cep = formatCep(value);
    const lookupId = ++cepLookupId.current;
    update({ cep });
    setCepNotFound(false);
    if (cep.length !== 9) {
      setIsSearchingCep(false);
      return;
    }

    setIsSearchingCep(true);
    try {
      const found = await fetchCep(cep);
      if (lookupId !== cepLookupId.current) return;
      if (!found) {
        setCepNotFound(true);
        return;
      }

      update({
        street: found.street,
        neighborhood: found.neighborhood,
        city: found.city,
        state: found.state,
      });
    } catch {
      if (lookupId === cepLookupId.current) setCepNotFound(true);
    } finally {
      if (lookupId === cepLookupId.current) setIsSearchingCep(false);
    }
  };

  const isValid =
    Boolean(delivery.addressId) &&
    delivery.isSaved &&
    delivery.cep.replace(/\D/g, "").length === 8 &&
    delivery.street.trim() !== "" &&
    delivery.number.trim() !== "" &&
    delivery.neighborhood.trim() !== "" &&
    delivery.city.trim() !== "" &&
    delivery.state.trim().length === 2;

  return {
    delivery,
    update,
    selectAddress,
    startNewAddress,
    editAddress,
    cancelAddressEdit,
    saveAddress,
    removeSelectedAddress,
    changeCep,
    isEditingAddress,
    isSearchingCep,
    cepNotFound,
    isValid,
  };
}
