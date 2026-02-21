import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { ApplicationRecord, getCompanyApplications } from "../../services/api";

export default function CompanyApplicationsPage() {
  const [rows, setRows] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        setRows(await getCompanyApplications());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load applications");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.job_title, r.candidate_name, r.candidate_email, r.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [rows, search]);

  return (
    <>
      <PageMeta title="AI Company | Applications" description="Candidate applications and resume review" />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Candidate Applications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review resumes submitted to your company vacancies.</p>
          {error ? <p className="mt-2 text-sm text-error-500">{error}</p> : null}
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search Applications</label>
          <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Job title, candidate, status..." />
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left">Job</th>
                  <th className="px-5 py-3 text-left">Candidate</th>
                  <th className="px-5 py-3 text-left">Applied On</th>
                  <th className="px-5 py-3 text-left">Resume</th>
                  <th className="px-5 py-3 text-left">Match</th>
                  <th className="px-5 py-3 text-left">Screening</th>
                  <th className="px-5 py-3 text-left">MCQ</th>
                  <th className="px-5 py-3 text-left">Practical</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-4">Loading applications...</td></tr>
                ) : filtered.length ? (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="px-5 py-4">{r.job_title}</td>
                      <td className="px-5 py-4">{r.candidate_name}<div className="text-xs text-gray-500">{r.candidate_email}</div></td>
                      <td className="px-5 py-4">{new Date(r.applied_at).toLocaleString()}</td>
                      <td className="px-5 py-4"><a className="text-brand-500" href={`http://localhost:5000${r.resume_path}`} target="_blank" rel="noreferrer">View Resume</a></td>
                      <td className="px-5 py-4">{Number(r.match_percentage).toFixed(2)}% / {Number(r.match_threshold).toFixed(0)}%</td>
                      <td className="px-5 py-4">{r.screening_result}{r.screening_notes ? <div className="text-xs text-gray-500">{r.screening_notes}</div> : null}</td>
                      <td className="px-5 py-4">{r.mcq_required ? `${r.mcq_status} (${Number(r.mcq_correct_answers).toFixed(0)}/${Number(r.mcq_total_questions).toFixed(0)}, ${Number(r.mcq_score_percentage).toFixed(2)}% / ${Number(r.mcq_pass_threshold).toFixed(0)}%)` : "Not required"}</td>
                      <td className="px-5 py-4">
                        {r.practical_status
                          ? `${r.practical_status} (${Number(r.practical_score_percentage || 0).toFixed(2)}% / ${Number(r.practical_pass_threshold || 70).toFixed(0)}%)`
                          : r.practical_round_status}
                      </td>
                      <td className="px-5 py-4">{r.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={9} className="px-5 py-4">No applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
