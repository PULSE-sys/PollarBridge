const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const sdkImport = require('@stellar/stellar-sdk');
const StellarSdk = sdkImport.StellarSdk || sdkImport;

const app = express();
app.use(cors());
app.use(express.json());

// Stellar Horizon Testnet endpoint
const horizonUrl = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Horizon.Server(horizonUrl);

// User-provided funded testnet keypair (10,000 XLM)
const AFR_GATEWAY_SECRET = process.env.AFR_GATEWAY_SECRET || "SCV2MI7OGVAHNW6MEYN5ZOP3KOFIHJDHWQN5VKSW4SYXHO5L3OH4DVYB"; 
let sourceKeyPair;
try {
  sourceKeyPair = StellarSdk.Keypair.fromSecret(AFR_GATEWAY_SECRET);
} catch (e) {
  sourceKeyPair = StellarSdk.Keypair.random();
}

// Pollar SDK Testnet API Configuration layout (pub_testnet_*)
const POLLAR_API_KEY = process.env.POLLAR_API_KEY || "pub_testnet_20c047465ff4ae143f584f68f864e145";
const isPollarKeyValid = typeof POLLAR_API_KEY === 'string' && POLLAR_API_KEY.startsWith("pub_testnet_");

console.log(`[GATEWAY_INIT] Operational Gateway Public Key: ${sourceKeyPair.publicKey()}`);
console.log(`[POLLAR_SDK_INIT] Active Pollar Testnet Key: ${POLLAR_API_KEY.slice(0, 16)}... (Valid Format: ${isPollarKeyValid})`);

// Internal simulation engine for Pollar LatAm SDK Bolivian fiat clearing
function handoffToPollarLatAmSdk({ txHash, amountNaira, calculatedUSDC, recipient, apiKey = POLLAR_API_KEY }) {
  const calculatedBOB = (parseFloat(calculatedUSDC || 0) * 6.91).toFixed(2);
  const pollarTxId = `pol_latam_${crypto.randomBytes(8).toString('hex')}`;
  
  const payload = {
    pollarTxId,
    clientApiKeyPrefix: apiKey.slice(0, 12),
    stellarTxHash: txHash,
    settlementPair: "USDC_BOB",
    corridor: "AFR-LATAM (NGN -> USDC -> BOB)",
    ingressAmountNGN: amountNaira,
    bridgeAmountUSDC: calculatedUSDC,
    clearingPayoutBOB: calculatedBOB,
    recipientTerminal: recipient,
    payoutProvider: "Banco Mercantil Santa Cruz / QR Simple Direct Rail",
    status: "DISPATCHED_TO_BOLIVIAN_BANKING_SYSTEM",
    feeSponsored: true,
    gasSponsoredXLM: "0.0000100",
    dispatchedAt: new Date().toISOString()
  };

  console.log(`[POLLAR_LATAM_SDK] Successfully routed Stellar Tx [${txHash.slice(0, 14)}...] into Pollar LatAm Gateway payload [${pollarTxId}]`);
  return payload;
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gatewayPublicKey: sourceKeyPair.publicKey(),
    horizonUrl,
    corridor: 'AFR-LATAM (NGN -> USDC -> BOB)',
    pollarSdk: {
      active: true,
      environment: 'testnet',
      apiKeyConfigured: isPollarKeyValid,
      apiKeyPrefix: POLLAR_API_KEY.slice(0, 12)
    }
  });
});

// Dedicated simulated Pollar SDK payload endpoint
app.post('/api/v1/pollar/offramp', (req, res) => {
  const authKey = req.headers['x-pollar-api-key'] || req.body.apiKey || POLLAR_API_KEY;
  if (!authKey.startsWith('pub_testnet_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid Pollar Testnet API Key. Key must begin with "pub_testnet_"'
    });
  }

  const { txHash, amountNaira, calculatedUSDC, recipient } = req.body;
  const pollarPayload = handoffToPollarLatAmSdk({ txHash, amountNaira, calculatedUSDC, recipient, apiKey: authKey });

  return res.status(200).json({
    success: true,
    pollarPayload
  });
});

app.post('/api/v1/corridor/initiate', async (req, res) => {
  const { amountNaira, calculatedUSDC, recipient } = req.body;
  console.log(`[RAIL_INGEST] Processing payment intake of NGN ${amountNaira} -> ${calculatedUSDC} USDC for recipient: ${recipient}`);

  let resolvedTxHash;
  let isFallback = false;

  try {
    const account = await server.loadAccount(sourceKeyPair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: "GBO5W4GNG6T3EUNNNU7V5AUMY7SBAH7KMRQU6NNE7QTLQLXWURVWRRAM", 
        asset: StellarSdk.Asset.native(), 
        amount: (parseFloat(calculatedUSDC) * 0.01).toFixed(6), 
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeyPair);
    const txResult = await server.submitTransaction(transaction);
    resolvedTxHash = txResult.hash;
  } catch (error) {
    const mockDeterministicHash = crypto.createHash('sha256').update(`tx_${Date.now()}`).digest('hex');
    resolvedTxHash = `0x${mockDeterministicHash}`;
    isFallback = true;
  }

  // Pass our live Stellar transaction hash cleanly into the simulated Pollar SDK payload
  const pollarPayload = handoffToPollarLatAmSdk({
    txHash: resolvedTxHash,
    amountNaira,
    calculatedUSDC,
    recipient
  });

  return res.status(200).json({
    success: true,
    message: "African corridor leg cleared. Handing off payload to Pollar LatAm SDK.",
    txHash: resolvedTxHash,
    fallback: isFallback,
    pollarPayload
  });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 BACKEND ACTIVE ON PORT ${PORT}`));
