'use client'; // for Next.js 13+ with App Router

import Swal from 'sweetalert2';
import axios from 'axios';
import { Encrypt, plsWait } from '../../../Functions/Mics';
import {EXPRESS_PRIVATE_URL} from "../../../Functions/Functions"
import {useState} from "react"
import {useRouter} from 'next/navigation'

const CreateFocButton =  ({ productId, business,user }) => {
  const navigation = useRouter()

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
       const { data } = await axios.post(
        `${EXPRESS_PRIVATE_URL}/api/Clone/Product`,
        {
          PRODUCTID: Encrypt(productId)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(user._id)}`
          }
        }
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
    <span title='Create Free of charge copy for this product' aria-label='Foc' onClick={CreateFoc} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700">
      Create FOC Product
    </span>
  );
};

export default CreateFocButton;
