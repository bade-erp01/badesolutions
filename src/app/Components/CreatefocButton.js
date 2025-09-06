'use client'; // for Next.js 13+ with App Router

import Swal from 'sweetalert2';
import axios from 'axios';
import { Encrypt, plsWait } from '../../../Functions/Mics';
import {useState} from "react"
import {useRouter} from 'next/navigation'

const CreateFocButton =  ({ productId, business }) => {
  const navigation = useRouter()
    const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${business.tenantId}`,
    "X-Requested-With": "XMLHttpRequest",
  });

  const CreateFoc = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to create FCO for this product?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, create it!',
        cancelButtonText: 'No, cancel',
      });

      if (result.isConfirmed) {
        plsWait('Creating FOC copy...')
        const {data} = await axios.post(`http://localhost:3001/${business.companyName}/Clone/Product`, {
          PRODUCTID: Encrypt(productId),
          headers
        },
      );

        if(data.message){
            Swal.fire('Created!', 'FCO has been successfully created.', 'success');
            navigation.refresh()
        }else{
            throw new Error(data.error)
        }

      } else {
        Swal.fire('Cancelled', 'FCO creation was cancelled.', 'info');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong while creating FCO.', 'error');
    }
  };

  return (
    <span onClick={CreateFoc} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
      Create FOC
    </span>
  );
};

export default CreateFocButton;
