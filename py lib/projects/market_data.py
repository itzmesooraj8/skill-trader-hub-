"""
Market Data Module - yfinance wrapper for comprehensive market data access
Includes: Ticker, Tickers, download, Search, Sector/Industry, EquityQuery/Screener
"""

import yfinance as yf
import pandas as pd
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta


class MarketData:
    """Comprehensive market data interface using yfinance"""
    
    @staticmethod
    def get_ticker(symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """
        Get single ticker data with additional info
        
        Args:
            symbol: Ticker symbol (e.g., 'AAPL', 'GBPUSD=X')
            period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
        
        Returns:
            DataFrame with OHLCV data
        """
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                print(f"Warning: No data found for {symbol}")
                return pd.DataFrame()
            
            print(f"✓ Downloaded {len(hist)} rows for {symbol}")
            return hist
        except Exception as e:
            print(f"✗ Error fetching {symbol}: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def get_ticker_info(symbol: str) -> Dict:
        """
        Get detailed ticker information
        
        Args:
            symbol: Ticker symbol
        
        Returns:
            Dictionary with ticker info (sector, industry, market cap, etc.)
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                'symbol': symbol,
                'longName': info.get('longName', 'N/A'),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'marketCap': info.get('marketCap', 0),
                'currency': info.get('currency', 'N/A'),
                'exchange': info.get('exchange', 'N/A'),
                'quoteType': info.get('quoteType', 'N/A'),
            }
        except Exception as e:
            print(f"✗ Error fetching info for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}
    
    @staticmethod
    def get_tickers(symbols: List[str], period: str = "1y", interval: str = "1d") -> Dict[str, pd.DataFrame]:
        """
        Get multiple tickers' data
        
        Args:
            symbols: List of ticker symbols
            period: Data period
            interval: Data interval
        
        Returns:
            Dictionary mapping symbol -> DataFrame
        """
        result = {}
        for symbol in symbols:
            print(f"Fetching {symbol}...")
            result[symbol] = MarketData.get_ticker(symbol, period, interval)
        return result
    
    @staticmethod
    def download(tickers: Union[str, List[str]], start: str = None, end: str = None, 
                 period: str = "1y", interval: str = "1d", group_by: str = 'column') -> pd.DataFrame:
        """
        Download market data for multiple tickers using yfinance.download
        
        Args:
            tickers: Single ticker string or list of tickers
            start: Start date (YYYY-MM-DD)
            end: End date (YYYY-MM-DD)
            period: Period if start/end not provided
            interval: Data interval
            group_by: 'column' or 'ticker'
        
        Returns:
            DataFrame with multi-ticker data
        """
        try:
            if isinstance(tickers, list):
                tickers_str = ' '.join(tickers)
            else:
                tickers_str = tickers
            
            df = yf.download(
                tickers_str,
                start=start,
                end=end,
                period=period,
                interval=interval,
                group_by=group_by,
                progress=True
            )
            
            print(f"✓ Downloaded {len(df)} rows for {tickers_str}")
            return df
        except Exception as e:
            print(f"✗ Download error: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def search(query: str, max_results: int = 10) -> pd.DataFrame:
        """
        Search for tickers and get quotes/news
        
        Args:
            query: Search query (company name, ticker, etc.)
            max_results: Maximum number of results
        
        Returns:
            DataFrame with search results
        """
        try:
            # Use yfinance search functionality
            results = yf.Search(query, max_results=max_results)
            
            if hasattr(results, 'quotes'):
                quotes = results.quotes
                df = pd.DataFrame(quotes)
                print(f"✓ Found {len(df)} results for '{query}'")
                return df
            else:
                print(f"No results found for '{query}'")
                return pd.DataFrame()
        except Exception as e:
            print(f"✗ Search error: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def get_sector_industry(symbol: str) -> Dict[str, str]:
        """
        Get sector and industry information for a ticker
        
        Args:
            symbol: Ticker symbol
        
        Returns:
            Dictionary with sector and industry
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                'symbol': symbol,
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'industryKey': info.get('industryKey', 'N/A'),
                'sectorKey': info.get('sectorKey', 'N/A')
            }
        except Exception as e:
            print(f"✗ Error: {e}")
            return {'symbol': symbol, 'sector': 'N/A', 'industry': 'N/A'}
    
    @staticmethod
    def get_news(symbol: str, limit: int = 10) -> pd.DataFrame:
        """
        Get latest news for a ticker
        
        Args:
            symbol: Ticker symbol
            limit: Number of news items
        
        Returns:
            DataFrame with news articles
        """
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            if news:
                news_data = [{
                    'title': item.get('title', ''),
                    'publisher': item.get('publisher', ''),
                    'link': item.get('link', ''),
                    'published': datetime.fromtimestamp(item.get('providerPublishTime', 0)),
                    'type': item.get('type', '')
                } for item in news[:limit]]
                
                df = pd.DataFrame(news_data)
                print(f"✓ Retrieved {len(df)} news items for {symbol}")
                return df
            else:
                print(f"No news found for {symbol}")
                return pd.DataFrame()
        except Exception as e:
            print(f"✗ Error fetching news: {e}")
            return pd.DataFrame()


class EquityScreener:
    """
    Equity screening and filtering functionality
    Note: yfinance has limited screening. For advanced screening, use additional APIs.
    """
    
    def __init__(self):
        self.universe = []
        self.filters = []
    
    def set_universe(self, symbols: List[str]):
        """Set the universe of stocks to screen"""
        self.universe = symbols
        print(f"Universe set: {len(symbols)} symbols")
    
    def add_filter(self, filter_func, description: str = ""):
        """Add a custom filter function"""
        self.filters.append({'func': filter_func, 'desc': description})
        print(f"Filter added: {description}")
    
    def screen(self) -> pd.DataFrame:
        """
        Apply all filters and return matching tickers
        
        Returns:
            DataFrame with screened tickers and their metrics
        """
        results = []
        
        for symbol in self.universe:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                # Apply all filters
                passed = True
                for filter_dict in self.filters:
                    if not filter_dict['func'](info):
                        passed = False
                        break
                
                if passed:
                    results.append({
                        'symbol': symbol,
                        'name': info.get('longName', 'N/A'),
                        'sector': info.get('sector', 'N/A'),
                        'industry': info.get('industry', 'N/A'),
                        'marketCap': info.get('marketCap', 0),
                        'price': info.get('currentPrice', 0),
                        'pe_ratio': info.get('trailingPE', 0),
                        'volume': info.get('volume', 0)
                    })
                    print(f"✓ {symbol} passed screening")
                else:
                    print(f"✗ {symbol} filtered out")
                    
            except Exception as e:
                print(f"✗ Error screening {symbol}: {e}")
                continue
        
        df = pd.DataFrame(results)
        print(f"\n{'='*50}")
        print(f"Screening complete: {len(df)}/{len(self.universe)} symbols passed")
        print(f"{'='*50}")
        return df
    
    def screen_by_criteria(self, symbols: List[str], 
                          min_market_cap: float = 0,
                          max_pe: float = float('inf'),
                          sectors: List[str] = None) -> pd.DataFrame:
        """
        Quick screening with common criteria
        
        Args:
            symbols: List of symbols to screen
            min_market_cap: Minimum market cap
            max_pe: Maximum P/E ratio
            sectors: List of allowed sectors (None = all)
        
        Returns:
            DataFrame with filtered results
        """
        results = []
        
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                market_cap = info.get('marketCap', 0)
                pe_ratio = info.get('trailingPE', float('inf'))
                sector = info.get('sector', '')
                
                # Apply filters
                if market_cap < min_market_cap:
                    continue
                if pe_ratio > max_pe:
                    continue
                if sectors and sector not in sectors:
                    continue
                
                results.append({
                    'symbol': symbol,
                    'name': info.get('longName', 'N/A'),
                    'sector': sector,
                    'industry': info.get('industry', 'N/A'),
                    'marketCap': market_cap,
                    'price': info.get('currentPrice', 0),
                    'pe_ratio': pe_ratio,
                    'volume': info.get('volume', 0)
                })
                print(f"✓ {symbol} passed")
                
            except Exception as e:
                print(f"✗ {symbol}: {e}")
                continue
        
        return pd.DataFrame(results)


# Utility functions for quick access
def ticker(symbol: str, period: str = "1y") -> pd.DataFrame:
    """Quick single ticker data fetch"""
    return MarketData.get_ticker(symbol, period)


def tickers(symbols: List[str], period: str = "1y") -> Dict[str, pd.DataFrame]:
    """Quick multiple tickers data fetch"""
    return MarketData.get_tickers(symbols, period)


def download(tickers_list: Union[str, List[str]], start: str = None, end: str = None, period: str = "1y") -> pd.DataFrame:
    """Quick download wrapper"""
    return MarketData.download(tickers_list, start=start, end=end, period=period)


def search(query: str) -> pd.DataFrame:
    """Quick search wrapper"""
    return MarketData.search(query)


if __name__ == '__main__':
    # Demo usage
    print("="*60)
    print("Market Data Module Demo")
    print("="*60)
    
    # 1. Single Ticker
    print("\n1. Fetching single ticker (AAPL)...")
    aapl_data = MarketData.get_ticker('AAPL', period='1mo')
    print(aapl_data.head())
    
    # 2. Ticker Info
    print("\n2. Getting ticker info...")
    info = MarketData.get_ticker_info('AAPL')
    print(info)
    
    # 3. Multiple Tickers
    print("\n3. Fetching multiple tickers...")
    multi_data = MarketData.get_tickers(['AAPL', 'MSFT', 'GOOGL'], period='1mo')
    print(f"Retrieved data for {len(multi_data)} tickers")
    
    # 4. Search
    print("\n4. Searching for 'Apple'...")
    search_results = MarketData.search('Apple', max_results=5)
    print(search_results[['symbol', 'longname', 'exchDisp']] if not search_results.empty else "No results")
    
    print("\n" + "="*60)
    print("Demo complete!")
