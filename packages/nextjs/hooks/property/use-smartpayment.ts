import { RentToOwnABI } from "@/abi/RentToOwn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { erc20ABI, useAccount, useContractWrite, useWaitForTransaction, useContractRead } from "wagmi";

type UseSmartRentPaymentProps = {
  rentFiatAmount: number;
  propertyId: number;
  paymentTokenAddress: `0x${string}`;
  rentContractAddress: `0x${string}`;
  tokenDecimals?: number;
};

export const useSmartRentPayment = ({
  rentFiatAmount,
  propertyId,
  paymentTokenAddress,
  rentContractAddress,
  tokenDecimals = 18, // Default to 18 decimals
}: UseSmartRentPaymentProps) => {
  const { address } = useAccount();
  const [convertedAmount, setConvertedAmount] = useState<bigint | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  
  // 1. Add allowance check
  const { data: currentAllowance, refetch: refetchAllowance } = useContractRead({
    address: paymentTokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, rentContractAddress],
    enabled: !!address,
  });

  // 2. Convert amount (simplified)
  useEffect(() => {
    // Actual conversion logic would go here
    setConvertedAmount(parseUnits(rentFiatAmount.toString(), tokenDecimals));
    setIsReady(true);
  }, [rentFiatAmount, tokenDecimals]);

  // 3. Approval transaction
  const { 
    write: approve, 
    isLoading: isApproving,
    data: approveTx 
  } = useContractWrite({
    address: paymentTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [rentContractAddress, convertedAmount || BigInt(0)],
  });

  // 4. Payment transaction
  const { 
    write: payRent, 
    isLoading: isPaying,
    data: payRentTx 
  } = useContractWrite({
    address: rentContractAddress,
    abi: RentToOwnABI,
    functionName: "payRent",
    args: [propertyId, convertedAmount || BigInt(0)],
  });

  // 5. Track approval success -> trigger payment
  useWaitForTransaction({
    hash: approveTx?.hash,
    onSuccess: async () => {
      toast.success("Approval confirmed");
      // console.log(currentAllowance)
      // console.log(convertedAmount)
      
      // Refresh allowance
      await refetchAllowance();
      
      // Execute payment
      payRent();
    },
    onError: (err) => {
      setError("Approval failed: " + err.message);
    }
  });

  // 6. Track payment success
  useWaitForTransaction({
    hash: payRentTx?.hash,
    onSuccess: () => {
      toast.success("Rent payment successful");
      router.refresh()

      setError(null);
    },
    onError: (err) => {
      setError("Payment failed: " + err.message);
    }
  });

  // 7. Fixed executor
  const executePayment = useCallback(() => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    
    if (!convertedAmount) {
      toast.error("Amount not ready");
      return;
    }

    // Check if approval is needed
    if (currentAllowance && currentAllowance >= convertedAmount) {
      console.log(currentAllowance, "currentAllowance")
      console.log(convertedAmount, "convertedAmount")
      // Direct payment if already approved
      payRent();
    } else {
      // Request approval first
      approve();
    }
  }, [address, convertedAmount, currentAllowance, payRent, approve]);

  return {
    isApproving,
    isPaying,
    isLoading: isApproving || isPaying,
    error,
    executePayment,
  };
};