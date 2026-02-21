import { FormEvent, Fragment, useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import {
  CompanyStaffPayload,
  CompanyStaffRecord,
  createCompanyStaff,
  getCompanyVacancies,
  getCompanyStaff,
  updateCompanyStaff,
  VacancyRecord,
} from "../../services/api";

const defaultForm: CompanyStaffPayload = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  alternate_phone: "",
  gender: "",
  date_of_birth: "",
  employee_code: "",
  department: "",
  designation: "",
  employment_type: "full-time",
  date_of_joining: "",
  experience_years: 0,
  salary: 0,
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  status: "active",
  notes: "",
  login_password: "",
};

type FieldProps = {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Field({ label, required, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

const downloadExcel = (rows: Record<string, unknown>[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vacancies");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const downloadPdf = (
  title: string,
  headers: string[],
  body: (string | number)[][],
  filename: string,
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text(title, 14, 12);
  autoTable(doc, { startY: 16, head: [headers], body, styles: { fontSize: 8 } });
  doc.save(`${filename}.pdf`);
};

export default function CompanyStaffPage() {
  const [form, setForm] = useState<CompanyStaffPayload>(defaultForm);
  const [staff, setStaff] = useState<CompanyStaffRecord[]>([]);
  const [vacancies, setVacancies] = useState<VacancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [expandedStaffId, setExpandedStaffId] = useState<number | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const [staffData, vacancyData] = await Promise.all([getCompanyStaff(), getCompanyVacancies()]);
      setStaff(staffData);
      setVacancies(vacancyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const update = (key: keyof CompanyStaffPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const mapRecordToForm = (record: CompanyStaffRecord): CompanyStaffPayload => ({
    first_name: record.first_name || "",
    last_name: record.last_name || "",
    email: record.email || "",
    phone: record.phone || "",
    alternate_phone: record.alternate_phone || "",
    gender: (record.gender || "") as CompanyStaffPayload["gender"],
    date_of_birth: record.date_of_birth || "",
    employee_code: record.employee_code || "",
    department: record.department || "",
    designation: record.designation || "",
    employment_type: record.employment_type || "full-time",
    date_of_joining: record.date_of_joining || "",
    experience_years: Number(record.experience_years || 0),
    salary: Number(record.salary || 0),
    address_line1: record.address_line1 || "",
    address_line2: record.address_line2 || "",
    city: record.city || "",
    state: record.state || "",
    postal_code: record.postal_code || "",
    country: record.country || "",
    emergency_contact_name: record.emergency_contact_name || "",
    emergency_contact_phone: record.emergency_contact_phone || "",
    status: record.status || "active",
    notes: record.notes || "",
    login_password: "",
  });

  const startEdit = (record: CompanyStaffRecord) => {
    setForm(mapRecordToForm(record));
    setEditingStaffId(record.id);
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setForm(defaultForm);
    setEditingStaffId(null);
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingStaffId && !form.login_password) {
      setError("Login password is required for new staff");
      return;
    }
    if (form.login_password && form.login_password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editingStaffId) {
        await updateCompanyStaff(editingStaffId, form);
        setSuccess("Staff updated successfully.");
      } else {
        await createCompanyStaff(form);
        setSuccess("Staff created successfully.");
      }
      setForm(defaultForm);
      setConfirmPassword("");
      setEditingStaffId(null);
      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save staff");
    } finally {
      setSubmitting(false);
    }
  };

  const vacanciesByStaff = (staffId: number) =>
    vacancies.filter((vacancy) => vacancy.created_by_staff_id === staffId);

  return (
    <>
      <PageMeta title="AI Company | Staff" description="Company staff management" />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editingStaffId ? "Edit Staff" : "Create Staff"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add and manage full staff details for your company.
          </p>
          {error ? <p className="mt-3 text-sm text-error-500">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-success-500">{success}</p> : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 md:grid-cols-2"
        >
          <Field label="First Name" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required />
          </Field>
          <Field label="Last Name" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required />
          </Field>
          <Field label="Email" required>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </Field>
          <Field label="Phone" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
          </Field>
          <Field label="Alternate Phone">
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.alternate_phone} onChange={(e) => update("alternate_phone", e.target.value)} />
          </Field>
          <Field label="Gender">
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
          </Field>
          <Field label="Employee Code" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.employee_code} onChange={(e) => update("employee_code", e.target.value)} required />
          </Field>
          <Field label="Department" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.department} onChange={(e) => update("department", e.target.value)} required />
          </Field>
          <Field label="Designation" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.designation} onChange={(e) => update("designation", e.target.value)} required />
          </Field>
          <Field label="Employment Type">
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.employment_type} onChange={(e) => update("employment_type", e.target.value)}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </Field>
          <Field label="Date of Joining" required>
            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.date_of_joining} onChange={(e) => update("date_of_joining", e.target.value)} required />
          </Field>
          <Field label="Experience (years)">
            <input type="number" min={0} step={0.1} className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.experience_years} onChange={(e) => update("experience_years", Number(e.target.value))} />
          </Field>
          <Field label="Salary">
            <input type="number" min={0} step={0.01} className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.salary} onChange={(e) => update("salary", Number(e.target.value))} />
          </Field>
          <Field label="Address Line 1" required className="md:col-span-2">
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} required />
          </Field>
          <Field label="Address Line 2" className="md:col-span-2">
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
          </Field>
          <Field label="City" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          </Field>
          <Field label="State" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.state} onChange={(e) => update("state", e.target.value)} required />
          </Field>
          <Field label="Postal Code" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required />
          </Field>
          <Field label="Country" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.country} onChange={(e) => update("country", e.target.value)} required />
          </Field>
          <Field label="Emergency Contact Name" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} required />
          </Field>
          <Field label="Emergency Contact Phone" required>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} required />
          </Field>
          <Field label="Status">
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </Field>
          <Field label={editingStaffId ? "New Login Password" : "Login Password"} required={!editingStaffId}>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={form.login_password} onChange={(e) => update("login_password", e.target.value)} required={!editingStaffId} />
          </Field>
          <Field label={editingStaffId ? "Confirm New Password" : "Confirm Password"} required={!editingStaffId || !!form.login_password}>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!editingStaffId || !!form.login_password} />
          </Field>
          <Field label="Notes" className="md:col-span-2">
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </Field>

          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 text-white rounded-lg bg-brand-500 w-fit disabled:opacity-60" disabled={submitting}>
              {submitting ? (editingStaffId ? "Updating..." : "Creating...") : editingStaffId ? "Update Staff" : "Create Staff"}
            </button>
            {editingStaffId ? (
              <button type="button" onClick={cancelEdit} className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100">
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
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Designation</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-4">
                      Loading staff...
                    </td>
                  </tr>
                ) : staff.length ? (
                  staff.map((record) => {
                    const isExpanded = expandedStaffId === record.id;
                    const staffVacancies = vacanciesByStaff(record.id);
                    const exportRows = staffVacancies.map((v) => ({
                      JobTitle: v.job_title,
                      Department: v.department,
                      Type: v.employment_type,
                      Openings: v.openings,
                      MatchThreshold: v.match_threshold,
                      McqQuestions: v.mcq_question_count,
                      McqPassThreshold: v.mcq_pass_threshold,
                      Status: v.status,
                    }));

                    return (
                      <Fragment key={record.id}>
                        <tr key={record.id} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="px-5 py-4">{record.first_name} {record.last_name}</td>
                          <td className="px-5 py-4">{record.employee_code}</td>
                          <td className="px-5 py-4">{record.department}</td>
                          <td className="px-5 py-4">{record.designation}</td>
                          <td className="px-5 py-4 capitalize">{record.status}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(record)}
                                className="px-3 py-1 text-sm text-white rounded-md bg-brand-500"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedStaffId(isExpanded ? null : record.id)}
                                className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100"
                              >
                                {isExpanded ? "Hide" : "View"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td colSpan={6} className="px-5 py-4">
                              <div className="p-4 space-y-4 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                    Staff Details
                                  </h3>
                                  <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-3">
                                    <Detail label="Email" value={record.email} />
                                    <Detail label="Phone" value={record.phone} />
                                    <Detail label="Alternate Phone" value={record.alternate_phone || "-"} />
                                    <Detail label="Gender" value={record.gender || "-"} />
                                    <Detail label="Date of Birth" value={record.date_of_birth || "-"} />
                                    <Detail label="Employment Type" value={record.employment_type} />
                                    <Detail label="Date of Joining" value={record.date_of_joining} />
                                    <Detail label="Experience (Years)" value={String(record.experience_years)} />
                                    <Detail label="Salary" value={String(record.salary)} />
                                    <Detail label="Emergency Contact" value={record.emergency_contact_name} />
                                    <Detail label="Emergency Phone" value={record.emergency_contact_phone} />
                                    <Detail label="Created At" value={new Date(record.created_at).toLocaleString()} />
                                  </div>
                                  <div className="mt-3">
                                    <Detail
                                      label="Address"
                                      value={`${record.address_line1}${record.address_line2 ? `, ${record.address_line2}` : ""}, ${record.city}, ${record.state}, ${record.postal_code}, ${record.country}`}
                                    />
                                  </div>
                                  <div className="mt-3">
                                    <Detail label="Notes" value={record.notes || "-"} />
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                    Vacancies Created by Staff ({staffVacancies.length})
                                  </h3>
                                  {staffVacancies.length ? (
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadExcel(
                                            exportRows,
                                            `${record.employee_code}-vacancies`,
                                          )
                                        }
                                        className="px-3 py-2 text-sm text-white rounded-md bg-emerald-600"
                                      >
                                        Vacancy Excel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadPdf(
                                            `${record.first_name} ${record.last_name} - Vacancies`,
                                            ["Job Title", "Department", "Type", "Openings", "Match %", "MCQ Qs", "MCQ Pass %", "Status"],
                                            staffVacancies.map((v) => [
                                              v.job_title,
                                              v.department,
                                              v.employment_type,
                                              v.openings,
                                              `${Number(v.match_threshold).toFixed(0)}%`,
                                              v.mcq_question_count,
                                              `${Number(v.mcq_pass_threshold).toFixed(0)}%`,
                                              v.status,
                                            ]),
                                            `${record.employee_code}-vacancies`,
                                          )
                                        }
                                        className="px-3 py-2 text-sm text-white rounded-md bg-rose-600"
                                      >
                                        Vacancy PDF
                                      </button>
                                    </div>
                                  ) : null}
                                  {staffVacancies.length ? (
                                    <div className="mt-3 overflow-x-auto">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-3 py-2 text-left text-xs">Job Title</th>
                                            <th className="px-3 py-2 text-left text-xs">Department</th>
                                            <th className="px-3 py-2 text-left text-xs">Type</th>
                                            <th className="px-3 py-2 text-left text-xs">Openings</th>
                                            <th className="px-3 py-2 text-left text-xs">Match %</th>
                                            <th className="px-3 py-2 text-left text-xs">MCQ Qs</th>
                                            <th className="px-3 py-2 text-left text-xs">MCQ Pass %</th>
                                            <th className="px-3 py-2 text-left text-xs">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {staffVacancies.map((vacancy) => (
                                            <tr key={vacancy.id} className="border-b border-gray-200 dark:border-gray-700">
                                              <td className="px-3 py-2 text-sm">{vacancy.job_title}</td>
                                              <td className="px-3 py-2 text-sm">{vacancy.department}</td>
                                              <td className="px-3 py-2 text-sm capitalize">{vacancy.employment_type}</td>
                                              <td className="px-3 py-2 text-sm">{vacancy.openings}</td>
                                              <td className="px-3 py-2 text-sm">{Number(vacancy.match_threshold).toFixed(0)}%</td>
                                              <td className="px-3 py-2 text-sm">{vacancy.mcq_question_count}</td>
                                              <td className="px-3 py-2 text-sm">{Number(vacancy.mcq_pass_threshold).toFixed(0)}%</td>
                                              <td className="px-3 py-2 text-sm capitalize">{vacancy.status}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                      No vacancies created by this staff yet.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-4">
                      No staff found.
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
