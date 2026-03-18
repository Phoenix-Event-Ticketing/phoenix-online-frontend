 "use client";
 
 import { useEffect, useMemo, useState } from "react";
 import { useRouter } from "next/navigation";
 import { useSignInMutation, useSignUpMutation } from "@/store/api";
 
 type Mode = "signin" | "signup";
 
 export function AuthModal({ mode, onClose }: { mode: Mode; onClose: () => void }) {
   const router = useRouter();
   const [tab, setTab] = useState<Mode>(mode);
 
   useEffect(() => setTab(mode), [mode]);
 
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
 
   const [signIn, signInState] = useSignInMutation();
   const [signUp, signUpState] = useSignUpMutation();
 
   const isLoading = tab === "signin" ? signInState.isLoading : signUpState.isLoading;
   const error = tab === "signin" ? signInState.error : signUpState.error;
   const success = tab === "signup" ? signUpState.isSuccess : false;
 
   const title = useMemo(() => (tab === "signin" ? "Sign in" : "Sign up"), [tab]);
 
   return (
     <div
       className="fixed inset-0 z-60 flex items-center justify-center p-4"
       role="dialog"
       aria-modal="true"
       aria-label={title}
       onMouseDown={(e) => {
         if (e.target === e.currentTarget) onClose();
       }}
     >
       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 
       <div className="relative w-full max-w-md">
         <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
           <div className="flex items-start justify-between gap-4">
             <div>
               <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                 {title}
               </h2>
               <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                 {tab === "signin"
                   ? "Use your account to access the demo."
                   : "Create an account for the demo."}
               </p>
             </div>
             <button
               type="button"
               onClick={onClose}
               className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
               aria-label="Close"
             >
               ✕
             </button>
           </div>
 
           <div className="mt-5 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
             <button
               type="button"
               onClick={() => setTab("signin")}
               className={[
                 "flex-1 rounded-md px-3 py-2 font-medium transition-colors",
                 tab === "signin"
                   ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                   : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
               ].join(" ")}
             >
               Sign in
             </button>
             <button
               type="button"
               onClick={() => setTab("signup")}
               className={[
                 "flex-1 rounded-md px-3 py-2 font-medium transition-colors",
                 tab === "signup"
                   ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                   : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
               ].join(" ")}
             >
               Sign up
             </button>
           </div>
 
           <form
             className="mt-5 space-y-4"
             onSubmit={async (e) => {
               e.preventDefault();
               if (tab === "signin") {
                 await signIn({ email, password }).unwrap();
                 onClose();
                 router.refresh();
                 return;
               }
               await signUp({ name: name || undefined, email, password }).unwrap();
             }}
           >
             {tab === "signup" ? (
               <label className="block">
                 <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                   Name (optional)
                 </span>
                 <input
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   type="text"
                   autoComplete="name"
                   className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
                 />
               </label>
             ) : null}
 
             <label className="block">
               <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                 Email
               </span>
               <input
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 type="email"
                 autoComplete="email"
                 required
                 className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
               />
             </label>
 
             <label className="block">
               <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                 Password
               </span>
               <input
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 type="password"
                 autoComplete={tab === "signin" ? "current-password" : "new-password"}
                 required
                 className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
               />
             </label>
 
             {success ? (
               <p className="text-sm text-emerald-700 dark:text-emerald-400">
                 Account created. You can now sign in.
               </p>
             ) : error ? (
               <p className="text-sm text-red-600">
                 {tab === "signin"
                   ? "Sign-in failed. Please check your credentials."
                   : "Sign-up failed. Please try again."}
               </p>
             ) : null}
 
             <button
               type="submit"
               disabled={isLoading}
               className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
             >
               {tab === "signin"
                 ? isLoading
                   ? "Signing in..."
                   : "Sign in"
                 : isLoading
                   ? "Creating account..."
                   : "Create account"}
             </button>
           </form>
         </div>
       </div>
     </div>
   );
 }
