import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Users, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, profile, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Synchronize form fields whenever modal opens or user/profile changes
  useEffect(() => {
    if (isOpen && user) {
      const userMeta = (user.user_metadata || {}) as Record<string, any>;
      const existingFullName = profile?.full_name || userMeta["full_name"] || userMeta["name"] || "";
      const nameParts = existingFullName.trim().split(" ");
      
      const defaultFirst = profile?.first_name || userMeta["first_name"] || nameParts[0] || "";
      const defaultLast = profile?.last_name || userMeta["last_name"] || nameParts.slice(1).join(" ") || "";

      setFirstName(defaultFirst);
      setLastName(defaultLast);
      setEmail(user.email || "");
      setPhone(profile?.phone || userMeta["phone"] || "");
      setDateOfBirth(profile?.date_of_birth || userMeta["date_of_birth"] || "");
      setGender(profile?.gender || userMeta["gender"] || "");
      setErrors({});
    }
  }, [isOpen, user, profile]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (phone.trim()) {
      const phoneClean = phone.replace(/[\s\-\(\)\+]/g, "");
      if (!/^\d{7,15}$/.test(phoneClean)) {
        newErrors.phone = "Please enter a valid phone number (7-15 digits)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile({
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update profile. Please try again.");
      } else {
        toast.success("Profile updated successfully!");
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "User";
  const currentInitial = (displayName.charAt(0) || "U").toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-lg w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4 shrink-0 pr-14">
          <div>
            <DialogTitle className="font-display text-xl font-black text-foreground">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Update your personal account details below.
            </DialogDescription>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Initials-Based Avatar Badge Header */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/60">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-primary font-display text-lg font-bold text-primary-foreground flex items-center justify-center border border-border shadow-sm">
              {currentInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {email || user?.email || "No email available"}
              </p>
            </div>
          </div>

          {/* 1. First Name & 2. Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="firstName" className="block text-xs font-bold text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="firstName"
                  type="text"
                  required
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) {
                      setErrors(({ firstName: _, ...rest }) => rest);
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.firstName ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="lastName" className="block text-xs font-bold text-foreground">
                Last Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="lastName"
                  type="text"
                  required
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) {
                      setErrors(({ lastName: _, ...rest }) => rest);
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                    errors.lastName ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] font-medium text-destructive mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* 3. Email (Read-Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="email" className="block text-xs font-bold text-foreground">
                Email Address
              </label>
              <span className="text-[10px] text-muted-foreground font-medium">Read-Only</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                readOnly
                value={email}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input text-sm bg-muted/50 text-muted-foreground cursor-not-allowed outline-none select-all"
              />
            </div>
          </div>

          {/* 4. Phone Number */}
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-xs font-bold text-foreground">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) {
                    setErrors(({ phone: _, ...rest }) => rest);
                  }
                }}
                disabled={isSubmitting}
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                  errors.phone ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-medium text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 5. Date of Birth & 6. Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="dateOfBirth" className="block text-xs font-bold text-foreground">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="gender" className="block text-xs font-bold text-foreground">
                Gender
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input text-sm bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
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
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
