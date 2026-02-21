import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { CompanyProfile, getCompanyProfile } from "../../services/api";

const detailRowClass = "grid grid-cols-1 gap-3 md:grid-cols-3";

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCompanyProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load company profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <>
      <PageMeta title="AI Company | Profile" description="Company profile panel" />
      <div className="space-y-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Company Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your company data created from AI Admin panel.
          </p>
          {error ? <p className="mt-2 text-sm text-error-500">{error}</p> : null}
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          {loading ? (
            <p>Loading profile...</p>
          ) : profile ? (
            <div className="space-y-4">
              <div className={detailRowClass}>
                <Detail label="Company" value={profile.name} />
                <Detail label="Registration No." value={profile.registration_number} />
                <Detail label="Status" value={profile.status} />
              </div>
              <div className={detailRowClass}>
                <Detail label="Industry" value={profile.industry} />
                <Detail label="Website" value={profile.website || "-"} />
                <Detail label="Employee Count" value={String(profile.employee_count)} />
              </div>
              <div className={detailRowClass}>
                <Detail label="Email" value={profile.email} />
                <Detail label="Phone" value={profile.phone} />
                <Detail label="Alt. Phone" value={profile.alternate_phone || "-"} />
              </div>
              <div className={detailRowClass}>
                <Detail label="Contact Person" value={profile.contact_person_name} />
                <Detail label="Contact Email" value={profile.contact_person_email} />
                <Detail label="Contact Phone" value={profile.contact_person_phone} />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
                <Detail
                  label="Address"
                  value={`${profile.address_line1}${profile.address_line2 ? `, ${profile.address_line2}` : ""}, ${profile.city}, ${profile.state}, ${profile.postal_code}, ${profile.country}`}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
                <Detail label="Description" value={profile.description || "-"} />
              </div>
            </div>
          ) : (
            <p>No company profile found.</p>
          )}
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
