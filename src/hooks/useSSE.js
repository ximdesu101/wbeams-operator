import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useSSE({
  endpoint,
  token,
  getToken,
  onUpdate,
  onError,
  enabled = true,
  reconnectAttempts = Infinity,
  initialBackoff = 1000,
  maxBackoff = 30000,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastError, setLastError] = useState(null);

  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const tokenRef = useRef(token);
  const getTokenRef = useRef(getToken);

  onUpdateRef.current = onUpdate;
  onErrorRef.current = onError;
  tokenRef.current = token;
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!endpoint || !enabled) {
      return;
    }

    const controller = new AbortController();

    let reconnectTimer = null;
    let retryCount = 0;

    const connect = async () => {
      try {
        const authToken =
          tokenRef.current ??
          (typeof getTokenRef.current === "function" ? getTokenRef.current() : null);

        if (!authToken) {
          const error = new Error("Authentication token not found.");
          error.code = "NO_TOKEN";
          throw error;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = new Error(`SSE connection failed (${response.status})`);
          error.status = response.status;
          throw error;
        }

        if (!response.body) {
          throw new Error("ReadableStream is not supported.");
        }

        retryCount = 0;

        setIsConnected(true);
        setIsReconnecting(false);
        setLastError(null);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";

          for (const message of messages) {
            if (!message.trim()) continue;

            let event = "message";
            let data = null;

            for (const line of message.split("\n")) {
              if (line.startsWith(":")) {
                // Heartbeat comment
                continue;
              }

              if (line.startsWith("event:")) {
                event = line.slice(6).trim();
              }

              if (line.startsWith("data:")) {
                try {
                  data = JSON.parse(line.slice(5).trim());
                } catch (e) {
                  console.error("Invalid SSE payload:", e);
                }
              }
            }

            if (data !== null) {
              onUpdateRef.current?.({
                event,
                data,
              });
            }
          }
        }

        if (!controller.signal.aborted) {
          throw new Error("SSE connection closed.");
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("SSE:", error);

        setIsConnected(false);
        setIsReconnecting(true);
        setLastError(error);

        onErrorRef.current?.(error);

        if (error.status === 401 || error.status === 403) {
          setIsReconnecting(false);
          return;
        }

        if (retryCount >= reconnectAttempts) {
          setIsReconnecting(false);
          return;
        }

        const delay = Math.min(
          initialBackoff * Math.pow(2, retryCount),
          maxBackoff
        );

        retryCount++;

        reconnectTimer = setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      controller.abort();

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      setIsConnected(false);
      setIsReconnecting(false);
    };
  }, [endpoint, enabled]);

  return {
    isConnected,
    isReconnecting,
    lastError,
  };
}