import { Helmet } from 'react-helmet-async';

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use – ZPresso LLC</title>
        <meta name="description" content="Terms of Use for ZPresso LLC. Read our terms and conditions for using the Service." />
      </Helmet>

      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Use</h1>
          <p className="text-gray-500 mb-10">Last Updated: April 5, 2026</p>

          <div className="space-y-8 leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using the 59s.site website and mobile application (the "Service") operated by ZPresso LLC ("we", "our", or "us"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>The Service provides tools for creating video-based landing pages, managing campaigns, collecting leads, and related marketing functionalities. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>You must be at least 13 years old to use the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations.</li>
                <li>Infringe on the intellectual property rights of others.</li>
                <li>Distribute malware, spam, or harmful content.</li>
                <li>Attempt to gain unauthorized access to our systems.</li>
                <li>Harass, abuse, or harm other users.</li>
                <li>Use the Service for any illegal or fraudulent purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Content Ownership</h2>
              <p>You retain ownership of all content you create using the Service. By using the Service, you grant us a limited license to host, display, and distribute your content solely for the purpose of providing the Service to you.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
              <p>The Service, including its design, features, and code, is the property of ZPresso LLC and is protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Payment and Subscriptions</h2>
              <p>Some features of the Service may require a paid subscription. Payment terms, pricing, and billing cycles will be presented at the time of purchase. All fees are non-refundable unless otherwise stated.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Account Termination</h2>
              <p>We reserve the right to suspend or terminate your account if you violate these Terms of Use. You may delete your account at any time using the account deletion feature within the app or by contacting us. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
              <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, ZPresso LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
              <p>We may update these Terms of Use from time to time. We will notify you of any changes by posting the new terms on this page and updating the "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Use, please contact us at:{' '}
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
