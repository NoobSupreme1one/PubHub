import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="elevation-2">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                
                <h3 className="text-lg font-medium mt-4 mb-2">Account Information</h3>
                <ul className="list-disc pl-6">
                  <li>Email address and authentication credentials</li>
                  <li>Profile information you choose to provide</li>
                  <li>Content creation and publishing activity</li>
                </ul>

                <h3 className="text-lg font-medium mt-4 mb-2">Usage Information</h3>
                <ul className="list-disc pl-6">
                  <li>Platform usage patterns and preferences</li>
                  <li>Content performance and engagement metrics</li>
                  <li>Technical information about your device and browser</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your content distribution requests</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Protect against fraud and unauthorized access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>When you explicitly authorize content distribution to social platforms</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>With service providers who assist in platform operations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your content and data</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
                <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
                <p>If you have questions about this Privacy Policy or our data practices, please contact us through the platform's support channels.</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;