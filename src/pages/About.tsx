export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-8">About FresherFirst</h1>
        <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
          <p>
            Tech freshers in India are playing a rigged game. When you log into standard job boards and search for "entry-level frontend developer" or "Java fresher," you don't actually see fresher jobs. You see a wall of noise: roles demanding "0-3 years of experience" (where they always hire the person with 3 years), "junior" roles that require mastery of microservices and Kubernetes, or worse, data-harvesting scams disguised as mass recruitment drives.
          </p>
          <p>
            That is exactly why FresherFirst exists.
          </p>
          <p>
            FresherFirst is a job board focused <strong>exclusively on entry-level tech roles for freshers in India</strong>. We built this platform because we got tired of seeing talented engineering graduates waste hours scrolling through generic platforms that bury genuinely entry-level listings under mountains of experienced-hire noise.
          </p>
          <p>
            Our mission is simple and direct: cut the noise. We aggregate, filter, and quality-check the listings before they are shown on this board. We pull from reputable Applicant Tracking Systems (ATS) and job feeds, deliberately filtering out the job postings that demand senior-level skills on a trainee budget. 
          </p>
          <p>
            We are not an employer, a staffing agency, or a massive corporate entity shouting buzzwords like "we are passionate about synergizing world-class talent." We are just a straightforward tool built by people who remember exactly how brutal the first job hunt is, trying to make yours slightly less painful.
          </p>
          <p>
            If you are a recent graduate, a final-year student, or someone trying to break into the tech industry with zero formal professional experience, this board is for you. We focus on software development, QA, DevOps, and data roles—you won't find generic sales or marketing jobs here.
          </p>
          <p>
            We don't guarantee you a job—no platform can—but we do guarantee that you won't have to sift through roles asking for five years of experience to find the ones that actually want you.
          </p>
        </div>
      </div>
    </main>
  );
}
