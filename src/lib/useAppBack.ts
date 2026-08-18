import { useRouter } from "@tanstack/react-router";

export function useAppBack() {
  const router = useRouter();

  return (fallback: string = "/") => {
    // TanStack router adds a unique key to its history states.
    // We can use this to check if there is an in-app history to go back to.
    const hasInAppHistory = window.history.state && window.history.state.__TSR_key;
    
    if (hasInAppHistory || window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: fallback });
    }
  };
}
