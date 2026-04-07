import { useMemo } from "react";
import {
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Link, useLocation } from "react-router";
import { getResolvedTheme, getThemePreference } from "../services/themeService";
import PaymentForm from "../components/paymentPage/paymentForm";
import { GetStripeKey } from "../services/OrderService";

type PaymentLocationState = {
  clientSecret?: string;
};

const stripePromise = loadStripe(await GetStripeKey());

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
      <div className='bg-secondary dark:bg-secondary-dark flex items-center justify-center p-4'>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900'>
          <h2 className='text-foreground dark:text-white text-xl font-bold'>Nincs aktív fizetés</h2>
          <p className='text-muted dark:text-zinc-400 mt-2 text-sm'>
            Először véglegesítsd a rendelést, hogy elinduljon a fizetés.
          </p>
          <Link
            to='/cart'
            className='bg-primary hover:bg-primary-strong mt-4 inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-white'>
            Ugrás a kosárhoz
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
