import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="AI Company | Login"
        description="AI HR Portal company login"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
