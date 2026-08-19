import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Account</h1>
      <button onClick={() => window.history.back()} style={{ marginTop: "1rem" }}>
        Back
      </button>
    </div>
  );
}
