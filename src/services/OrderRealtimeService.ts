import { echo } from "../lib/echo";

export type OrderRealtimeEvent = {
  order_id?: number | string;
  order_ids?: Array<number | string>;
  order?: unknown;
  orders?: unknown[];
};

type OrderRealtimeSubscriptionOptions = {
  channelName: string;
  onOrderStateChanged?: (event: OrderRealtimeEvent) => void | Promise<void>;
  onAnyOrderEvent?: (eventName: string) => void | Promise<void>;
  onSubscribed?: () => void | Promise<void>;
  onSubscriptionError?: (status: number) => void | Promise<void>;
  onConnectionStateChange?: (state: string) => void | Promise<void>;
};

const runCallback = (callback: (() => void | Promise<void>) | undefined) => {
  if (!callback) return;
  void Promise.resolve(callback()).catch((error) => {
    console.error("Realtime callback failed:", error);
  });
};

const runWithArg = <T,>(
  callback: ((arg: T) => void | Promise<void>) | undefined,
  arg: T,
) => {
  if (!callback) return;
  void Promise.resolve(callback(arg)).catch((error) => {
    console.error("Realtime callback failed:", error);
  });
};

export const subscribeToOrderUpdates = ({
  channelName,
  onOrderStateChanged,
  onAnyOrderEvent,
  onSubscribed,
  onSubscriptionError,
  onConnectionStateChange,
}: OrderRealtimeSubscriptionOptions) => {
  const privateChannel = echo.private(channelName);
  const pusherChannelName = `private-${channelName}`;
  const pusherChannel = echo.connector.pusher.channel(pusherChannelName);
  const connection = echo.connector.pusher.connection;

  const handleOrderStateChanged = (event: OrderRealtimeEvent) => {
    runWithArg(onOrderStateChanged, event);
  };

  const handleAnyOrderEvent = (eventName: string) => {
    if (!eventName.toLocaleLowerCase("hu-HU").includes("order")) {
      return;
    }
    runWithArg(onAnyOrderEvent, eventName);
  };

  const handleSubscriptionSucceeded = () => {
    runCallback(onSubscribed);
  };

  const handleSubscriptionError = (status: number) => {
    runWithArg(onSubscriptionError, status);
  };

  const handleConnectionStateChange = () => {
    runWithArg(onConnectionStateChange, connection.state);
  };

  privateChannel.listen("order.state.changed", handleOrderStateChanged);
  privateChannel.listen(".order.state.changed", handleOrderStateChanged);
  privateChannel.listenToAll(handleAnyOrderEvent);

  pusherChannel?.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
  pusherChannel?.bind("pusher:subscription_error", handleSubscriptionError);
  connection.bind("state_change", handleConnectionStateChange);

  // Push initial connection state so consumers can set badges immediately.
  handleConnectionStateChange();

  return () => {
    privateChannel.stopListening("order.state.changed", handleOrderStateChanged);
    privateChannel.stopListening(".order.state.changed", handleOrderStateChanged);
    privateChannel.stopListeningToAll(handleAnyOrderEvent);

    pusherChannel?.unbind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    pusherChannel?.unbind("pusher:subscription_error", handleSubscriptionError);
    connection.unbind("state_change", handleConnectionStateChange);
    echo.leave(channelName);
  };
};
