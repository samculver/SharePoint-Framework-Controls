import { HttpClient } from "@microsoft/sp-http";

export interface IStockInformationProps {
  stockSymbol: string;
  autoRefresh: boolean;
  apiKey: string;
  needsConfiguration: boolean;
  httpClient: HttpClient;
  configureHandler: () => void;
  errorHandler: (errorMessage: string) => void;
}
