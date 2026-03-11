"""
Market Data & Screener Examples
Demonstrates usage of market_data.py module
"""

from market_data import MarketData, EquityScreener, ticker, tickers, download, search
import pandas as pd

# Set pandas display options for better output
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 50)


def example_1_single_ticker():
    """Example 1: Fetch single ticker data"""
    print("\n" + "="*70)
    print("EXAMPLE 1: Single Ticker Data")
    print("="*70)
    
    # Get AAPL data for last 6 months
    data = MarketData.get_ticker('AAPL', period='6mo', interval='1d')
    print(f"\nAAPL Data (Last 5 rows):\n{data.tail()}")
    
    # Get ticker info
    info = MarketData.get_ticker_info('AAPL')
    print(f"\nAAPL Info:")
    for key, value in info.items():
        print(f"  {key}: {value}")


def example_2_multiple_tickers():
    """Example 2: Fetch multiple tickers"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Multiple Tickers")
    print("="*70)
    
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN']
    data_dict = MarketData.get_tickers(symbols, period='1mo', interval='1d')
    
    print(f"\nFetched data for {len(data_dict)} tickers")
    for symbol, df in data_dict.items():
        if not df.empty:
            print(f"{symbol}: {len(df)} rows, Last Close: ${df['Close'].iloc[-1]:.2f}")


def example_3_download_bulk():
    """Example 3: Bulk download with yfinance.download"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Bulk Download")
    print("="*70)
    
    # Download multiple tickers at once
    tickers_list = ['AAPL', 'MSFT', 'GOOGL']
    df = MarketData.download(tickers_list, start='2024-01-01', end='2024-12-31', group_by='ticker')
    
    print(f"\nDownloaded shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()[:10]}...")  # Show first 10 columns


