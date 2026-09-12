import React from 'react'
import GeoUpdater from '@/app/Components/LocationGrabber';
import {Dencrypt} from "../../../Functions/Functions";
import { fetchUser } from '../../../Functions/whoIsSalesPerson';

export default async function layout({ children }) {
  const userData = await fetchUser();
  return (
    <>
      {userData?.user.SessionId === Dencrypt(userData?.SessionId) && userData?.business && (<GeoUpdater userData={userData} baseUrl={process.env.EXPRESS_PRIVATE_URL} />)}
      {children}
    </>
  )
}
