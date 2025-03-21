import { PublicActions, WalletClient } from 'viem';
import {
  AssetMetadata,
  AssetPrice,
  AssetPriceParams,
  AssetPriceResponse,
} from './schemas.js';

// Common symbol mapping for cryptocurrencies
const symbolToId: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
  SOL: 'solana',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  CRV: 'curve-dao-token',
  SNX: 'synthetix-network-token',
  COMP: 'compound-governance-token',
  MKR: 'maker',
  SHIB: 'shiba-inu',
};

// API Endpoints
const BINANCE_TICKER_ENDPOINT = 'https://api.binance.com/api/v3/ticker/price';
const BINANCE_24HR_ENDPOINT = 'https://api.binance.com/api/v3/ticker/24hr';
const COINGECKO_PRICE_ENDPOINT =
  'https://api.coingecko.com/api/v3/simple/price';
const COINGECKO_MARKET_ENDPOINT =
  'https://api.coingecko.com/api/v3/coins/markets';

/**
 * Attempts to fetch price data from Binance first, falls back to CoinGecko
 */
async function fetchAssetPrices(
  assetSymbols: string[],
  currency: string,
): Promise<AssetPrice[]> {
  try {
    // Try to get real-time prices from Binance first
    const binancePrices = await fetchBinancePrices(assetSymbols, currency);

    // For any missing symbols in Binance, use CoinGecko as fallback
    const missingSymbols = assetSymbols.filter(
      (symbol) => !binancePrices.find((price) => price.symbol === symbol),
    );

    if (missingSymbols.length > 0) {
      const coinGeckoPrices = await fetchCoinGeckoPrices(
        missingSymbols,
        currency,
      );
      return [...binancePrices, ...coinGeckoPrices];
    }

    return binancePrices;
  } catch (error: unknown) {
    // If Binance fails completely, fallback to CoinGecko
    console.warn('Binance API failed, falling back to CoinGecko:', error);
    return fetchCoinGeckoPrices(assetSymbols, currency);
  }
}

/**
 * Fetches price data from Binance API
 */
