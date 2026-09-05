export default function Disclaimer() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Disclaimer</h1>
        
        <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
          <p>
            The job listings displayed on FresherFirst are sourced and aggregated from third-party Applicant Tracking Systems (ATS) including, but not limited to, Remotive, Greenhouse, Lever, and direct company career portals.
          </p>
          <p>
            <strong>FresherFirst does not directly employ, interview, or hire for any of the roles listed on this platform.</strong> We act solely as a discovery engine and directory to help entry-level candidates find relevant opportunities.
          </p>
          <p>
            While we manually filter and quality-check listings to reduce spam and irrelevant roles, we cannot absolutely guarantee the real-time accuracy, legitimacy, or safety of every external company. 
          </p>
          <p>
            <strong>User Responsibility:</strong> Users should always independently verify a company’s legitimacy before applying. Never share highly sensitive personal information (such as your Aadhar card, PAN card, or banking passwords), and <strong>never pay money</strong> for a job application, training bond, or laptop deposit. If a company asks for payment to hire you, it is a scam.
          </p>
          <p>
            By using FresherFirst, you acknowledge that you apply to these external third-party listings at your own risk.
          </p>
        </div>
      </div>
    </main>
  );
}
