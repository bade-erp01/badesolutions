'use client';

import { useState } from 'react';
import api from "@/lib/api";
import { plsWait, ErrorMessage, SuccessToast } from '../../../Functions/Mics';
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
import { Loader2 } from "lucide-react"; // shadcn/ui uses lucide-react icons

const CreateFocButton = ({ productId, business, user }) => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);

  const CreateFoc = async () => {
    try {
      setLoading(true);
      plsWait('Creating FOC copy...');

      const r = await api.post(
        "/api/Clone/Product",
        { PRODUCTID: productId },
        {
          headers: {
            "idempotency-key": `FOC-CLONE-${productId}`,
          }
        }
      );
      if (!r.ok) throw new Error(r.error);
      const data = r.data || {};

      if (data.message) {
        SuccessToast(data.message);
        navigation.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
      navigation.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          type="button"
          title="Create Free of charge copy for this product"
          aria-label="Foc"
        >
          Create FOC Product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm FOC Creation</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to create a Free of Charge (FOC) copy for this product.
            This action is irreversible once completed. Do you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={CreateFoc} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {loading ? 'Processing...' : 'Proceed'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateFocButton;
