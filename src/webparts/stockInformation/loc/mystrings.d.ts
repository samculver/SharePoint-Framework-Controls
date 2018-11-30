declare interface IStockInformationWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ApiKeyFieldLabel: string;
  StockSymbolFieldLabel: string;
  AutoRefreshFieldLabel: string;

  // Placeholder labels and strings
  PlaceholderIconName: string;
  PlaceholderIconText: string;
  PlaceholderDescription: string;
  PlaceholderButtonLabel: string;

  // UI labels and strings
  LoadingDataLabel: string;
  NoDataForStockSymbol: string;
  NoAPIKeyInTenantProperties: string;
}

declare module 'StockInformationWebPartStrings' {
  const strings: IStockInformationWebPartStrings;
  export = strings;
}
