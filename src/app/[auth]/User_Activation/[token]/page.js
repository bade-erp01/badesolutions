"use client"

export default function Page({ message, error }) {

    return (
        <div className="min-h-dvh bg-gray-300 flex items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            {/* Main card */}
            <div className="relative z-10 bg-white shadow-2xl p-6 sm:p-8 md:p-12 max-w-md w-full backdrop-blur-xl border border-gray-100">
                
                {message ? (
                    <>
                        {/* Success Icon */}
                        <div className="flex justify-center mb-8 animate-bounce">
                            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-5 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>
                        </div>

                        {/* Success Content */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">Account Activated!</h1>
                        <p className="text-gray-600 text-center mb-8 leading-relaxed text-sm break-words">{message}</p>
                        <p className="text-gray-500 text-xs text-center mt-6">
                            ✓ You account is now active. We sent you a password reset link to your email. Kindly reset your Password to proceed.
                        </p>
                    </>
                ) : error ? (
                    <>
                        {/* Error Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-full p-5 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">Activation Failed</h1>
                        <p className="text-red-600 text-center mb-8 text-sm break-words">{error}</p>
                    </>
                ) : null}
            </div>
        </div>
    );
}