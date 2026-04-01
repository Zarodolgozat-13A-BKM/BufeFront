import { useEffect } from "react";
import { echo } from "../lib/echo";
import { useAppSelector } from "../store/hooks";

const PostPaymentPage = () => {
  const me = useAppSelector((state) => state.auth.me)

  useEffect(() => {
    if (!me?.email) {
      return
    }

    const channelName = `ordersOfUser.${me.email}`
    const channel = echo.private(channelName)
    const handleOrderStateChanged = () => {
      // Intentionally no-op for now: this page only needs the subscription side effect.
    }

    channel.listen("order.state.changed", handleOrderStateChanged)

    return () => {
      channel.stopListening("order.state.changed")
      echo.leave(channelName)
    }
  }, [me?.email]);
  
  return (
    <div>PostPaymentPage</div>
  )
}

export default PostPaymentPage