import { useEffect, useRef, memo } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  timezone?: string;
  locale?: string;
}

export const TradingViewChart = memo(({
  symbol = "NASDAQ:AAPL",
  width = "100%",
  height = 500,
  theme = "light",
  autosize = true,
  timezone = "Etc/UTC",
  locale = "en"
}: TradingViewChartProps) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": ${autosize},
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "${timezone}",
        "theme": "${theme}",
        "style": "1",
        "locale": "${locale}",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, [symbol, width, height, theme, autosize, timezone, locale]);

  return (
    <div className="tradingview-widget-container" style={{ height: autosize ? '100%' : height, width }}>
      <div
        ref={container}
        className="tradingview-widget-container__widget"
        style={{ height: autosize ? '100%' : height, width }}
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

TradingViewChart.displayName = 'TradingViewChart';