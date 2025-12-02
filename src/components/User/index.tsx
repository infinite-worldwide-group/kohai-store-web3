import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { useQuery } from "@apollo/client";

const User = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="User" />
    </div>
  );
};

export default User;
