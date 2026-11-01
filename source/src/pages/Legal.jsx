import { PageShell } from './PageShell';

/* ======================================================================
   Legal pages
   ====================================================================== */
const LEGAL_UPDATED = '1 November 2026';
function LegalPage({ title, intro, sections }) {
  return (
    <PageShell>
      <section className="band lg">
        <div className="wrap lg-wrap">
          <p className="eyebrow">Legal</p>
          <h1 className="wi-h">{title}</h1>
          <p className="lg-meta">Last updated {LEGAL_UPDATED}</p>
          <p className="lg-intro">{intro}</p>
          <div className="lg-body">
            {sections.map(([h, ps]) => (
              <section key={h}>
                <h2>{h}</h2>
                {ps.map((p, i) => (Array.isArray(p) ? <ul key={i}>{p.map((li) => <li key={li}>{li}</li>)}</ul> : <p key={i}>{p}</p>))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
const PRIVACY = [
  ['Who we are', ['Jayastra is an independent design studio based in Jabalpur, Madhya Pradesh, India. In this policy, “we” and “us” mean Jayastra. You can reach us at hello@jayastra.com.']],
  ['What we collect', ['We only collect information you choose to give us, and a small amount of technical data needed to run the website.', [
    'Booking and enquiry details: your name, email address, phone number (optional), what your project is about, budget range, notes and any guest emails you add.',
    'Emails you send us, and anything you share during a call or project.',
    'Technical data: like every website, our hosting provider receives your IP address, browser type and the pages you request, in order to deliver the site and keep it secure.',
  ]]],
  ['How we use it', [[
    'To reply to your enquiry, confirm a call and send the meeting link.',
    'To prepare proposals, deliver projects and send invoices.',
    'To keep the website working, secure and fast.',
  ], 'We do not sell your data, and we do not use it for advertising.']],
  ['Cookies and tracking', ['This website does not set advertising or tracking cookies. If we turn on privacy-friendly visitor analytics (such as Vercel Analytics), it counts page views without cookies and without identifying you personally. We will update this page if that changes.']],
  ['Services we rely on', ['We use a few trusted providers to run the site and our studio. Each receives only what it needs:', [
    'Vercel: website hosting.',
    'Hostinger: domain and business email.',
    'Google Fonts, cdnjs and jsDelivr: fonts and code libraries loaded by your browser.',
    'Unsplash: some photographs are served from Unsplash’s image service.',
    'Cal.com and Google Meet: call scheduling and video calls, once connected.',
  ], 'These providers may process data outside India under their own privacy policies.']],
  ['How long we keep it', ['Enquiries that do not lead to a project are deleted within 12 months. Client project records are kept for as long as needed for the work and for accounting and tax requirements under Indian law, typically up to 8 years.']],
  ['Your rights', ['You can ask us to see, correct or delete the personal data we hold about you, or to stop contacting you. Write to hello@jayastra.com and we will respond within 30 days. If you are in the EU or UK, you also have rights under the GDPR, including the right to complain to your local data protection authority. In India, you have rights under the Digital Personal Data Protection Act, 2023.']],
  ['Security', ['We use reputable providers, secure connections (HTTPS) and access controls to protect your data. No system is perfectly secure, but we take reasonable care and will tell you promptly if a breach affects you.']],
  ['Changes', ['We may update this policy from time to time. The date at the top shows the latest version.']],
  ['Contact', ['Questions about privacy: hello@jayastra.com · Jayastra, Jabalpur, Madhya Pradesh, India.']],
];
const TERMS = [
  ['About these terms', ['These terms cover your use of jayastra.com and the general basis on which Jayastra provides design services. Every project also has its own written proposal; where the proposal and these terms differ, the proposal applies.']],
  ['Using this website', ['You may browse and share this website for personal and business research. Please do not copy, scrape or republish its content, design or code without our written permission.']],
  ['Our work on this site', ['Projects marked “Concept project” are studio concepts created to show our approach and capabilities; they are not presented as client commissions. Some photographs are licensed from Unsplash. All other content, including text, layouts, illustrations and the Jayastra name and mark, belongs to Jayastra.']],
  ['Proposals and pricing', ['Prices shown on this site are starting points. Your price, scope, deliverables and timeline are set out in a written proposal, and work begins once you accept it. Prices are in Indian rupees unless the proposal says otherwise, and taxes such as GST apply where required.']],
  ['Payments', ['Projects are usually billed in milestones, with an advance before work starts. Retainers are billed monthly in advance and can be paused or cancelled with notice as stated in your proposal. Late payments may pause work.']],
  ['Revisions and feedback', ['Each project includes the number of revision rounds stated in the proposal. Extra rounds or changes in scope are quoted separately before we start them.']],
  ['Files and ownership', ['When the final invoice is paid, you own the final approved deliverables and receive the source files listed in your proposal. Until then, all work remains Jayastra’s property. We may show completed work in our portfolio unless we agree otherwise in writing.']],
  ['Your materials', ['You confirm that anything you give us to use (logos, photos, text, CAD files) is yours or licensed to you, and that using it in your project will not break anyone else’s rights.']],
  ['Liability', ['We take care with everything we make, but we are not liable for indirect losses such as lost profits. Our total liability for any project is limited to the fees you paid for that project.']],
  ['Bookings', ['Call requests made through this website are confirmed by email. A request is not a booking until we confirm it.']],
  ['Governing law', ['These terms are governed by the laws of India. Any disputes will be handled by the courts of Jabalpur, Madhya Pradesh.']],
  ['Contact', ['hello@jayastra.com · Jayastra, Jabalpur, Madhya Pradesh, India.']],
];
export const PrivacyPage = () => <LegalPage title="Privacy Policy" intro="How Jayastra collects, uses and protects your personal information when you visit this website, book a call or work with us." sections={PRIVACY} />;
export const TermsPage = () => <LegalPage title="Terms of Use" intro="The terms for using jayastra.com and the general basis on which we take on design work." sections={TERMS} />;
