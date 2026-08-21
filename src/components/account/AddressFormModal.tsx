import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, User, Phone, MapPin, Building, Home, Globe, Hash, Compass, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserAddress,
  AddressInput,
  addUserAddress,
  updateUserAddress,
} from "@/lib/address-store";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: UserAddress | null;
  onSuccess: () => void;
  userId: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export function AddressFormModal({
  isOpen,
  onClose,
  addressToEdit,
  onSuccess,
  userId,
}: AddressFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset or pre-fill form fields when modal opens or addressToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        setFullName(addressToEdit.full_name || "");
        setPhone(addressToEdit.phone || "");
        setAddressLine1(addressToEdit.address_line1 || "");
        setAddressLine2(addressToEdit.address_line2 || "");
        setLandmark(addressToEdit.landmark || "");
        setCity(addressToEdit.city || "");
        setState(addressToEdit.state || "");
        setPincode(addressToEdit.pincode || "");
        setCountry(addressToEdit.country || "India");
        setIsDefault(addressToEdit.is_default || false);
      } else {
        setFullName("");
        setPhone("");
        setAddressLine1("");
        setAddressLine2("");
        setLandmark("");
        setCity("");
        setState("");
        setPincode("");
        setCountry("India");
        setIsDefault(false);
      }
      setErrors({});
    }
  }, [isOpen, addressToEdit]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) newErrors.full_name = "Full name is required";

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
      if (!/^\d{7,15}$/.test(cleanPhone)) {
        newErrors.phone = "Please enter a valid phone number (7-15 digits)";
      }
    }

    if (!addressLine1.trim()) newErrors.address_line1 = "House/Flat/Building is required";
    if (!addressLine2.trim()) newErrors.address_line2 = "Street/Area is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{4,10}$/.test(pincode.trim())) {
      newErrors.pincode = "Enter a valid pincode";
    }
    if (!country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: AddressInput = {
      full_name: fullName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      landmark: landmark || null,
      city,
      state,
      pincode,
      country,
      is_default: isDefault,
    };

    try {
      if (addressToEdit) {
        const { error } = await updateUserAddress(addressToEdit.id, userId, payload);
        if (error) {
          toast.error(error.message || "Failed to update address");
        } else {
          toast.success("Address updated successfully!");
          onSuccess();
          onClose();
        }
      } else {
        const { error } = await addUserAddress(userId, payload);
        if (error) {
          toast.error(error.message || "Failed to save address");
        } else {
          toast.success("New address saved successfully!");
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-lg w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4 shrink-0 pr-14">
          <div>
            <DialogTitle className="font-display text-xl font-black text-foreground">
              {addressToEdit ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {addressToEdit
                ? "Update your existing delivery address details."
                : "Fill in the details below to add a new delivery location."}
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="addr_fullName" className="block text-xs font-bold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_fullName"
                  type="text"
                  required
                  placeholder="Recipient's name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.full_name) setErrors(({ full_name: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.full_name ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.full_name && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="addr_phone" className="block text-xs font-bold text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(({ phone: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.phone ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* House / Flat / Building */}
          <div className="space-y-1">
            <label htmlFor="addr_line1" className="block text-xs font-bold text-foreground">
              Flat, House No., Building, Company <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="addr_line1"
                type="text"
                required
                placeholder="e.g. Flat 4B, Sunshine Apartments"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  if (errors.address_line1) setErrors(({ address_line1: _, ...r }) => r);
                }}
                disabled={isSubmitting}
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                  errors.address_line1 ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
            </div>
            {errors.address_line1 && (
              <p className="text-[11px] font-medium text-destructive mt-1">{errors.address_line1}</p>
            )}
          </div>

          {/* Street / Area */}
          <div className="space-y-1">
            <label htmlFor="addr_line2" className="block text-xs font-bold text-foreground">
              Area, Street, Sector, Village <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="addr_line2"
                type="text"
                required
                placeholder="e.g. MG Road, Sector 15"
                value={addressLine2}
                onChange={(e) => {
                  setAddressLine2(e.target.value);
                  if (errors.address_line2) setErrors(({ address_line2: _, ...r }) => r);
                }}
                disabled={isSubmitting}
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                  errors.address_line2 ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
            </div>
            {errors.address_line2 && (
              <p className="text-[11px] font-medium text-destructive mt-1">{errors.address_line2}</p>
            )}
          </div>

          {/* Landmark (Optional) */}
          <div className="space-y-1">
            <label htmlFor="addr_landmark" className="block text-xs font-bold text-foreground">
              Landmark <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Compass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="addr_landmark"
                type="text"
                placeholder="e.g. Near Metro Station / Behind City Mall"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="addr_city" className="block text-xs font-bold text-foreground">
                Town / City <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_city"
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors(({ city: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.city ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.city && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.city}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="addr_state" className="block text-xs font-bold text-foreground">
                State <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_state"
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors(({ state: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.state ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.state && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Pincode & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="addr_pincode" className="block text-xs font-bold text-foreground">
                Pincode <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_pincode"
                  type="text"
                  required
                  placeholder="e.g. 400001"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    if (errors.pincode) setErrors(({ pincode: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.pincode ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.pincode && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.pincode}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="addr_country" className="block text-xs font-bold text-foreground">
                Country <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="addr_country"
                  type="text"
                  required
                  placeholder="India"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (errors.country) setErrors(({ country: _, ...r }) => r);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.country ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.country && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={isSubmitting}
                className="size-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50 accent-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-foreground">
                Set as Default Delivery Address
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-full border border-border text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {addressToEdit ? "Update Address" : "Save Address"}
                </>
              )}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
