"use client";

import { useState } from "react";
import { WorkerVerificationWizard, type WorkerForWizard } from "@/components/admin/worker-verification-wizard";

const mockWorker: WorkerForWizard = {
  id: "mock-worker-id",
  name: "ياسر عبد المجيد",
  phone: "+201099881104",
  email: "yaser@example.com",
  avatarUrl: null,
  profession: "carpenter",
  specialty: "carpenter",
  status: "PENDING",
  nationalIdFront: "https://placehold.co/400x260/222/eab308?text=ID+Front",
  nationalIdBack: "https://placehold.co/400x260/222/eab308?text=ID+Back",
  selfieWithId: "https://placehold.co/400x400/222/eab308?text=Selfie",
  criminalRecord: "https://placehold.co/400x260/222/eab308?text=Criminal+Record",
  utilityBillUrl: "https://placehold.co/400x260/222/eab308?text=Utility+Bill",
  stepVerifications: {}
};

export default function WizardPreviewPage() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="min-h-screen bg-onyx-950 flex items-center justify-center">
      {!isOpen && (
        <button className="text-white" onClick={() => setIsOpen(true)}>Reopen</button>
      )}
      <WorkerVerificationWizard
        locale="ar"
        worker={mockWorker}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
