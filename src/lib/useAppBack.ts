import { useNavigate } from "react-router-dom";

export function useAppBack() {
  const navigate = useNavigate();

  return (fallback: string = "/") => {
    // In an SPA, filtering and toggling tabs adds history states.
    // Instead of using navigate(-1) which can trap users in a query string loop,
    // we route them to the logical fallback route to ensure they always escape.
    navigate(fallback);
  };
}
