import React from "react";
import { Dencrypt } from "../../../../../Functions/Functions";

export default function Layout({ children, params }) {
  //  unwrap the params Promise
  const { id } = React.use(params);

  // decrypt the id and check for expired token
  if (!Dencrypt(id)) {
    throw new Error("Token has Expired");
  }

  return <>{children}</>;
}
