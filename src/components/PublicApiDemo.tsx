/**
 * Public API Demo Component
 * Demonstrates integration with GitHub, IPFS, and CoinGecko APIs
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  fetchGitHubUser,
  fetchBitcoinPrice,
  fetchStacksPrice,
  fetchIPFSJson,
  convertUSDtoSatoshis,
  formatCurrency,
  fetchCryptoPrices,
  GitHubUser
} from '@/services/publicApis';
import { Loader2, Github, Bitcoin, Database, TrendingUp } from 'lucide-react';

export function PublicApiDemo() {
  // GitHub State
  const [githubUsername, setGithubUsername] = useState('octocat');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);

  // Crypto Prices State
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [stxPrice, setStxPrice] = useState<number | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);

  // IPFS State
  const [ipfsHash, setIpfsHash] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'); // Example: IPFS logo
  const [ipfsData, setIpfsData] = useState<any>(null);
  const [ipfsLoading, setIpfsLoading] = useState(false);

  // USD to Sats Converter
  const [usdAmount, setUsdAmount] = useState('100');
  const [satsAmount, setSatsAmount] = useState<number | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);

  // GitHub User Fetch
  const handleFetchGitHub = async () => {
    setGithubLoading(true);
    try {
      const user = await fetchGitHubUser(githubUsername);
      setGithubUser(user);
    } catch (error) {
      console.error('GitHub fetch error:', error);
      alert('Failed to fetch GitHub user');
    } finally {
      setGithubLoading(false);
    }
  };

  // Crypto Prices Fetch
  const handleFetchCryptoPrices = async () => {
    setCryptoLoading(true);
    try {
      const prices = await fetchCryptoPrices(['bitcoin', 'blockstack'], ['usd']);
      setBtcPrice(prices.bitcoin.usd);
      setStxPrice(prices.blockstack.usd);
    } catch (error) {
      console.error('Crypto fetch error:', error);
      alert('Failed to fetch crypto prices');
    } finally {
      setCryptoLoading(false);
    }
  };

  // IPFS Fetch
  const handleFetchIPFS = async () => {
    setIpfsLoading(true);
    try {
      const data = await fetchIPFSJson(ipfsHash);
      setIpfsData(data);
    } catch (error) {
      console.error('IPFS fetch error:', error);
      alert('Failed to fetch from IPFS');
    } finally {
      setIpfsLoading(false);
    }
  };

  // USD to Sats Converter
  const handleConvertUSD = async () => {
    setConvertLoading(true);
    try {
      const sats = await convertUSDtoSatoshis(parseFloat(usdAmount));
      setSatsAmount(sats);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Failed to convert USD to satoshis');
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Public API Integrations</h2>
        <p className="text-gray-600">No authentication required - Free and open APIs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GitHub API Demo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-6 h-6" />
            <h3 className="text-xl font-bold">GitHub API</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={githubUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUsername(e.target.value)}
                placeholder="GitHub username"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleFetchGitHub()}
              />
              <Button onClick={handleFetchGitHub} disabled={githubLoading}>
                {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </Button>
            </div>

            {githubUser && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={githubUser.avatar_url} 
                    alt={githubUser.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold">{githubUser.name}</h4>
                    <p className="text-sm text-gray-600">@{githubUser.login}</p>
                  </div>
                </div>
                {githubUser.bio && <p className="text-sm">{githubUser.bio}</p>}
                <div className="flex gap-4 text-sm">
                  <span>📦 {githubUser.public_repos} repos</span>
                  <span>👥 {githubUser.followers} followers</span>
                </div>
                {githubUser.location && (
                  <p className="text-sm">📍 {githubUser.location}</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Crypto Prices Demo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-xl font-bold">Crypto Prices</h3>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleFetchCryptoPrices} 
              disabled={cryptoLoading}
              className="w-full"
            >
              {cryptoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Bitcoin className="w-4 h-4 mr-2" />
              )}
              Fetch Live Prices
            </Button>

            {(btcPrice || stxPrice) && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {btcPrice && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Bitcoin (BTC)</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(btcPrice)}
                    </span>
                  </div>
                )}
                {stxPrice && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Stacks (STX)</span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(stxPrice)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Powered by CoinGecko API
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* IPFS Demo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6" />
            <h3 className="text-xl font-bold">IPFS Storage</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={ipfsHash}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIpfsHash(e.target.value)}
                placeholder="IPFS hash (Qm... or bafy...)"
              />
              <Button onClick={handleFetchIPFS} disabled={ipfsLoading}>
                {ipfsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </Button>
            </div>

            {ipfsData && (
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(ipfsData, null, 2)}
                </pre>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Try: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
            </p>
          </div>
        </Card>

        {/* USD to Sats Converter */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="w-6 h-6" />
            <h3 className="text-xl font-bold">USD → Satoshis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                type="number"
                value={usdAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsdAmount(e.target.value)}
                placeholder="USD amount"
              />
              <Button onClick={handleConvertUSD} disabled={convertLoading}>
                {convertLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
              </Button>
            </div>

            {satsAmount !== null && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">
                  ${usdAmount} USD =
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {satsAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">satoshis</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* API Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold mb-3">✨ No API Keys Required!</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">GitHub API</h4>
            <p className="text-gray-600">
              Access public profile data, repositories, and more without authentication.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">CoinGecko API</h4>
            <p className="text-gray-600">
              Real-time cryptocurrency prices and market data, completely free.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">IPFS Gateways</h4>
            <p className="text-gray-600">
              Decentralized file storage accessible through public gateways.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

