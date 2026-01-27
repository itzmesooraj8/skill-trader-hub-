import datetime
import yfinance as yf
import backtrader as bt
import pandas as pd


class EMA_Crossover(bt.Strategy):
    params = dict(
        ema1_period=21,
        ema2_period=50,
        sl_pips=20,  # stop loss in pips
        tp_pips=40,  # take profit in pips
        stake=1000,
    )

    def log(self, txt, dt=None):
        dt = dt or self.datas[0].datetime.date(0)
        print(f'{dt.isoformat()} {txt}')

    def __init__(self):
        self.ema1 = bt.ind.EMA(self.data.close, period=self.p.ema1_period)
        self.ema2 = bt.ind.EMA(self.data.close, period=self.p.ema2_period)
        self.cross = bt.ind.CrossOver(self.ema1, self.ema2)
        self.order = None

    def next(self):
        if self.order:
            return

        # Close existing positions on opposite signal
        if not self.position:
            if self.cross > 0:  # ema1 crossed above ema2 -> buy
                entry = self.data.close[0]
                sl = entry - (self.p.sl_pips * 0.0001)
                tp = entry + (self.p.tp_pips * 0.0001)
                self.log(f'BUY CREATE, {entry:.5f} SL={sl:.5f} TP={tp:.5f}')
                self.order = self.buy_bracket(size=self.p.stake, price=entry, stopprice=sl, limitprice=tp)

            elif self.cross < 0:  # ema1 crossed below ema2 -> sell
                entry = self.data.close[0]
                sl = entry + (self.p.sl_pips * 0.0001)
                tp = entry - (self.p.tp_pips * 0.0001)
                self.log(f'SELL CREATE, {entry:.5f} SL={sl:.5f} TP={tp:.5f}')
                self.order = self.sell_bracket(size=self.p.stake, price=entry, stopprice=sl, limitprice=tp)

    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            return

        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(f'BUY EXECUTED, Price: {order.executed.price:.5f}, Cost: {order.executed.value:.2f}')
            elif order.issell():
                self.log(f'SELL EXECUTED, Price: {order.executed.price:.5f}, Cost: {order.executed.value:.2f}')

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')

        self.order = None


def fetch_gbpusd(start, end):
    # Try multiple forex tickers for GBPUSD
    tickers = ['GBPUSD=X', 'GBP=X', 'GBPUSD']
    
    for ticker in tickers:
        try:
            print(f'Attempting to download {ticker}...')
            df = yf.download(ticker, start=start, end=end, progress=False, timeout=30)
            if not df.empty and len(df) > 100:
                print(f'Successfully downloaded {len(df)} rows from {ticker}')
                df.index = pd.to_datetime(df.index)
                
                # Flatten MultiIndex columns if present
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = df.columns.get_level_values(0)
                
                # Ensure proper column names
                df.columns = [str(col).title() for col in df.columns]
                
                return df
        except Exception as e:
            print(f'Failed with {ticker}: {e}')
            continue
    
    # Fallback: Use FX data from Fred or alternative source
    print('All tickers failed. Trying alternative: GBP/USD via inverted USD/GBP from UK data...')
    raise RuntimeError('No data downloaded for GBPUSD. Please check internet connection or try manual CSV import.')


def run_backtest(start='2005-01-01', end='2015-12-31'):
    cerebro = bt.Cerebro()
    cerebro.broker.setcash(100000.0)
    cerebro.addstrategy(EMA_Crossover)

    df = fetch_gbpusd(start, end)

    # Backtrader expects columns: Open, High, Low, Close, Volume, OpenInterest
    data = bt.feeds.PandasData(dataname=df)
    cerebro.adddata(data)

    cerebro.addsizer(bt.sizers.FixedSize, stake=1)
    cerebro.broker.setcommission(commission=0.0000)  # commissions not modeled here

    print('Starting Portfolio Value:', cerebro.broker.getvalue())
    results = cerebro.run()
    print('Final Portfolio Value:', cerebro.broker.getvalue())

    try:
        cerebro.plot(style='candlestick')
    except Exception:
        print('Plotting failed (headless environment?), results printed instead.')


if __name__ == '__main__':
    run_backtest('2005-01-01', '2015-12-31')
