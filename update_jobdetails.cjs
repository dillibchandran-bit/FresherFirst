const fs = require('fs');
let c = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');

c = c.replace(
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, Building2, Flag, AlertCircle, ArrowLeft, X, FileText, Loader2 } from 'lucide-react';",
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, Building2, Flag, AlertCircle, ArrowLeft, X, FileText, Loader2, ShieldCheck, Award, History } from 'lucide-react';"
);

// Add Badges logic inside the component before return
const badgesLogic = `
  const isRecentlyPosted = job?.posted_at ? (new Date().getTime() - new Date(job.posted_at).getTime()) < 3 * 24 * 60 * 60 * 1000 : true;
  const isSalaryDisclosed = !!(job?.salary_min || job?.salary_max);
  const isVerified = job?.company.verification_status === 'verified';
`;

c = c.replace('const formatSalary =', badgesLogic + '\n\n  const formatSalary =');

const tagsUI = `
                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm font-medium">
                  {isVerified && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200" title="This employer has passed our verification process">
                      <ShieldCheck className="w-4 h-4" /> Verified Employer
                    </div>
                  )}
                  {isVerified && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                      <Award className="w-4 h-4" /> Verified Job
                    </div>
                  )}
                  {job.fresher_eligible && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                      <GraduationCap className="w-4 h-4" /> Freshers Welcome
                    </div>
                  )}
                  {isSalaryDisclosed && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      <IndianRupee className="w-4 h-4" /> Salary Disclosed
                    </div>
                  )}
                  {isRecentlyPosted && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                      <History className="w-4 h-4" /> Recently Posted
                    </div>
                  )}
                </div>
`;

c = c.replace('{job.fresher_eligible && (\\n                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">\\n                    <GraduationCap className="w-4 h-4" /> Fresher Friendly\\n                  </div>\\n                )}', '');
c = c.replace(/\{job\.fresher_eligible && \([\s\S]*?\)\}/, tagsUI);

// Re-replace in case regex missed
if (c.indexOf('Fresher Friendly') !== -1) {
  const toReplace = `{job.fresher_eligible && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                    <GraduationCap className="w-4 h-4" /> Fresher Friendly
                  </div>
                )}`;
  c = c.replace(toReplace, tagsUI);
}

// CheckCircle2 verified logic in company name 
c = c.replace('job.company.verified && <CheckCircle2', "job.company.verification_status === 'verified' && <CheckCircle2");
c = c.replace('job.company.verified && <CheckCircle2', "job.company.verification_status === 'verified' && <CheckCircle2"); // sidebar as well

// Handle duplicate error for reports
c = c.replace("if (error) throw error;", `if (error) {
        if (error.code === '23505') throw new Error("You have already reported this job.");
        throw error;
      }`);
c = c.replace("alert('Failed to submit report.');", "alert(err.message || 'Failed to submit report.');");


// Report Modal Form
const newReportForm = `
            <form onSubmit={submitReport} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Why are you reporting this job?</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 outline-none border focus:border-gray-900 focus:ring-1 focus:ring-gray-900 mb-4 bg-white"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Fake job">Fake job</option>
                  <option value="Asking for money">Asking for money</option>
                  <option value="Misleading information">Misleading information</option>
                  <option value="Wrong company">Wrong company</option>
                  <option value="Duplicate job">Duplicate job</option>
                  <option value="Suspicious recruiter">Suspicious recruiter</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-500">Your report will be reviewed by our moderation team. False reporting may lead to account suspension.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={reporting || !reportReason.trim()} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
`;

c = c.replace(/<form onSubmit={submitReport} className="p-6">[\s\S]*?<\/form>/, newReportForm);

fs.writeFileSync('src/pages/jobs/JobDetails.tsx', c);
