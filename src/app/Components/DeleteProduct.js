'use client';

import { useState } from 'react';
import axios from 'axios';
import { Encrypt, plsWait, ErrorMessage, SuccessToast } from '../../../Functions/Mics';
import { EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

const DeleteButton = ({ productId, business, user }) => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);

  const deleteProduct = async () => {
    try {
      setLoading(true);
      plsWait('Deleting Product...');

      const { data } = await axios.delete(
        `${EXPRESS_PRIVATE_URL}/api/Product/Delete/${Encrypt(productId)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
            "idempotency-key": `DELETE-PRODUCT-${productId}`,
          }
        }
      );

      if (data.message) {
        SuccessToast(data.message);
        navigation.back();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      ErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          type="button"
          title="Delete this product"
          aria-label="Delete Product"
        >
          Delete Product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete this product. This action cannot be undone.
            Do you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteProduct} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Proceed'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
