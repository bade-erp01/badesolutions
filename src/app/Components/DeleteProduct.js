'use client'; // for Next.js 13+ with App Router

import Swal from 'sweetalert2';
import axios from 'axios';
import { Encrypt, plsWait } from '../../../Functions/Mics';
import {EXPRESS_PRIVATE_URL} from "../../../Functions/Functions"
import {useState} from "react"
import {useRouter} from 'next/navigation'

const DeleteButton =  ({ productId, business,user }) => {
  const navigation = useRouter()

  const CreateFoc = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action can not be reversed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
      });

      if (result.isConfirmed) {
        plsWait('Deleting Product...')
       const { data } = await axios.delete(
        `${EXPRESS_PRIVATE_URL}/api/Product/Delete/${Encrypt(productId)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(user._id)}`
          }
        }
      );

        if(data.message){
            Swal.fire('Deleted!', 'Product has been successfully Deleted.', 'success');
            navigation.back()
        }else{
            throw new Error(data.error)
        }

      } else {
        Swal.fire('Cancelled', 'Delete Operation cancelled.', 'info');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  };

  return (
    <span title='Delete this product' onClick={CreateFoc} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-orange-700">
      Delete Product
    </span>
  );
};

export default DeleteButton;
