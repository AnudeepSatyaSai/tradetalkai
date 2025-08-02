import { useEffect, useRef, memo } from 'react';

interface TradingViewHeatmapProps {
  width?: string | number;
  height?: string | number;
  dataSource?: 'SPX500' | 'DJI' | 'CRYPTO';
  exchange?: string;
  grouping?: 'sector' | 'no_group' | 'market_cap_basic';
  blockSize?: 'market_cap_basic' | 'change' | 'volume';
  blockColor?: 'change' | 'Perf.W' | 'Perf.1M' | 'Perf.3M' | 'Perf.6M' | 'Perf.Y';
  locale?: string;
  symbolUrl?: string;
  colorTheme?: 'light' | 'dark';
  hasTopBar?: boolean;
  isDataSetEnabled?: boolean;
  isZoomEnabled?: boolean;
  hasSymbolTooltip?: boolean;
}

export const TradingViewHeatmap = memo(({
  width = "100%",
  height = 500,
  dataSource = "SPX500",
  exchange = "",
  grouping = "sector",
  blockSize = "market_cap_basic",
  blockColor = "change",
  locale = "en",
  symbolUrl = "",
  colorTheme = "light",
  hasTopBar = false,
  isDataSetEnabled = true,
  isZoomEnabled = true,
  hasSymbolTooltip = true
}: TradingViewHeatmapProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "exchanges": [],
        "dataSource": "${dataSource}",
        "grouping": "${grouping}",
        "blockSize": "${blockSize}",
        "blockColor": "${blockColor}",
        "locale": "${locale}",
        "symbolUrl": "${symbolUrl}",
        "colorTheme": "${colorTheme}",
        "hasTopBar": ${hasTopBar},
        "isDataSetEnabled": ${isDataSetEnabled},
        "isZoomEnabled": ${isZoomEnabled},
        "hasSymbolTooltip": ${hasSymbolTooltip},
        "width": "${width}",
        "height": "${height}"
      }`;

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }
  }, [width, height, dataSource, exchange, grouping, blockSize, blockColor, locale, symbolUrl, colorTheme, hasTopBar, isDataSetEnabled, isZoomEnabled, hasSymbolTooltip]);

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

TradingViewHeatmap.displayName = 'TradingViewHeatmap';