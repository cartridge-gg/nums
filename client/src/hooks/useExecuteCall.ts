import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import type {
  AllowArray,
  Call,
  GetTransactionReceiptResponse,
  InvokeFunctionResponse,
  RpcProvider,
} from "starknet";
import useToast from "./toast";

/**
 * Execute a promise with a timeout
 * @param promise - The promise to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Error message if timeout occurs
 */
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

export const useExecuteCall = () => {
  const { account } = useAccount();
  const { showError } = useToast();

  const execute = useCallback(
    async (
      calls: AllowArray<Call>,
      onSuccess?: (r: GetTransactionReceiptResponse) => void,
    ): Promise<{
      success: boolean;
      receipt?: GetTransactionReceiptResponse;
    }> => {
      if (!account) {
        showError("Not Connected", "Please connect your account");
        return { success: false };
      }

      let receipt: GetTransactionReceiptResponse;
      let tx: InvokeFunctionResponse;
      try {
        // Execute the transaction with timeout (30 seconds)
        tx = await executeWithTimeout(
          account.execute(calls),
          10000, // 10 seconds timeout
          "Transaction request timed out. Please try again.",
        );

        // Wait for transaction confirmation
        receipt = await account.waitForTransaction(tx.transaction_hash, {
          retryInterval: 200,
          successStates: ["PRE_CONFIRMED", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
        });

        // Check if transaction succeeded
        checkTxReceipt(receipt);

        // Call success callback if provided
        onSuccess?.(receipt);
        return { success: true, receipt };
      } catch (e: any) {
        console.log(e);
        if (e.message) {
          showError("Execution Error", tryBetterErrorMsg(e.message));
        } else {
          showError("Execution Error", tryBetterErrorMsg(e));
        }
        return { success: false };
      }
    },
    [account, showError],
  );

  return {
    execute,
  };
};

export const waitForTransaction = async (
  provider: RpcProvider,
  txHash: string,
  maxRetry: number,
): Promise<GetTransactionReceiptResponse> => {
  while (maxRetry > 0) {
    try {
      const receipt = await provider.waitForTransaction(txHash, {
        retryInterval: 200,
        successStates: ["PRE_CONFIRMED", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
      });
      return receipt;
    } catch (e) {
      console.log("waitForTransaction error", maxRetry, e);
      if (maxRetry === 1) {
        throw e;
      }
    }

    maxRetry -= 1;
  }

  throw new Error("Transaction failed after max retries");
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

  const message = betterMsg.replace(/\\n/g, " ");

  const matches = /(?<=\\")(.*)(?=\\")/g.exec(message);

  if (matches?.[0]) {
    return matches[0];
  }
  return message;
};

export function checkTxReceipt(txReceipt: GetTransactionReceiptResponse) {
  // Check if receipt has execution_status (SuccessfulTransactionReceiptResponse)
  if ("execution_status" in txReceipt) {
    if (txReceipt.execution_status !== "SUCCEEDED") {
      const revertReason =
        "revert_reason" in txReceipt ? txReceipt.revert_reason : undefined;
      throw new Error(revertReason || "Transaction execution failed");
    }
  }
}
