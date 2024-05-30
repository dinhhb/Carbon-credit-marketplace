import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RegisterProjectForm from "@/components/Form/RegisterProjectForm";

export const metadata: Metadata = {
  title: "Register Project",
};

const RegisterProjectPage = () => {
  return (
    <DefaultLayout>
      <RegisterProjectForm />
    </DefaultLayout>
  );
};

export default RegisterProjectPage;
