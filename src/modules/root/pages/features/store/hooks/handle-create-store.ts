import { useState } from "react";
import { useCreateStoreMutation } from "../mutations/use-create-store-mutation";

export function useCreateStore() {
  const createStoreMutation = useCreateStoreMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeWhatsapp, setStoreWhatsapp] = useState("");
  const [storeImageUrl, setStoreImageUrl] = useState("");

  async function handleCreateStore(): Promise<void> {
    const name = storeName.trim();
    const slug = storeSlug.trim();
    const whatsapp = storeWhatsapp.trim();

    if (!name || !slug || !whatsapp || createStoreMutation.isPending) {
      return;
    }

    try {
      await createStoreMutation.mutateAsync({
        name,
        slug,
        whatsapp,
        imageUrl: storeImageUrl.trim() || null,
      });

      setStoreName("");
      setStoreSlug("");
      setStoreWhatsapp("");
      setStoreImageUrl("");
      setIsCreateDialogOpen(false);
    } catch {
      return;
    }
  }

  function handleCloseCreateDialog(): void {
    setIsCreateDialogOpen(false);
  }

  function handleOpenCreateDialog(): void {
    setIsCreateDialogOpen(true);
  }

  return {
    isCreateDialogOpen,
    storeName,
    storeSlug,
    storeWhatsapp,
    storeImageUrl,
    createStoreError: createStoreMutation.error?.message ?? null,
    isCreatingStore: createStoreMutation.isPending,
    setStoreName,
    setStoreSlug,
    setStoreWhatsapp,
    setStoreImageUrl,
    handleCreateStore,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
  };
}
