import React, { useState } from 'react';
import { Shield, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';

function LaunchApp() {
  const [step, setStep] = useState<'connect' | 'setup' | 'confirm' | 'success'>('connect');
  const [loading, setLoading] = useState(false);
  const [guardianAddress, setGuardianAddress] = useState('');
  const [threshold, setThreshold] = useState('2');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setStep('setup');
      } else {
        setError('Please install MetaMask to continue');
      }
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateProtection = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Generate encrypted private key (in production, this would be more secure)
      const encryptedKey = ethers.hexlify(ethers.randomBytes(32));
      
      // Split guardian addresses string into array
      const guardianAddresses = guardianAddress.split(',').map(addr => addr.trim());
      
      // Create contract instance
      const cryptoGuardAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with actual deployed address
      const cryptoGuardABI = ["function createWallet(bytes32,address[],uint256)"]; // Simplified ABI
      const contract = new ethers.Contract(cryptoGuardAddress, cryptoGuardABI, signer);
      
      // Call contract
      const tx = await contract.createWallet(
        encryptedKey,
        guardianAddresses,
        parseInt(threshold)
      );
      
      await tx.wait();
      setStep('success');
    } catch (err) {
      setError('Failed to activate protection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md w-full mx-4">
          <p className="text-red-300 text-center">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-4 py-4">
        <div className="container mx-auto flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="text-lg font-bold">CryptoGuard</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {step === 'connect' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold mb-6">Connect Your Wallet</h1>
              <p className="text-slate-400 mb-6">
                Connect your wallet to start securing your assets with CryptoGuard Protocol.
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'setup' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold mb-6">Setup Security</h1>
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Guardian Addresses</h3>
                  <input
                    type="text"
                    value={guardianAddress}
                    onChange={(e) => setGuardianAddress(e.target.value)}
                    placeholder="Enter guardian addresses (comma-separated)"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Recovery Threshold</h3>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="2">2 of 3</option>
                    <option value="3">3 of 5</option>
                    <option value="4">4 of 6</option>
                  </select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    Make sure to safely store your recovery information. You'll need this to recover your wallet if needed.
                  </p>
                </div>

                <button
                  onClick={() => setStep('confirm')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-lg transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold mb-6">Confirm Setup</h1>
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Security Configuration</h3>
                  <div className="text-sm text-slate-400">
                    <p>Guardian Addresses: {guardianAddress.split(',').length}</p>
                    <p>Recovery Threshold: {threshold} guardians</p>
                    <p>Monitoring: Enabled</p>
                  </div>
                </div>

                <button
                  onClick={handleActivateProtection}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Activating...
                    </>
                  ) : (
                    'Activate Protection'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Protection Activated!</h1>
                <p className="text-slate-400 mb-6">
                  Your wallet is now protected by CryptoGuard Protocol. Your assets are secured with advanced multi-signature protection and autonomous recovery capabilities.
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-sm text-emerald-300">
                    Remember to keep your guardian addresses and recovery information in a safe place.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LaunchApp;