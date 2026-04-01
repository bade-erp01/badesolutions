import React from 'react'
import { fetchUser } from "../../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";

export default async function page({children}) {
  const userData = await fetchUser();

  // Redirect if either user OR business is missing
  if (!userData?.user || !userData?.business) {
    redirect('/SalesPortal/Login');
  }

  return (
    <div>{children}</div>
  )
}
