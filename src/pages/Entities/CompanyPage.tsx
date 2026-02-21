import { FormEvent, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  CompanyRegistrationPayload,
  CompanyRecord,
  getCompanies,
  registerCompany,
  updateCompany,
} from "../../services/api";

const defaultForm: CompanyRegistrationPayload = {
  name: "",
  legal_name: "",
  registration_number: "",
  tax_id: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  alternate_phone: "",
  founded_date: "",
  employee_count: 0,
  company_size: "1-10",
  description: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  contact_person_name: "",
  contact_person_designation: "",
  contact_person_email: "",
  contact_person_phone: "",
  status: "active",
  login_password: "",
};

export default function CompanyPage() {
  const [form, setForm] = useState<CompanyRegistrationPayload>(defaultForm);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editingCompanyId) {
        await updateCompany(editingCompanyId, form);
        setSuccess("Company updated successfully.");
      } else {
        await registerCompany(form);
        setSuccess("Company registered successfully.");
      }
      setForm(defaultForm);
      setEditingCompanyId(null);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save company");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: keyof CompanyRegistrationPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const mapCompanyToForm = (company: CompanyRecord): CompanyRegistrationPayload => ({
    name: company.name || "",
    legal_name: company.legal_name || "",
    registration_number: company.registration_number || "",
    tax_id: company.tax_id || "",
    industry: company.industry || "",
    website: company.website || "",
    email: company.email || "",
    phone: company.phone || "",
    alternate_phone: company.alternate_phone || "",
    founded_date: company.founded_date || "",
    employee_count: Number(company.employee_count || 0),
    company_size: company.company_size || "1-10",
    description: company.description || "",
    address_line1: company.address_line1 || "",
    address_line2: company.address_line2 || "",
    city: company.city || "",
    state: company.state || "",
    postal_code: company.postal_code || "",
    country: company.country || "",
    contact_person_name: company.contact_person_name || "",
    contact_person_designation: company.contact_person_designation || "",
    contact_person_email: company.contact_person_email || "",
    contact_person_phone: company.contact_person_phone || "",
    status: company.status || "active",
    login_password: "",
  });

  const startEdit = (company: CompanyRecord) => {
    setForm(mapCompanyToForm(company));
    setEditingCompanyId(company.id);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setForm(defaultForm);
    setEditingCompanyId(null);
    setError("");
    setSuccess("");
  };

  return (
    <>
      <PageMeta title="AI Admin | Company Registration" description="Full company registration" />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editingCompanyId ? "Edit Company" : "AI Company Registration"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Register company with complete profile, address, and primary contact details.
          </p>
          {error ? <p className="mt-3 text-sm text-error-500">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-success-500">{success}</p> : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 md:grid-cols-2"
        >
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Company Name *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Legal Name"
            value={form.legal_name}
            onChange={(e) => update("legal_name", e.target.value)}
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Registration Number *"
            value={form.registration_number}
            onChange={(e) => update("registration_number", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Tax ID"
            value={form.tax_id}
            onChange={(e) => update("tax_id", e.target.value)}
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Industry *"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
          <input
            type="email"
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Company Email *"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Company Phone *"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Alternate Phone"
            value={form.alternate_phone}
            onChange={(e) => update("alternate_phone", e.target.value)}
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={form.founded_date}
            onChange={(e) => update("founded_date", e.target.value)}
          />
          <input
            type="number"
            min={0}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Employee Count *"
            value={form.employee_count}
            onChange={(e) => update("employee_count", Number(e.target.value))}
            required
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={form.company_size}
            onChange={(e) => update("company_size", e.target.value)}
          >
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 md:col-span-2"
            placeholder="Address Line 1 *"
            value={form.address_line1}
            onChange={(e) => update("address_line1", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 md:col-span-2"
            placeholder="Address Line 2"
            value={form.address_line2}
            onChange={(e) => update("address_line2", e.target.value)}
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="City *"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="State *"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Postal Code *"
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Country *"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Contact Person Name *"
            value={form.contact_person_name}
            onChange={(e) => update("contact_person_name", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Contact Designation"
            value={form.contact_person_designation}
            onChange={(e) => update("contact_person_designation", e.target.value)}
          />
          <input
            type="email"
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Contact Email *"
            value={form.contact_person_email}
            onChange={(e) => update("contact_person_email", e.target.value)}
            required
          />
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Contact Phone *"
            value={form.contact_person_phone}
            onChange={(e) => update("contact_person_phone", e.target.value)}
            required
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <textarea
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 md:col-span-2"
            rows={3}
            placeholder="Company Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 text-white rounded-lg bg-brand-500 w-fit disabled:opacity-60"
              disabled={submitting}
            >
              {submitting
                ? editingCompanyId
                  ? "Updating..."
                  : "Registering..."
                : editingCompanyId
                  ? "Update Company"
                  : "Register Company"}
            </button>
            {editingCompanyId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left">Company</th>
                  <th className="px-5 py-3 text-left">Reg. No.</th>
                  <th className="px-5 py-3 text-left">Industry</th>
                  <th className="px-5 py-3 text-left">Contact Person</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-4">
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length ? (
                  companies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="px-5 py-4">{company.name}</td>
                      <td className="px-5 py-4">{company.registration_number}</td>
                      <td className="px-5 py-4">{company.industry}</td>
                      <td className="px-5 py-4">{company.contact_person_name}</td>
                      <td className="px-5 py-4 capitalize">{company.status}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => startEdit(company)}
                          className="px-3 py-1 text-sm text-white rounded-md bg-brand-500"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-4">
                      No companies registered yet.
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
