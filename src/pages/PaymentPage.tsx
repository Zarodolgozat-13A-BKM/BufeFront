import { useMemo } from "react";
import {
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Link, useLocation } from "react-router";
import { getResolvedTheme, getThemePreference } from "../services/themeService";
import PaymentForm from "../components/paymentPage/paymentForm";

type PaymentLocationState = {
  clientSecret?: string;
};

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
    "pk_test_51TA3EGGgiPPFOSXmor9Q8gLotODmBE2VNMgzMlVbpwybuCBNJCLxewp0FEd90cgZi9WnczQXqmRhYnI8Lsv0Vs7b00Vsijv7hr",
);



const PaymentPage = () => {
  const location = useLocation();
  const state = (location.state as PaymentLocationState | null) ?? null;
  const clientSecret = state?.clientSecret?.trim() ?? "";
  const resolvedTheme = getResolvedTheme(getThemePreference());


  const elementsOptions = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret,
      appearance: {
        theme: resolvedTheme === "dark" ? "night" : "stripe",
      },
    }),
    [clientSecret, resolvedTheme],
  );

  if (!clientSecret) {
    return (
      <div className='bg-background-light dark:bg-background-dark flex items-center justify-center p-4'>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900'>
          <h2 className='text-text-dark dark:text-white text-xl font-bold'>Nincs aktiv fizetes</h2>
          <p className='text-text-light dark:text-zinc-400 mt-2 text-sm'>
            Először véglegesítsd a rendelést, hogy elinduljon a fizetés.
          </p>
          <Link
            to='/checkout'
            className='bg-primary hover:bg-primary-hover mt-4 inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-white'>
            Ugrás a pénztárhoz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm />
    </Elements>
  );
};

export default PaymentPage;