import { useNavigate } from "react-router-dom";

export function useAppBack() {
  const navigate = useNavigate();

  return (fallback: string = "/") => {
    // TanStack router adds a unique key to its history states.
    // We can use this to check if there is an in-app history to go back to.
    const hasInAppHistory = window.history.state && window.history.state.__TSR_key;
    
    if (hasInAppHistory || window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
