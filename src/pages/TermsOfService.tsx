import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="elevation-2">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>By accessing and using this content distribution platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p>Permission is granted to temporarily use this platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to decompile or reverse engineer any software contained on the platform</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Content Responsibility</h2>
                <p>Users are solely responsible for content they create, publish, or distribute through this platform. You agree not to use the service to:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Post content that is illegal, harmful, or violates third-party rights</li>
                  <li>Distribute spam, malware, or inappropriate content</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Platform Availability</h2>
                <p>We strive to maintain platform availability but cannot guarantee uninterrupted service. The platform may be temporarily unavailable for maintenance, updates, or due to factors beyond our control.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
                <p>In no event shall the platform or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
                <p>If you have any questions about these Terms of Service, please contact us through the platform's support channels.</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;