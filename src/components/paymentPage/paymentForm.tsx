import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useMemo, useState } from "react";
import { clearCart } from "../../store/cartSlice";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const me = useAppSelector((state) => state.auth.me);
  const cart = useAppSelector((state) => state.cart.cart);
  const total = useMemo(
    () => cart.items.reduce((acc, item) => acc + item.price * (item.quantity ?? 0), 0),
    [cart.items],
  );

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmPayment = async (): Promise<void> => {
    if (!stripe || !elements) {
      setErrorMessage("A fizetési felület betöltése folyamatban van. Kérlek várj egy pillanatot.");
      return;
    }

    setPaymentProcessing(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orderstatus`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Sikertelen fizetés. Kérlek próbáld újra.");
      setPaymentProcessing(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      navigate("/orderstatus", {
        replace: true,
        state: {
          paymentSuccess: true,
          paidAt: Date.now()
        },
        
      });
      return;
    }
    dispatch(clearCart());
    navigate("/orderstatus", { replace: true });
  };

  const handleCardSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await confirmPayment();
  };

  // const handleExpressCheckoutConfirm = async (): Promise<void> => {
  //   await confirmPayment();
  // };

  return (
    <div className='bg-surface dark:bg-zinc-900 font-display antialiased w-full min-h-[calc(100dvh-8rem)] flex items-center'>
      <div className='mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-8'>
        <div className='grid w-full gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <section className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
            <div className='mb-6 flex items-start justify-between gap-3'>
              <div>
                <h1 className='text-foreground dark:text-white text-2xl font-bold'>Bankkártyás fizetés</h1>
              </div>
              <div className='bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold'>
                Stripe
              </div>
            </div>

            <form onSubmit={handleCardSubmit} className='space-y-4'>
              {/* <div className='rounded-xl border border-gray-200 px-4 py-3 dark:border-zinc-700'>
                <p className='text-muted dark:text-zinc-400 mb-3 text-xs font-medium'>Gyors fizetés</p>
                <ExpressCheckoutElement
                  onConfirm={handleExpressCheckoutConfirm}
                  options={{
                    layout: {
                      maxColumns: 2,
                      maxRows: 1,
                    },
                    buttonType: {
                      applePay: "buy",
                      googlePay: "pay",
                    },
                  }}
                />
                <p className='text-muted dark:text-zinc-500 mt-2 text-xs'>
                  Apple Pay es Google Pay csak tamogatott eszkozokon jelenik meg.
                </p>
              </div> */}

              {/* <div className='relative py-1'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='h-px w-full bg-gray-200 dark:bg-zinc-700' />
                </div>
                <div className='relative flex justify-center'>
                  <span className='text-muted dark:text-zinc-500 bg-white px-2 text-xs dark:bg-zinc-900'>
                    vagy kártyával
                  </span>
                </div>
              </div> */}

              <div className='rounded-xl border border-gray-200 px-4 py-3 dark:border-zinc-700'>
                <p className='text-muted dark:text-zinc-400 mb-3 text-xs font-medium'>Kártya adatok</p>
                <PaymentElement options={{ layout: {radios: "auto",type:"auto", defaultCollapsed:true, spacedAccordionItems:true, visibleAccordionItemsCount:3, paymentMethodLogoPosition:"end" }, wallets: { applePay: "auto", googlePay: "auto" } }} />

              </div>

              {errorMessage ? (
                <div className='border-error-border bg-error/5 text-error rounded-xl border px-3 py-2 text-sm'>
                  {errorMessage}
                </div>
              ) : null}

              <button
                type='submit'
                disabled={!stripe || paymentProcessing}
                className='bg-primary hover:bg-primary-strong h-12 w-full rounded-xl text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-70'>
                {paymentProcessing ? "Fizetés feldolgozása..." : `Fizetés (${total} Ft)`}
              </button>

              <p className='text-muted dark:text-zinc-500 text-center text-xs'>
                A fizetést a Stripe dolgozza fel PCI-kompatibilis biztonsággal.
              </p>
            </form>
          </section>

          <aside className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
            <h2 className='text-foreground dark:text-white text-lg font-bold'>Rendelés összegzés</h2>
            <div className='mt-4 space-y-3'>
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className='flex items-center justify-between gap-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div
                      className='h-10 w-10 shrink-0 rounded-lg bg-gray-200 bg-cover bg-center'
                      style={{ backgroundImage: `url('${item.picture_url ?? ""}')` }}
                    />
                    <div className='min-w-0'>
                      <p className='text-foreground dark:text-white truncate text-sm font-medium'>{item.name}</p>
                      <p className='text-muted dark:text-zinc-400 text-xs'>{item.quantity ?? 0} db</p>
                    </div>
                  </div>
                  <p className='text-foreground dark:text-white text-sm font-semibold'>
                    {item.price * (item.quantity ?? 0)} Ft
                  </p>
                </div>
              ))}
            </div>

            <div className='my-4 h-px bg-gray-200 dark:bg-zinc-700' />

            <div className='flex items-center justify-between'>
              <p className='text-foreground dark:text-white text-base font-bold'>Végösszeg</p>
              <p className='text-foreground dark:text-white text-xl font-bold'>{total} Ft</p>
            </div>

            <Link
              to='/cart'
              className='text-primary mt-5 inline-flex items-center gap-1 text-sm font-semibold hover:none'>
              <span className='material-symbols-outlined text-base'>arrow_back</span>
              Vissza a kosarhoz
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};
export default PaymentForm;
