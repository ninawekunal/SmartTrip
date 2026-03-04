import { ConnectionStatus } from "@/app/components/connection-status";
import { PageShell } from "@/client/components/page-shell";

export function HomeView() {
  return (
    <PageShell
      title="SmartTrip MVP"
      description="Build and manage a walking trip with ordered stops and export it."
    >
      <ul>
        <li>Create a trip</li>
        <li>Add, edit, and reorder stops</li>
        <li>Compute walking route distance/time</li>
        <li>Export ordered route to Google Maps</li>
      </ul>
      <ConnectionStatus />
    </PageShell>
  );
}