def example_4_search():
    """Example 4: Search for tickers"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Search Functionality")
    print("="*70)
    
    # Search for companies
    query = "Apple"
    results = MarketData.search(query, max_results=5)
    
    if not results.empty:
        print(f"\nSearch results for '{query}':")
        print(results[['symbol', 'shortname', 'exchDisp']].to_string(index=False))
    else:
        print(f"No results found for '{query}'")


def example_5_sector_industry():
    """Example 5: Get sector and industry info"""
    print("\n" + "="*70)
    print("EXAMPLE 5: Sector & Industry Information")
    print("="*70)
    
    symbols = ['AAPL', 'JPM', 'XOM', 'JNJ', 'TSLA']
    
    for symbol in symbols:
        info = MarketData.get_sector_industry(symbol)
        print(f"{symbol:6} | Sector: {info['sector']:20} | Industry: {info['industry']}")


def example_6_news():
    """Example 6: Get latest news"""
    print("\n" + "="*70)
    print("EXAMPLE 6: Latest News")
    print("="*70)
    
    news = MarketData.get_news('AAPL', limit=5)
    
    if not news.empty:
        print(f"\nLatest AAPL news:")
        for idx, row in news.iterrows():
            print(f"\n  [{row['published']}] {row['publisher']}")
            print(f"  {row['title'][:80]}...")
    else:
        print("No news found")


def example_7_basic_screener():
    """Example 7: Basic equity screener"""
    print("\n" + "="*70)
    print("EXAMPLE 7: Basic Equity Screener")
    print("="*70)
    
    # Define universe (major tech stocks)
    universe = ['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN', 'TSLA', 'NVDA', 'AMD', 'INTC', 'IBM']
    
    # Screen with criteria
    screener = EquityScreener()
    results = screener.screen_by_criteria(
        symbols=universe,
        min_market_cap=100_000_000_000,  # $100B minimum
        max_pe=50,  # P/E ratio under 50
        sectors=['Technology', 'Consumer Cyclical']
    )
    
    if not results.empty:
        print(f"\nScreening Results ({len(results)} passed):")
        print(results[['symbol', 'name', 'sector', 'marketCap', 'pe_ratio']].to_string(index=False))
    else:
        print("No stocks passed the screening criteria")


def example_8_custom_screener():
    """Example 8: Custom screener with filters"""
    print("\n" + "="*70)
    print("EXAMPLE 8: Custom Screener with Filters")
    print("="*70)
    
    # Define custom filters
    def high_volume_filter(info):
        """Filter for high volume stocks (>10M daily volume)"""
        return info.get('volume', 0) > 10_000_000
    
    def tech_sector_filter(info):
        """Filter for technology sector only"""
        return info.get('sector', '') == 'Technology'
    
    def market_cap_filter(info):
        """Filter for large cap (>$50B)"""
        return info.get('marketCap', 0) > 50_000_000_000
    
    # Create screener
    screener = EquityScreener()
    screener.set_universe(['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD', 'INTC'])
    screener.add_filter(tech_sector_filter, "Technology sector")
    screener.add_filter(market_cap_filter, "Market cap > $50B")
    screener.add_filter(high_volume_filter, "Volume > 10M")
    
    # Run screening
    results = screener.screen()
    
    if not results.empty:
        print(f"\nFiltered Results:")
        print(results[['symbol', 'name', 'marketCap', 'volume']].to_string(index=False))


def example_9_forex_data():
    """Example 9: Fetch forex data (for MT5 trading)"""
    print("\n" + "="*70)
    print("EXAMPLE 9: Forex Data (MT5 Compatible)")
    print("="*70)
    
    # Major forex pairs
    forex_pairs = {
        'GBPUSD=X': 'GBP/USD',
        'EURUSD=X': 'EUR/USD',
        'USDJPY=X': 'USD/JPY',
        'AUDUSD=X': 'AUD/USD'
    }
    
    for ticker_symbol, pair_name in forex_pairs.items():
        data = MarketData.get_ticker(ticker_symbol, period='1mo', interval='1d')
        if not data.empty:
            latest_close = data['Close'].iloc[-1]
            print(f"{pair_name:10} ({ticker_symbol:12}) | Latest: {latest_close:.5f} | Rows: {len(data)}")


def run_all_examples():
    """Run all examples"""
    print("\n" + "="*70)
    print("MARKET DATA MODULE - COMPREHENSIVE EXAMPLES")
    print("="*70)
    
    try:
        example_1_single_ticker()
    except Exception as e:
        print(f"Example 1 failed: {e}")
    
    try:
        example_2_multiple_tickers()
    except Exception as e:
        print(f"Example 2 failed: {e}")
    
    try:
        example_3_download_bulk()
    except Exception as e:
        print(f"Example 3 failed: {e}")
    
    try:
        example_4_search()
    except Exception as e:
        print(f"Example 4 failed: {e}")
    
    try:
        example_5_sector_industry()
    except Exception as e:
        print(f"Example 5 failed: {e}")
    
    try:
        example_6_news()
    except Exception as e:
        print(f"Example 6 failed: {e}")
    
    try:
        example_7_basic_screener()
    except Exception as e:
        print(f"Example 7 failed: {e}")
    
    try:
        example_8_custom_screener()
    except Exception as e:
        print(f"Example 8 failed: {e}")
    
    try:
        example_9_forex_data()
    except Exception as e:
        print(f"Example 9 failed: {e}")
    
    print("\n" + "="*70)
    print("ALL EXAMPLES COMPLETE")
    print("="*70)


if __name__ == '__main__':
    # Run specific example or all
    import sys
    
    if len(sys.argv) > 1:
        example_num = sys.argv[1]
        if example_num == '1':
            example_1_single_ticker()
        elif example_num == '2':
            example_2_multiple_tickers()
        elif example_num == '3':
            example_3_download_bulk()
        elif example_num == '4':
            example_4_search()
        elif example_num == '5':
            example_5_sector_industry()
        elif example_num == '6':
            example_6_news()
        elif example_num == '7':
            example_7_basic_screener()
        elif example_num == '8':
            example_8_custom_screener()
        elif example_num == '9':
            example_9_forex_data()
        else:
            print(f"Example {example_num} not found. Use numbers 1-9 or run without args for all examples.")
    else:
        # Run all examples
        run_all_examples()
