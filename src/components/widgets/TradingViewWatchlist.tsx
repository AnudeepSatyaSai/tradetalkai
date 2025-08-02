import { useEffect, useRef, memo } from 'react';

interface TradingViewWatchlistProps {
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  colorTheme?: 'light' | 'dark';
  locale?: string;
  symbols?: Array<{
    proName: string;
    title: string;
  }>;
}

export const TradingViewWatchlist = memo(({
  width = "100%",
  height = 400,
  theme = "light",
  colorTheme = "light",
  locale = "en",
  symbols = [
    { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
    { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
    { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    { proName: "BITSTAMP:ETHUSD", title: "Ethereum" }
  ]
}: TradingViewWatchlistProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "${colorTheme}",
        "dateRange": "12M",
        "showChart": true,
        "locale": "${locale}",
        "width": "${width}",
        "height": "${height}",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "rgba(106, 109, 120, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": ${JSON.stringify(symbols)},
            "originalTitle": "Indices"
          }
        ]
      }`;

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }
  }, [width, height, theme, colorTheme, locale, symbols]);

  return (
    <div className="tradingview-widget-container">
      <div
        ref={container}
        className="tradingview-widget-container__widget"
        style={{ height, width }}
      />
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

TradingViewWatchlist.displayName = 'TradingViewWatchlist';