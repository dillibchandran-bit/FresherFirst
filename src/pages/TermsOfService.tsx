export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: September 5, 2026</p>
        
        <div className="prose prose-lg text-gray-700 max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FresherFirst, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Nature of the Service</h2>
            <p>
              FresherFirst is a job listing aggregator. We curate, filter, and display job listings intended for entry-level technology professionals. <strong>We are not an employer, recruitment agency, or staffing firm.</strong> We simply act as a bulletin board pointing you toward open roles on the internet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. No Guarantee of Outcomes</h2>
            <p>
              While we make every effort to display accurate, active, and high-quality job postings, we do not guarantee the availability, validity, or exact compensation of any job listed on this platform. Applying to a job found on FresherFirst does not guarantee an interview, an offer, or employment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Links and Employer Processes</h2>
            <p>
              When you click on a job listing on FresherFirst, you will be redirected to a third-party website (such as Lever, Greenhouse, or a company's direct careers page) to complete your application. 
            </p>
            <p className="mt-2">
              We have no control over these third-party websites or the application processes of the respective employers. Any information you submit on those external sites is subject to that specific employer's privacy policy and terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p>
              You agree to use FresherFirst only for lawful purposes. You are strictly prohibited from using the platform to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Scrape, crawl, or mass-download data without explicit written permission.</li>
              <li>Attempt to disrupt or interfere with the platform's security or underlying infrastructure.</li>
              <li>Submit false information or spam via our contact forms or AI chat tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the site after such modifications constitutes your acknowledgement and acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
