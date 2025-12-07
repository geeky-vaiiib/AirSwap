/**
 * Server-Side Integration for OxygenCredits Smart Contract
 * 
 * This module provides backend functions to interact with the
 * OxygenCredits ERC-1155 contract securely from Next.js API routes.
 * 
 * IMPORTANT: Never expose private keys or admin credentials to the frontend!
 */

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains";

// Environment validation
if (!process.env.NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT) {
  throw new Error("NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT is not set");
}

if (!process.env.WALLET_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is not set (required for transaction signing)");
}

if (!process.env.THIRDWEB_SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY is not set (required for IPFS and API operations)");
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

// Types
export interface ServerMintParams {
  recipientAddress: string;
  amount: number;
  ndviDelta: number;
  claimId: string;
  location: string;
  verificationData?: any;
}

export interface MintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Initialize ThirdwebSDK with server credentials
 * NEVER use this on the client side!
 */
const getServerSDK = () => {
  return ThirdwebSDK.fromPrivateKey(
    WALLET_PRIVATE_KEY,
    PolygonAmoyTestnet,
    {
      secretKey: THIRDWEB_SECRET_KEY,
    }
  );
};

/**
 * Upload metadata to IPFS using thirdweb storage
 * @param metadata - Metadata object to upload
 * @returns IPFS URI
 */
const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  try {
    const sdk = getServerSDK();
    const storage = sdk.storage;
    
    const uri = await storage.upload(metadata);
    
    return uri;
  } catch (error: any) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

/**
 * Mint oxygen credits from server (for verified claims)
 * This function should be called after claim verification is complete
 * 
 * @param params - Minting parameters
 * @returns Mint result with transaction details
 */
export const serverMintOxygenCredits = async (
  params: ServerMintParams
): Promise<MintResult> => {
  try {
    // Validate parameters
    if (!params.recipientAddress || params.recipientAddress.length !== 42) {
      throw new Error("Invalid recipient address");
    }
    
    if (params.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    if (!params.claimId) {
      throw new Error("Claim ID is required");
    }
    
    // Prepare metadata for IPFS
    const metadata = {
      name: `Oxygen Credit #${params.claimId}`,
      description: `Oxygen credits generated from verified NDVI improvement`,
      image: "ipfs://QmYourDefaultImage", // Replace with actual image
      attributes: [
        {
          trait_type: "NDVI Delta",
          value: params.ndviDelta / 1000,
          display_type: "number",
        },
        {
          trait_type: "Claim ID",
          value: params.claimId,
        },
        {
          trait_type: "Location",
          value: params.location,
        },
        {
          trait_type: "Verification Date",
          value: new Date().toISOString(),
          display_type: "date",
        },
      ],
      properties: {
        ndviDelta: params.ndviDelta,
        claimId: params.claimId,
        location: params.location,
        verificationData: params.verificationData,
      },
    };
    
    // Upload metadata to IPFS
    const metadataURI = await uploadMetadataToIPFS(metadata);
    
    // Initialize SDK and contract
    const sdk = getServerSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    // Mint credits
    const result = await contract.call("mintCredits", [
      params.recipientAddress,
      params.amount,
      params.ndviDelta,
      params.claimId,
      params.location,
      metadataURI,
    ]);
    
    // Extract token ID from events
    const event = result.receipt.events?.find(
      (e: any) => e.event === "CreditsMinted"
    );
    
    const tokenId = event?.args?.tokenId?.toString();
    
    console.log(`✅ Successfully minted ${params.amount} credits to ${params.recipientAddress}`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   TX Hash: ${result.receipt.transactionHash}`);
    
    return {
      success: true,
      tokenId,
      transactionHash: result.receipt.transactionHash,
    };
  } catch (error: any) {
    console.error("❌ Error minting credits:", error);
    
    return {
      success: false,
      error: error.message || "Failed to mint credits",
    };
  }
};

/**
 * Check if the server wallet has verifier role
 * @returns True if server has verifier role
 */
export const serverHasVerifierRole = async (): Promise<boolean> => {
  try {
    const sdk = getServerSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    const serverAddress = await sdk.getSigner()?.getAddress();
    if (!serverAddress) {
      throw new Error("Could not get server address");
    }
    
    const VERIFIER_ROLE = await contract.call("VERIFIER_ROLE");
    const hasRole = await contract.call("hasRole", [VERIFIER_ROLE, serverAddress]);
    
    return hasRole;
  } catch (error: any) {
    console.error("Error checking verifier role:", error);
    return false;
  }
};

/**
 * Get credit metadata from blockchain
 * @param tokenId - Token ID to query
 * @returns Credit metadata
 */
export const serverGetCreditMetadata = async (tokenId: string) => {
  try {
    const sdk = getServerSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    const metadata = await contract.call("getCreditMetadata", [tokenId]);
    
    return {
      ndviDelta: metadata.ndviDelta.toString(),
      claimId: metadata.claimId,
      location: metadata.location,
      verificationDate: metadata.verificationDate.toString(),
      metadataURI: metadata.metadataURI,
    };
  } catch (error: any) {
    console.error("Error fetching credit metadata:", error);
    throw new Error("Failed to fetch credit metadata");
  }
};

/**
 * Verify that a claim has been minted on blockchain
 * @param claimId - MongoDB claim ID
 * @returns Token ID if found, null otherwise
 */
export const verifyClaimMinted = async (
  claimId: string
): Promise<string | null> => {
  try {
    const sdk = getServerSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    // Get CreditsMinted events
    const events = await contract.events.getEvents("CreditsMinted");
    
    // Find event matching this claim ID
    const matchingEvent = events.find(
      (event: any) => event.data.claimId === claimId
    );
    
    return matchingEvent?.data.tokenId?.toString() || null;
  } catch (error: any) {
    console.error("Error verifying claim minted:", error);
    return null;
  }
};

/**
 * Get total credits minted across all tokens
 * @returns Total supply
 */
export const getTotalCreditsMinted = async (): Promise<number> => {
  try {
    const sdk = getServerSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    // Get all CreditsMinted events
    const events = await contract.events.getEvents("CreditsMinted");
    
    // Sum up all amounts
    const total = events.reduce((sum: number, event: any) => {
      return sum + Number(event.data.amount || 0);
    }, 0);
    
    return total;
  } catch (error: any) {
    console.error("Error getting total credits:", error);
    return 0;
  }
};

/**
 * Example: Integration with claim verification workflow
 * Call this function after NDVI verification succeeds
 */
export const integrateWithClaimVerification = async (claim: any) => {
  try {
    // Calculate credits based on NDVI improvement
    const ndviDelta = claim.verification?.ndviImprovement || 0;
    const creditsToMint = Math.floor(ndviDelta * 100); // 100 credits per 1.0 NDVI improvement
    
    if (creditsToMint <= 0) {
      throw new Error("No credits to mint - NDVI improvement too low");
    }
    
    // Prepare location data
    const location = JSON.stringify({
      type: "Feature",
      geometry: claim.geometry,
      properties: {
        address: claim.location?.address,
        city: claim.location?.city,
        state: claim.location?.state,
      },
    });
    
    // Mint credits
    const result = await serverMintOxygenCredits({
      recipientAddress: claim.walletAddress,
      amount: creditsToMint,
      ndviDelta: Math.floor(ndviDelta * 1000), // Scale by 1000
      claimId: claim._id.toString(),
      location,
      verificationData: {
        beforeNDVI: claim.verification?.beforeNDVI,
        afterNDVI: claim.verification?.afterNDVI,
        improvementPercentage: claim.verification?.improvementPercentage,
        verifiedAt: claim.verification?.verifiedAt,
        verifier: claim.verification?.verifier,
      },
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log(`✅ Minted ${creditsToMint} credits for claim ${claim._id}`);
    
    return {
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      creditsMinted: creditsToMint,
    };
  } catch (error: any) {
    console.error("Error integrating with claim verification:", error);
    throw error;
  }
};

// Export contract address for reference
export { CONTRACT_ADDRESS };
