import StoreOption from './page';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import {WHouse} from '../../../../../../../models/Stores'
import {Dencrypt} from '../../../../../../../Functions/Functions'

export default async function StoreLayout({ params }) {
  const userInfo = await fetchUser();
  const Params = await params
  const Store = await WHouse.findById(Dencrypt(await Params?.id)).lean()

  return (
    <div>
      <StoreOption userInfo={userInfo} store={Store.WHName} />
    </div>
  );
}

