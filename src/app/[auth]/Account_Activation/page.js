"use client"
import { useSearchParams } from 'next/navigation';
import jwt from 'jsonwebtoken'
import Nav1 from '../../Components/Nav1';
import Footer1 from '../../Components/Footer1';
import Image from "next/image";
import { ErrorMessage,SuccessToast,plsWait } from "../../../../Functions/Mics";


const AccountActivation = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('query'); // Extract the 'query' parameter

    const handleSubmit = (e) =>{
        try{
             e.preventDefault();
             plsWait("Activation in progress");
             fetch("/api/Business", {
               method: "PATCH",
               headers: {
                 "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
               },
               body: JSON.stringify({isActive:true}),
             }).then((response) => response.json())
             .then((data)=>{
                if(data.message){
                  SuccessToast('Awsome!🥳. Your account has been Activated')
                   setTimeout(()=>{
                    // Redirect to login or dashboard page
                    window.location.href = "/Login";
                    },5000)
                  
                }else{
                  throw new Error(data.error)
                }

             })


        }catch(err){

        }
    }

  return (
    <>
    <Nav1/>
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-100 px-4 py-8">
      <div className="shadow-md rounded-lg pb-8 max-w-md w-full bg-yellow-600">
        <form className="flex flex-col items-center px-5 sm:px-8" onSubmit={handleSubmit}>
          {token ? (
            <Image height={240} width={400}
            src="/Thank you hanging sign on yellow background for business, marketing, flyers, banners, presentations and posters_ illustration.jpg"
            alt="Logo"
            className="w-full max-w-100 h-48 sm:h-60 mb-4 object-contain"
          />
          ):null}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">
            Account Activation!
          </h1>
          <p className="text-white text-center mb-6">
            {token
                ? "Your account is one click away from been activated!. Once activate, you can log in and enjoy all the features of our community."
                : "Activation token is missing or invalid. Please check your activation link or contact support if you need assistance."}
          </p>
         {token ? (
        <button
            className="bg-emerald-900 text-white px-6 py-3 sm:py-2 rounded-lg shadow-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:bg-emerald-600"
        >
            Activate Account
        </button>
        ) : null}

        </form>
      </div>
    </div>
    <Footer1/>
    </>
  );
};

export default AccountActivation;