import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { X, User, Mail, Phone, Image as ImageIcon, Loader2, Save } from "lucide-react";
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
  fullName?: string;
  email?: string;
  phone?: string;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Synchronize form fields whenever modal opens or user/profile changes
  useEffect(() => {
    if (isOpen && user) {
      const userMeta = (user.user_metadata || {}) as Record<string, any>;
      setFullName(profile?.full_name || userMeta["full_name"] || userMeta["name"] || "");
      setEmail(user.email || "");
      setPhone(profile?.phone || userMeta["phone"] || "");
      setAvatarUrl(profile?.avatar_url || userMeta["avatar_url"] || userMeta["picture"] || "");
      setErrors({});
    }
  }, [isOpen, user, profile]);

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
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
        fullName,
        email,
        phone,
        avatarUrl,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update profile. Please try again.");
      } else {
        if (result.emailUpdateSent) {
          toast.success("Profile updated! Verification email sent to your new address.", {
            description: "Please check your inbox to confirm the email address change.",
            duration: 6000,
          });
        } else {
          toast.success("Profile updated successfully!");
        }
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInitial = (fullName.trim().charAt(0) || email.trim().charAt(0) || "U").toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-md w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div>
            <DialogTitle className="font-display text-xl font-black text-foreground">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Update your personal account details below.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="grid size-8 place-items-center rounded-full border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/60">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-primary font-display text-xl font-bold text-primary-foreground flex items-center justify-center border border-border">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                currentInitial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="avatarUrl" className="block text-xs font-bold text-foreground mb-1">
                Profile Picture URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-xs font-bold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors(({ fullName: _, ...rest }) => rest);
                  }
                }}
                disabled={isSubmitting}
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                  errors.fullName ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] font-medium text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-bold text-foreground">
              Email Address <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(({ email: _, ...rest }) => rest);
                  }
                }}
                disabled={isSubmitting}
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm bg-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                  errors.email ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
            </div>
            {errors.email ? (
              <p className="text-[11px] font-medium text-destructive mt-1">{errors.email}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-1">
                Changing your email requires clicking a verification link sent to your new inbox.
              </p>
            )}
          </div>

          {/* Phone Number */}
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
