export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: September 5, 2026</p>
        
        <div className="prose prose-lg text-gray-700 max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p>
              When you visit FresherFirst, we collect certain information to help us run the platform effectively. This includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Search Data:</strong> Queries you enter into our job search bar.</li>
              <li><strong>Chat Inputs:</strong> Any questions or text you provide to our AI chat assistant.</li>
              <li><strong>Log Data & Analytics:</strong> Standard connection information such as your IP address, browser type, device type, referring pages, and the time and date of your visit.</li>
              <li><strong>Contact Information:</strong> If you use our contact form, we collect your name, email address, and message.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information solely to operate, maintain, and improve the FresherFirst platform. For example, we use search data to understand what roles are most in demand, and log data to monitor the site for security and performance issues. 
            </p>
            <p className="mt-2">
              <strong>We do not sell, rent, or trade your personal information to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Advertising and Cookies (Google AdSense)</h2>
            <p>
              We use Google AdSense to display advertisements on FresherFirst. This service uses cookies to serve ads based on your prior visits to this website and other sites on the internet.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the internet.</li>
              <li>You may opt out of personalized advertising by visiting Google's <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">www.aboutads.info</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Links</h2>
            <p>
              Our job board contains links to third-party Applicant Tracking Systems (such as Lever, Greenhouse, Remotive) and company websites. Once you click an external link to apply for a job, you leave FresherFirst. We are not responsible for the privacy practices, data collection, or content of those external sites. We strongly encourage you to read the privacy policies of any site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Us for Data Requests</h2>
            <p>
              If you have any questions about this Privacy Policy, or if you would like to request the deletion or export of your personal data, please contact us at:
            </p>
            <p className="mt-2 font-medium text-gray-900">
              Email: support@fresherfirst.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
