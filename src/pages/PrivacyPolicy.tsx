import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy – ZPresso LLC</title>
        <meta name="description" content="Privacy Policy for ZPresso LLC. Learn how we collect, use, and protect your personal information." />
      </Helmet>

      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-10">Last Updated: April 5, 2026</p>

          <div className="space-y-8 leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>ZPresso LLC ("we", "our", or "us") operates the 59s.site website and mobile application (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with the Service, including pages visited, features used, and timestamps.</li>
                <li><strong>Device Information:</strong> Device type, operating system, browser type, and unique device identifiers.</li>
                <li><strong>Content Data:</strong> Videos, pages, and campaigns you create using the Service.</li>
                <li><strong>Lead Data:</strong> Information collected through opt-in forms you create (name, email, phone) on behalf of your visitors.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve the Service.</li>
                <li>To create and manage your account.</li>
                <li>To process transactions and send related information.</li>
                <li>To send you technical notices, updates, and support messages.</li>
                <li>To respond to your comments, questions, and requests.</li>
                <li>To monitor and analyze trends, usage, and activities.</li>
                <li>To detect, investigate, and prevent fraudulent or unauthorized activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., hosting, analytics, email delivery).</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
              <p>We retain your personal information for as long as your account is active or as needed to provide you the Service. You may request deletion of your account and associated data at any time by contacting us or using the account deletion feature within the app.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
              <p>We use industry-standard security measures to protect your information, including encryption in transit (TLS/SSL) and at rest. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
              <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to or restrict processing of your data.</li>
                <li>Data portability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
              <p>The Service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:engrmoshbari@gmail.com" className="text-blue-600 hover:underline">engrmoshbari@gmail.com</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2026 ZPresso LLC. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