async function fetchBinancePrices(
  assetSymbols: string[],
  currency: string,
): Promise<AssetPrice[]> {
  try {
    const currencyUpper = currency.toUpperCase();
    const validPairs = assetSymbols.map(
      (symbol) => `${symbol.toUpperCase()}${currencyUpper}`,
    );

    // Add cache-busting parameter
    const cacheBuster = Date.now();
    const response = await fetch(
      `${BINANCE_TICKER_ENDPOINT}?timestamp=${cacheBuster}`,
    );

    if (!response.ok) {
      throw new Error(
        `Binance API returned ${response.status}: ${response.statusText}`,
      );
    }

    const allPrices = await response.json();

    return assetSymbols
      .map((symbol) => {
        const pair = `${symbol.toUpperCase()}${currencyUpper}`;
        const priceData = allPrices.find((item: any) => item.symbol === pair);

        return {
          symbol,
          price: priceData ? priceData.price : 'Price not available on Binance',
          currency: currencyUpper,
          source: 'Binance API',
        };
      })
      .filter(
        (price: AssetPrice) => price.price !== 'Price not available on Binance',
      );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch prices from Binance: ${errorMessage}`);
  }
}

/**
 * Fetches price data from CoinGecko API (as fallback)
 */
async function fetchCoinGeckoPrices(
  assetSymbols: string[],
  currency: string,
): Promise<AssetPrice[]> {
  try {
    // Convert symbols to IDs
    const ids = assetSymbols
      .map((symbol) => symbolToId[symbol] || symbol.toLowerCase())
      .join(',');

    // Add cache-busting parameter
    const cacheBuster = Date.now();

    // Make the API request to CoinGecko
    const response = await fetch(
      `${COINGECKO_PRICE_ENDPOINT}?ids=${ids}&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true&timestamp=${cacheBuster}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Format the response
    return assetSymbols.map((symbol) => {
      const id = symbolToId[symbol] || symbol.toLowerCase();
      const currencyLower = currency.toLowerCase();
      const price = data[id]?.[currencyLower] || null;

      return {
        symbol,
        price: price !== null ? price.toString() : 'Price not available',
        currency: currency.toUpperCase(),
        source: 'CoinGecko API',
      };
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to fetch asset prices from CoinGecko: ${errorMessage}`,
    );
  }
}

/**
 * Fetches additional metadata combining Binance and CoinGecko data
 */
async function fetchAssetMetadata(
  assetSymbols: string[],
  currency: string,
): Promise<AssetMetadata[]> {
  try {
    // Try Binance 24hr stats first for more current data
    const binanceMetadata = await fetchBinanceMetadata(assetSymbols, currency);

    // For any symbols without Binance data, fall back to CoinGecko
    const missingSymbols = assetSymbols.filter(
      (symbol) => !binanceMetadata.find((meta) => meta.symbol === symbol),
    );

    let coinGeckoMetadata: AssetMetadata[] = [];
    if (missingSymbols.length > 0) {
      coinGeckoMetadata = await fetchCoinGeckoMetadata(
        missingSymbols,
        currency,
      );
    }

    return [...binanceMetadata, ...coinGeckoMetadata];
  } catch (error: unknown) {
    // If Binance fails completely, use CoinGecko for all
    console.warn(
      'Binance metadata API failed, falling back to CoinGecko:',
      error,
    );
    return fetchCoinGeckoMetadata(assetSymbols, currency);
  }
}

/**
 * Fetches metadata from Binance API
 */
async function fetchBinanceMetadata(
  assetSymbols: string[],
  currency: string,
): Promise<AssetMetadata[]> {
  try {
    const currencyUpper = currency.toUpperCase();
    const validSymbols = assetSymbols.map((symbol) => symbol.toUpperCase());

    // Add cache-busting parameter
    const cacheBuster = Date.now();
    const response = await fetch(
      `${BINANCE_24HR_ENDPOINT}?timestamp=${cacheBuster}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Binance API returned ${response.status}: ${response.statusText}`,
      );
    }

    const allData = await response.json();

    // Define a type that matches both our needs and the AssetMetadata interface
    interface BinanceMetadata extends AssetMetadata {
      symbol: string;
      marketCap: string;
      volume24h: string;
      priceChange24h: string;
      priceChangePercentage24h: string;
      source: string;
    }

    const results: (BinanceMetadata | null)[] = assetSymbols.map((symbol) => {
      const pair = `${symbol.toUpperCase()}${currencyUpper}`;
      const data = allData.find((item: any) => item.symbol === pair);

      if (!data) {
        return null;
      }

      return {
        symbol,
        marketCap: 'Not available from Binance',
        volume24h: data.volume ? String(data.volume) : 'Not available',
        priceChange24h: data.priceChange
          ? String(data.priceChange)
          : 'Not available',
        priceChangePercentage24h: data.priceChangePercent
          ? String(data.priceChangePercent)
          : 'Not available',
        source: 'Binance API',
      };
    });

    // Use type guard to filter out null values and return only valid metadata
    return results.filter((item): item is BinanceMetadata => item !== null);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch metadata from Binance: ${errorMessage}`);
  }
}

/**
 * Fetches metadata from CoinGecko API
 */
async function fetchCoinGeckoMetadata(
  assetSymbols: string[],
  currency: string,
): Promise<AssetMetadata[]> {
  try {
    // Convert symbols to IDs
    const ids = assetSymbols
      .map((symbol) => symbolToId[symbol] || symbol.toLowerCase())
      .join(',');

    // Add cache-busting parameter
    const cacheBuster = Date.now();

    // Make the API request to CoinGecko
    const response = await fetch(
      `${COINGECKO_MARKET_ENDPOINT}?vs_currency=${currency.toLowerCase()}&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h&timestamp=${cacheBuster}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Format the response
    return assetSymbols.map((symbol) => {
      const id = symbolToId[symbol] || symbol.toLowerCase();
      const coinData = data.find((coin: any) => coin.id === id);

      if (!coinData) {
        return {
          symbol,
          marketCap: 'Not available',
          volume24h: 'Not available',
          priceChange24h: 'Not available',
          priceChangePercentage24h: 'Not available',
          source: 'CoinGecko API',
        };
      }

      return {
        symbol,
        marketCap: coinData.market_cap?.toString() || 'Not available',
        volume24h: coinData.total_volume?.toString() || 'Not available',
        priceChange24h:
          coinData.price_change_24h?.toString() || 'Not available',
        priceChangePercentage24h:
          coinData.price_change_percentage_24h?.toString() || 'Not available',
        source: 'CoinGecko API',
      };
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to fetch asset metadata from CoinGecko: ${errorMessage}`,
    );
  }
}

/**
 * Formats the response with price data and optional metadata
 */
function formatAssetPriceResponse(
  prices: AssetPrice[],
  metadata?: AssetMetadata[],
): AssetPriceResponse {
  return {
    prices,
    metadata,
    timestamp: new Date().toISOString(),
    source:
      prices.length > 0 && prices[0].source
        ? prices[0].source
        : 'Cryptocurrency APIs',
  };
}

/**
 * Handler for the asset price tool
 */
export async function assetPriceHandler(
  wallet: WalletClient & PublicActions,
  args: AssetPriceParams,
): Promise<string> {
  const { assetSymbols, currency, includeMetadata } = args;

  try {
    // Validate symbols
    if (assetSymbols.length === 0) {
      throw new Error('At least one asset symbol must be provided');
    }

    // Validate symbols format
    for (const symbol of assetSymbols) {
      if (!symbol || typeof symbol !== 'string') {
        throw new Error(`Invalid asset symbol: ${symbol}`);
      }
    }

    // Validate currency
    if (!currency || typeof currency !== 'string') {
      throw new Error(`Invalid currency: ${currency}`);
    }

    // Fetch price data from APIs
    const priceData = await fetchAssetPrices(assetSymbols, currency);

    // Fetch additional metadata if requested
    let metadata: AssetMetadata[] | undefined = undefined;
    if (includeMetadata) {
      metadata = await fetchAssetMetadata(assetSymbols, currency);
    }

    // Format the response
    const response = formatAssetPriceResponse(priceData, metadata);

    // Return the response as a JSON string as required by the ToolHandler type
    return JSON.stringify(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get asset prices: ${errorMessage}`);
  }
}
