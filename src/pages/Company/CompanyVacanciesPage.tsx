import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getCompanyVacancies, VacancyRecord } from "../../services/api";

export default function CompanyVacanciesPage() {
  const [vacancies, setVacancies] = useState<VacancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCompanyVacancies();
        setVacancies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load vacancies");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <PageMeta title="AI Company | Vacancies" description="Company vacancies view" />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Vacancies</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vacancies created by your staff.
          </p>
          {error ? <p className="mt-3 text-sm text-error-500">{error}</p> : null}
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left">Job Title</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Openings</th>
                  <th className="px-5 py-3 text-left">Match %</th>
                  <th className="px-5 py-3 text-left">MCQ Config</th>
                  <th className="px-5 py-3 text-left">Created By</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-4">
                      Loading vacancies...
                    </td>
                  </tr>
                ) : vacancies.length ? (
                  vacancies.map((vacancy) => (
                    <tr key={vacancy.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="px-5 py-4">{vacancy.job_title}</td>
                      <td className="px-5 py-4">{vacancy.department}</td>
                      <td className="px-5 py-4">{vacancy.employment_type}</td>
                      <td className="px-5 py-4">{vacancy.openings}</td>
                      <td className="px-5 py-4">{Number(vacancy.match_threshold).toFixed(0)}%</td>
                      <td className="px-5 py-4">{vacancy.mcq_question_count} Q / {Number(vacancy.mcq_pass_threshold).toFixed(0)}%</td>
                      <td className="px-5 py-4">{vacancy.created_by_name}</td>
                      <td className="px-5 py-4 capitalize">{vacancy.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-4">
                      No vacancies available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
