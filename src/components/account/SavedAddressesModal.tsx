import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  X,
  Plus,
  MapPin,
  Home,
  CheckCircle2,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserAddress,
  fetchUserAddresses,
  setDefaultUserAddress,
  deleteUserAddress,
} from "@/lib/address-store";
import { AddressFormModal } from "./AddressFormModal";

interface SavedAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAddressesChange?: () => void;
}

export function SavedAddressesModal({
  isOpen,
  onClose,
  userId,
  onAddressesChange,
}: SavedAddressesModalProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State for Address Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // State for Delete Confirmation Modal
  const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // State for Setting Default loader
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await fetchUserAddresses(userId);
      setAddresses(data || []);
    } catch (err) {
      console.error("[SavedAddressesModal] Error loading addresses:", err);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      loadAddresses();
    }
  }, [isOpen, userId, loadAddresses]);

  const handleSetDefault = async (addr: UserAddress) => {
    if (addr.is_default || settingDefaultId) return;

    setSettingDefaultId(addr.id);
    try {
      const { error } = await setDefaultUserAddress(addr.id, userId);
      if (error) {
        toast.error(error.message || "Failed to set default address");
      } else {
        toast.success("Default address updated!");
        await loadAddresses();
        if (onAddressesChange) onAddressesChange();
      }
    } catch (err: any) {
      toast.error(err?.message || "Error updating default address");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddress || isDeleting) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteUserAddress(deletingAddress.id, userId);
      if (error) {
        toast.error(error.message || "Failed to delete address");
      } else {
        toast.success("Address deleted successfully");
        setDeletingAddress(null);
        await loadAddresses();
        if (onAddressesChange) onAddressesChange();
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting address");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    await loadAddresses();
    if (onAddressesChange) onAddressesChange();
  };

  const handleOpenAddForm = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (addr: UserAddress) => {
    setEditingAddress(addr);
    setIsFormOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl max-h-[85vh] flex flex-col">
          
          {/* Main Modal Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4 shrink-0 pr-14">
            <div>
              <DialogTitle className="font-display text-xl font-black text-foreground flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Saved Addresses
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Manage your delivery locations and default shipping address.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft cursor-pointer mr-2"
              >
                <Plus className="size-4" /> Add New Address
              </button>
            </div>
          </div>

          {/* Mobile Add New Address Button */}
          <div className="px-6 pt-4 sm:hidden">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex w-full items-center justify-center gap-2 h-10 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft cursor-pointer"
            >
              <Plus className="size-4" /> Add New Address
            </button>
          </div>

          {/* Modal Body / Address Cards List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="mt-3 text-xs text-muted-foreground font-medium">Loading saved addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border border-dashed border-border bg-muted/20 p-8">
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <MapPin className="size-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">No Saved Addresses</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  You haven't saved any delivery addresses yet. Add a new address to streamline your checkout.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="mt-5 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft cursor-pointer"
                >
                  <Plus className="size-4" /> Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {addresses.map((addr) => {
                  const isSettingThisDefault = settingDefaultId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      className={`relative rounded-3xl border p-6 transition-all ${
                        addr.is_default
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border bg-background hover:border-border/80"
                      }`}
                    >
                      {/* Card Top Row: Address Icon & DEFAULT badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Home className="size-5" />
                        </div>

                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground font-display text-xs font-black tracking-wider uppercase shadow-xs">
                            <CheckCircle2 className="size-3.5" /> DEFAULT
                          </span>
                        )}
                      </div>

                      {/* Recipient Full Name & Phone */}
                      <h4 className="font-display text-base font-black text-foreground">
                        {addr.full_name}
                      </h4>
                      <p className="text-xs font-bold text-muted-foreground mt-0.5 mb-3">
                        {addr.phone}
                      </p>

                      {/* Multi-line Address Details */}
                      <div className="space-y-0.5 text-xs text-foreground/90 leading-relaxed font-medium">
                        <p>{addr.address_line1}</p>
                        <p>
                          {addr.address_line2}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""}
                        </p>
                        <p className="font-semibold text-foreground mt-1">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-muted-foreground">{addr.country}</p>
                      </div>

                      {/* Card Action Buttons Row: [Edit] [Delete] [Set as Default] */}
                      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(addr)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3.5 text-primary" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAddress(addr)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>

                        {!addr.is_default && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr)}
                            disabled={isSettingThisDefault}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isSettingThisDefault ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Star className="size-3.5" />
                            )}
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Address Modal */}
      <AddressFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        addressToEdit={editingAddress}
        onSuccess={handleFormSuccess}
        userId={userId}
      />

      {/* Delete Confirmation Dialog */}
      {deletingAddress && (
        <Dialog open={!!deletingAddress} onOpenChange={(open) => !isDeleting && !open && setDeletingAddress(null)}>
          <DialogContent className="max-w-md w-full rounded-3xl p-6 border border-border bg-background shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Delete Saved Address?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to delete the address for <strong className="text-foreground">{deletingAddress.full_name}</strong>? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeletingAddress(null)}
                disabled={isDeleting}
                className="h-9 px-4 rounded-full border border-border text-xs font-bold hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="h-9 px-5 rounded-full bg-destructive text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" /> Delete Address
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
