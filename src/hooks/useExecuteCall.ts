import { DojoCall, DojoProvider } from "@dojoengine/core";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import {
  AllowArray,
  Call,
  GetTransactionReceiptResponse,
  InvokeFunctionResponse,
  RpcProvider,
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
        showError("Not Connected", "Please connect your account");
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
            "nums"
          );
        }

        // receipt = await provider?.provider.waitForTransaction(
        //   tx.transaction_hash,
        //   {
        //     retryInterval: 500,
        //     successStates: ["PRE_CONFIRMED", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
        //   }
        // );

        // @ts-ignore
        receipt = await waitForTransaction(
          provider.provider,
          tx.transaction_hash,
          5
        );

        checkTxReceipt(receipt);

        onSuccess && onSuccess(receipt);
      } catch (e: any) {
        console.log(e);
        if (e.message) {
          showError("Execution Error", tryBetterErrorMsg(e.message));
        } else {
          showError("Execution Error", tryBetterErrorMsg(e));
        }
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

export const waitForTransaction = async (
  provider: RpcProvider,
  txHash: string,
  maxRetry: number
) => {
  let receipt = undefined;
  while (maxRetry > 0) {
    try {
      receipt = await provider.waitForTransaction(txHash, {
        retryInterval: 200,
        successStates: ["PRE_CONFIRMED", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
      });
      return receipt;
    } catch (e) {
      console.log("waitForTransaction error", maxRetry, e);
      if (maxRetry === 0) {
        throw e;
      }
    }

    maxRetry -= 1;
  }
  return undefined
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
