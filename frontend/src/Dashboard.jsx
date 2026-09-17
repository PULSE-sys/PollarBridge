import React, { useState } from 'react';
import { PollarProvider, usePollar, WalletButton } from '@pollar/react';
import '@pollar/react/styles.css';

const EXCH_RATE_NGN_TO_USDC = 0.00062;
const EXCH_RATE_USDC_TO_BOB = 6.91;

function DashboardContent() {
  const [senderName, setSenderName] = useState('');
  const [amountNaira, setAmountNaira] = useState('50000');
  const [bolivianReceiver, setBolivianReceiver] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStep, setTxStep] = useState('idle'); 
  const [txHash, setTxHash] = useState(null);
  const [pollarPayload, setPollarPayload] = useState(null);

  // Official Pollar React Authentication & Lifecycle Hooks
  const { isAuthenticated, wallet, openLoginModal, openKycModal, openRampModal, logout } = usePollar();

  const calculatedUSDC = (parseFloat(amountNaira || 0) * EXCH_RATE_NGN_TO_USDC).toFixed(2);
  const calculatedBOB = (calculatedUSDC * EXCH_RATE_USDC_TO_BOB).toFixed(2);

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    if (!senderName || !amountNaira || !bolivianReceiver) return;
    setIsProcessing(true);
    setTxStep('local_rail');
    await new Promise(r => setTimeout(r, 1500));

    setTxStep('stellar_swap');
    try {
      const response = await fetch('http://localhost:5001/api/v1/corridor/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-pollar-api-key': 'pub_testnet_20c047465ff4ae143f584f68f864e145'
        },
        body: JSON.stringify({ amountNaira, calculatedUSDC, recipient: bolivianReceiver })
      });
      const data = await response.json();
      if (data.txHash) {
        setTxHash(data.txHash);
        if (data.pollarPayload) {
          setPollarPayload(data.pollarPayload);
        }
        setTxStep('pollar_ramp');
        await new Promise(r => setTimeout(r, 1800));
        setTxStep('complete');
      }
    } catch (err) {
      console.error('Settlement error:', err);
      setTxStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTxStep('idle');
    setTxHash(null);
    setPollarPayload(null);
    setSenderName('');
    setBolivianReceiver('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Crisp Header with Flat Design Tokens and Tight Tracking */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Minimalist Geometric Dual-Chevron Corridor Logo */}
            <svg 
              className="h-6 w-6 flex-shrink-0" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="PollarBridge Logo"
            >
              {/* West Africa to Latin America Vector (Corporate Indigo) */}
              <path 
                d="M7 6l6 6-6 6" 
                className="stroke-indigo-600 stroke-[2px]" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Latin America to West Africa Counter Vector (Solid Slate) */}
              <path 
                d="M17 18l-6-6 6-6" 
                className="stroke-slate-700 stroke-[2px]" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight text-slate-900">PollarBridge</span>
              <span className="text-xs text-indigo-700 font-mono px-2 py-0.5 bg-indigo-50/80 rounded border border-indigo-200/60 font-medium tracking-tight">
                AFR-LATAM
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-500 font-mono bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/80 tracking-tight">
                SDK v1.3.x
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex text-xs font-medium text-slate-600 items-center border border-slate-200/80 px-3 py-1 rounded-full bg-white tracking-tight">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Stellar Testnet Node Operational
            </div>

            {/* Flat Pollar Authentication Action */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-lg text-xs tracking-tight">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="font-mono text-slate-800 font-medium">
                    {wallet?.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : 'Pollar Connected'}
                  </span>
                  <button 
                    onClick={() => logout()}
                    className="ml-1 text-slate-400 hover:text-slate-600 underline text-[11px]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/90 px-3 py-1.5 rounded-lg transition-colors active:bg-slate-100 tracking-tight"
                  title="Authenticate using official Pollar SDK Passkey or Wallet"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                  <span>Connect Pollar Passkey</span>
                </button>
              )}

              {/* Native Pollar Wallet Button Component */}
              <div className="hidden lg:block">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Card: Clean Flat Form with Crisp Dividers */}
        <section className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Cross-Continental Settlement</h2>
              <span className="text-[11px] font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80 tracking-tight">
                Pollar SDK Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6 tracking-tight">
              Route liquidity seamlessly from West African bank rails to Bolivian banking networks via the Stellar Network.
            </p>

            <form onSubmit={handleInitiateTransfer} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Sender Information (Nigeria)
                  </label>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => openLoginModal()}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline tracking-tight"
                    >
                      Authenticate with Pollar ID →
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Alaba Electronics Enterprise" 
                  className="w-full text-sm border border-slate-200/90 rounded-lg px-3.5 py-2.5 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400 font-normal" 
                  value={senderName} 
                  onChange={(e) => setSenderName(e.target.value)} 
                  disabled={isProcessing || txStep === 'complete'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Send Amount (NGN)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required 
                      min="1"
                      className="w-full text-sm border border-slate-200/90 rounded-lg pl-3.5 pr-12 py-2.5 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-900 font-normal" 
                      value={amountNaira} 
                      onChange={(e) => setAmountNaira(e.target.value)} 
                      disabled={isProcessing || txStep === 'complete'}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">NGN</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Recipient Account (Bolivia)
                    </label>
                    <button
                      type="button"
                      onClick={() => openRampModal()}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline tracking-tight"
                      title="Preview Pollar Ramp SDK parameters"
                    >
                      Pollar Ramp View
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Banco Mercantil #9821..." 
                    className="w-full text-sm border border-slate-200/90 rounded-lg px-3.5 py-2.5 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400 font-normal" 
                    value={bolivianReceiver} 
                    onChange={(e) => setBolivianReceiver(e.target.value)} 
                    disabled={isProcessing || txStep === 'complete'}
                  />
                </div>
              </div>

              {/* Crisp Breakdown Box */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 text-sm space-y-2.5 font-medium text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="tracking-tight">Stellar Intermediary Swap</span>
                  <span className="text-slate-900 font-mono font-semibold">{calculatedUSDC} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-tight">Est. Payout to Bolivia</span>
                  <span className="text-indigo-600 font-bold font-mono">{calculatedBOB} BOB</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/80 pt-2 text-xs">
                  <span className="tracking-tight">Gas Fees (Pollar Sponsored)</span>
                  <span className="text-emerald-600 font-mono font-semibold">0.00 XLM ($0.00)</span>
                </div>
              </div>

              {/* Action Buttons with Flat Tokens */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={isProcessing || txStep === 'complete'} 
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-100 disabled:text-slate-400 font-medium py-3 rounded-lg text-sm transition-all tracking-tight active:scale-[0.99] border border-transparent"
                >
                  {isProcessing ? 'Routing Infrastructure...' : txStep === 'complete' ? 'Settlement Finalized' : 'Execute Cross-Border Swap'}
                </button>
                {txStep === 'complete' && (
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className="px-4 py-3 bg-white border border-slate-300/90 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all tracking-tight"
                  >
                    New Transfer
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 tracking-tight">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Pollar SDK Config: <code className="font-mono text-slate-600">pub_testnet_20c0...</code></span>
            </div>
            <div className="flex items-center space-x-3 font-medium">
              <button 
                type="button" 
                onClick={() => openKycModal()} 
                className="hover:text-slate-900 text-slate-500 transition-colors"
              >
                Pollar KYC Engine
              </button>
              <span className="text-slate-200">|</span>
              <button 
                type="button" 
                onClick={() => openRampModal()} 
                className="hover:text-slate-900 text-slate-500 transition-colors"
              >
                Off-Ramp Simulator
              </button>
            </div>
          </div>
        </section>

        {/* Right Card: Dense Matte Black [#0B0F19] Node Monitor */}
        <section className="lg:col-span-5 flex flex-col">
          <div className="bg-[#0B0F19] text-slate-200 border border-slate-800/90 rounded-xl p-5 font-mono text-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Live Node Monitor
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800/80 text-slate-300 rounded text-[9px] font-mono border border-slate-700/60">
                  POLLAR_ENGINE
                </span>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <p className={txStep !== 'idle' ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ INIT_AFR_LOCAL_RAIL: Awaiting incoming local webhook...
                </p>
                {txStep === 'local_rail' && (
                  <p className="text-amber-400 pl-4 pt-1 animate-pulse">
                    → Intake verified. Processing local settlement...
                  </p>
                )}
              </div>

              <div>
                <p className={(txStep !== 'idle' && txStep !== 'local_rail') ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ MINT_STELLAR_ASSET: Submitting cryptographic transaction down network path...
                </p>
                {txStep === 'stellar_swap' && (
                  <p className="text-amber-400 pl-4 pt-1 animate-pulse">
                    → Submitting signed payload to Horizon Network...
                  </p>
                )}
              </div>

              <div>
                <p className={txStep === 'pollar_ramp' || txStep === 'complete' ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ POLLAR_LATAM_GATEWAY: Ingesting hash into BOB live terminal...
                </p>
                {txStep === 'pollar_ramp' && (
                  <p className="text-amber-400 pl-4 pt-1 animate-pulse">
                    → Pollar SDK routing non-custodial Bolivian fiat payout...
                  </p>
                )}
                {txStep === 'complete' && (
                  <div className="mt-2 pl-4 py-2.5 px-3 bg-slate-900/90 border border-emerald-500/40 rounded-lg text-emerald-300 space-y-1.5">
                    <p className="font-bold flex items-center justify-between">
                      <span className="tracking-tight">➔ SETTLEMENT SUCCESSFUL</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                        CLEARED
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-300 break-all select-all font-mono">
                      Stellar Tx: <span className="text-emerald-400">{txHash}</span>
                    </p>
                    {pollarPayload && (
                      <>
                        <p className="text-[11px] text-slate-300 font-mono">
                          Pollar TxId: <span className="text-indigo-300">{pollarPayload.pollarTxId}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Payout Rail: <span className="text-slate-200">{pollarPayload.payoutProvider}</span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center tracking-tight">
              <span>CORRIDOR: NGN ➔ XLM/USDC ➔ BOB</span>
              <span>GATEWAY: POLLAR TESTNET</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PollarProvider client={{ apiKey: 'pub_testnet_20c047465ff4ae143f584f68f864e145' }}>
      <DashboardContent />
    </PollarProvider>
  );
}
