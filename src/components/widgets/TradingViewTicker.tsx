import { useEffect, useRef, memo } from 'react';

interface TradingViewTickerProps {
  symbols?: Array<{
    proName: string;
    title: string;
  }>;
  showSymbolLogo?: boolean;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  displayMode?: 'adaptive' | 'compact' | 'regular';
  locale?: string;
}

export const TradingViewTicker = memo(({
  symbols = [
    { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
    { proName: "FOREXCOM:NSXUSD", title: "US 100" },
    { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    { proName: "BITSTAMP:ETHUSD", title: "Ethereum" }
  ],
  showSymbolLogo = true,
  colorTheme = "light",
  isTransparent = false,
  displayMode = "adaptive",
  locale = "en"
}: TradingViewTickerProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": ${JSON.stringify(symbols)},
        "showSymbolLogo": ${showSymbolLogo},
        "colorTheme": "${colorTheme}",
        "isTransparent": ${isTransparent},
        "displayMode": "${displayMode}",
        "locale": "${locale}"
      }`;

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }
  }, [symbols, showSymbolLogo, colorTheme, isTransparent, displayMode, locale]);

  return (
    <div className="tradingview-widget-container">
      <div ref={container} className="tradingview-widget-container__widget" />
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Track all markets on TradingView
        </a>
      </div>
    </div>
  );
});

TradingViewTicker.displayName = 'TradingViewTicker';