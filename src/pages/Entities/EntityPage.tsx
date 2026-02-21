import { FormEvent, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { createEntity, EntityRecord, getEntities } from "../../services/api";

type EntityType = "staff" | "candidate";

type EntityPageProps = {
  entity: EntityType;
  title: string;
};

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  status: "active",
};

export default function EntityPage({ entity, title }: EntityPageProps) {
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getEntities(entity);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [entity]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createEntity(entity, form);
      setForm(defaultForm);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title={`AI Admin | ${title}`} description={`${title} management page`} />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and view {entity} records.
          </p>
          {error ? (
            <p className="mt-3 text-sm font-medium text-error-500">{error}</p>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 md:grid-cols-4"
        >
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Email"
            required
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Phone"
            required
          />
          <div className="flex gap-2">
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white rounded-lg bg-brand-500 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add"}
            </button>
          </div>
        </form>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-4" colSpan={5}>
                      Loading...
                    </td>
                  </tr>
                ) : records.length ? (
                  records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="px-5 py-4">{record.name}</td>
                      <td className="px-5 py-4">{record.email}</td>
                      <td className="px-5 py-4">{record.phone}</td>
                      <td className="px-5 py-4 capitalize">{record.status}</td>
                      <td className="px-5 py-4">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-4" colSpan={5}>
                      No records found.
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
