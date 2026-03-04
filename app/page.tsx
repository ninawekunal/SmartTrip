import { ConnectionStatus } from "@/app/components/connection-status";

export default function HomePage() {
  return (
    <main className="container">
      <h1>SmartTrip MVP</h1>
      <p>Build and manage a walking trip with ordered stops and export it.</p>
      <ul>
        <li>Create a trip</li>
        <li>Add, edit, and reorder stops</li>
        <li>Compute walking route distance/time</li>
        <li>Export ordered route to Google Maps</li>
      </ul>
      <ConnectionStatus />
    </main>
  );
}
