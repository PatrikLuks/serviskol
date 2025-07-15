// ai-dashboard/components/OnboardingReportExport.js
export default function OnboardingReportExport() {
  function handleDownload() {
    window.open('/api/admin/onboarding-report-export', '_blank');
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Export onboarding reportu</h2>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        onClick={handleDownload}
      >
        Stáhnout report (Markdown)
      </button>
    </div>
  );
}
