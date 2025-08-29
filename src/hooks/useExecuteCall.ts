import { DojoCall } from "@dojoengine/core";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import {
  AllowArray,
  Call,
  GetTransactionReceiptResponse,
  InvokeFunctionResponse,
} from "starknet";
import { useDojoSdk } from "./dojo";
import useToast from "./toast";

export const useExecuteCall = () => {
  const { provider } = useDojoSdk();
  const { account } = useAccount();
  const { showError } = useToast();

  const execute = useCallback(
    async (
      callOrCallsOrPromise:
        | AllowArray<Call | DojoCall>
        | Promise<InvokeFunctionResponse>,
      onSuccess?: (r: any) => void
    ) => {
      if (!account) {
        showError(undefined, "Account not connected!");
        return { receipt: undefined };
      }

      let receipt: GetTransactionReceiptResponse;
      let tx;
      try {
        if (
          Object.prototype.toString.call(callOrCallsOrPromise) ===
          "[object Promise]"
        ) {
          tx = await (callOrCallsOrPromise as Promise<InvokeFunctionResponse>);
        } else {
          tx = await provider.execute(
            account,
            callOrCallsOrPromise as AllowArray<Call | DojoCall>,
            "pm"
          );
        }

        receipt = await provider?.provider.waitForTransaction(
          tx.transaction_hash,
          {
            retryInterval: 200,
          }
        );
        checkTxReceipt(receipt);

        onSuccess && onSuccess(receipt);
      } catch (e: any) {
        console.log("execute error:", e);
        showError(undefined, tryBetterErrorMsg(e));
        return { receipt: undefined };
      }

      return { receipt };
    },
    [account]
  );

  return {
    execute,
  };
};

export const tryBetterErrorMsg = (msg: string): string => {
  let betterMsg = msg.toString();

  // tx execution
  const failureReasonIndex = betterMsg.indexOf("Failure reason");
  if (failureReasonIndex > 0) {
    betterMsg = betterMsg.substring(failureReasonIndex);
  }
  const cairoTracebackIndex = betterMsg.indexOf('\\n","transaction_index');
  if (cairoTracebackIndex > -1) {
    betterMsg = betterMsg.substring(0, cairoTracebackIndex);
  }

  const message = betterMsg.replaceAll("\\n", " ");

  const matches = /(?<=\\\")(.*)(?=\\\")/g.exec(message);

  if (matches && matches[0]) {
    return matches[0];
  }
  return message;
};

export function checkTxReceipt(txReceipt: any) {
  if (txReceipt.execution_status !== "SUCCEEDED") {
    throw new Error(txReceipt?.revert_reason || "Error");
  }
}
