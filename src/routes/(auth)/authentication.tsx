import { createFileRoute } from "@tanstack/react-router";
import AuthenticationPage from "#/modules/authentication/authentication-page";

export const Route = createFileRoute("/(auth)/authentication")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthenticationPage />;
}
