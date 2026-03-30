import { useEffect } from "react";
import { echo } from "../lib/echo";
import { useAppSelector } from "../store/hooks";

const PostPaymentPage = () => {
  useEffect(() => {
        const me = useAppSelector((state)=> state.auth.me)
          echo.private(`ordersOfUser.${me?.email}`).listen("order.state.changed", (e: any) => {});
      
    }, []);
  
  return (
    <div>PostPaymentPage</div>
  )
}

export default PostPaymentPage