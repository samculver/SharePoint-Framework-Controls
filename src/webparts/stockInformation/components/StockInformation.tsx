import * as React from 'react';
import styles from './StockInformation.module.scss';
import { IStockInformationProps } from './IStockInformationProps';
import { IStockInformationState } from './IStockInformationState';
import { escape } from '@microsoft/sp-lodash-subset';

// import strings from localized resources
import * as strings from 'StockInformationWebPartStrings';

// import supporting types
import { IStockInformationData, IStockData } from './IStockInformationData';
import { IAVResults, IAVResultsMetadata, IAVResultsSeries } from './AlphaVantageResults';

// import additional controls/
import  Chart  from './Chart';
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import {
  Spinner,
  SpinnerSize
} from 'office-ui-fabric-react/lib/Spinner';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import * as lodash from '@microsoft/sp-lodash-subset';

export default class StockInformation extends React.Component<IStockInformationProps, IStockInformationState> {

  constructor(props: IStockInformationProps) {
    super(props);

    // set initial state for the component: not loading, no stock information
    this.state = {
      loading: false,
      stockInfo: null
    };
  }

  // on componentDidMount refresh data
  public componentDidMount(): void {
    if (!this.props.needsConfiguration) {
      this.loadStockInformation(this.props.stockSymbol, this.props.apiKey, this.props.autoRefresh);
    }
  }

  // on componentWillReceiveProps refresh data
  public componentWillReceiveProps(nextProps: IStockInformationProps): void {
    if (nextProps.stockSymbol && nextProps.stockSymbol.length && nextProps.apiKey && nextProps.apiKey.length) {
      this.loadStockInformation(nextProps.stockSymbol, nextProps.apiKey, nextProps.autoRefresh);
    }
  }

  public render(): React.ReactElement<IStockInformationProps> {

    const lastStockData: IStockData = this.state.stockInfo != null ? this.state.stockInfo.lastData : null;
    const previousClose: number = this.state.stockInfo != null ? this.state.stockInfo.previousClose : null;
    const difference: number = this.state.stockInfo != null ? lastStockData.close - previousClose : null;
    const differencePercent: number = this.state.stockInfo != null ? (difference / previousClose) * 100 : null;
    const chartData = this.createFakeData();
    
    return (
      <div className={ styles.stockInformation }>
        {this.props.needsConfiguration &&
          <Placeholder
            iconName={strings.PlaceholderIconName}
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={this.props.configureHandler} />
        }
        {!this.props.needsConfiguration && this.state.loading &&
          <Spinner size={SpinnerSize.large} label={strings.LoadingDataLabel} />
        }
        {!this.props.needsConfiguration && !this.state.loading &&
          <div className={styles.stock}>
            <div className={styles.stockSymbol}>{this.state.stockInfo.symbol}</div>
            <div>
              <span className={styles.stockTrend}>
                { lastStockData.close > previousClose ?
                <Icon iconName='Up' /> :
                lastStockData.close < previousClose ?
                <Icon iconName='Down' /> :
                null }
              </span>
              <span className={styles.stockValue}>{ parseFloat(lastStockData.close.toString()).toFixed(2) } USD</span>
            </div>
            <div className={styles.stockInfo}>
              <span>{(difference >= 0 ? '+' : '-')}{ parseFloat(difference.toString()).toFixed(2) }</span>
              <span>({differencePercent >= 0 ? '+' : '-'}{ parseFloat(differencePercent.toString()).toFixed(2) }%)</span>
              <span>{this.state.stockInfo.lastRefreshed.toLocaleTimeString()}</span>
            </div>
            <a href={`https://www.msn.com/en-us/money/stockdetails/fi-126.1.${this.state.stockInfo.symbol}.NAS?symbol=${this.state.stockInfo.symbol}&form=PRFIHQ`} className={styles.more} target='_blank'><Icon iconName='NavigateExternalInline'/></a>
            <Chart data={chartData} svgHeight={300} svgWidth={700} />
          </div>         
        }
      </div>
    );
  }

  private createFakeData(){
    // This function creates data that doesn't look entirely random
    const data = []
    for (let x = 0; x <= 30; x++) {
        const random = Math.random();
        const temp = data.length > 0 ? data[data.length-1].y : 50;
        const y = random >= .45 ? temp + Math.floor(random * 20) : temp - Math.floor(random * 20);
        data.push({x,y})
    }
    return data;
  }

  // method to load stock information from external REST API
  private loadStockInformation(stockSymbol: string, apiKey: string, autoRefresh: boolean): void {

    // double-check to have the API Key
    if (!apiKey) {

      // if we don't have the API Key, stop the Spinner
      this.setState({
        loading: false,
        stockInfo: null
      });
      // and show a specific error
      this.props.errorHandler(strings.NoAPIKeyInTenantProperties);
    } else {

      // show the Spinner control
      this.setState({
        loading: true
      });

      // get the current date and time
      const now: Date = new Date();

      // determine the date of the last work day
      const lastDay: Date = new Date(now.getTime() - (24 * ((now.getDay() === 0) ? 2 : (now.getDay() === 1) ? 3 : 1)) * 60 * 60000);
      const lastDayName: string = lastDay.toISOString().substring(0, 10);

      // get yesterday's closing price if it is not already in the local storage cache
      const dailyCloseKeyName: string = `PnP-Portal-AlphaVantage-Close-${escape(stockSymbol)}-${lastDayName}`;

      // try to get the close price from the local session storage
      let closeValue: number = Number(sessionStorage.getItem(dailyCloseKeyName));

      // if it is not there, load it from the API
      // and store its value in the session storage
      if (!closeValue) {

        const serviceDailyEndpoint: string =
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${escape(stockSymbol)}&apikey=${apiKey}`;

        // request stock information to the REST API
        this.props.httpClient
        .get(serviceDailyEndpoint, HttpClient.configurations.v1)
        .then((response: HttpClientResponse): Promise<IAVResults> => {
          return response.json();
        })
        .then((data: IAVResults): void => {

          // if there are no errors and we have data
          if (!data["Error Message"] && data["Meta Data"] && data["Time Series (Daily)"]) {

            // get yesterday date and time
            const yesterdayData: IAVResultsSeries = data["Time Series (Daily)"][lastDayName];
            closeValue = yesterdayData["4. close"];

            if (closeValue > 0) {
              sessionStorage.setItem(dailyCloseKeyName, closeValue.toString());
            }
          }
        });
      }

      const serviceIntradayEndpoint: string =
       `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${escape(stockSymbol)}&interval=1min&apikey=${apiKey}`;

      // request stock information to the REST API
      this.props.httpClient
        .get(serviceIntradayEndpoint, HttpClient.configurations.v1)
        .then((response: HttpClientResponse): Promise<IAVResults> => {
          return response.json();
        })
        .then((data: IAVResults): void => {

          // if there are no errors and we have data
          if (!data["Error Message"] && data["Meta Data"] && data["Time Series (1min)"]) {

            const timeSeries: Array<IAVResultsSeries> = new Array<IAVResultsSeries>();

            // parse response to retrieve the quotes
            lodash.forIn(data["Time Series (1min)"], (value: IAVResultsSeries, key: string) => {
              timeSeries.push(value);
            });

            // get the last data series from the AV service
            const lastAVDataSeries: IAVResultsSeries = timeSeries[0];

            // build the state variable to render the stock information
            const stockInfo: IStockInformationData = {
              symbol: data["Meta Data"]["2. Symbol"],
              lastRefreshed: now,
              lastData: {
                open: lastAVDataSeries["1. open"],
                high: lastAVDataSeries["2. high"],
                low: lastAVDataSeries["3. low"],
                close: lastAVDataSeries["4. close"],
                volume: lastAVDataSeries["5. volume"]
              },
              previousClose: closeValue
            };

            // set the state with the new stock information and stop the Spinner
            this.setState({
              loading: false,
              stockInfo: stockInfo
            });
          } else {
            // if we don't have data in the response, stop the Spinner and show previous data
            this.setState({
              loading: false
            });
            // and show a specific error
            this.props.errorHandler(`${strings.NoDataForStockSymbol}${escape(stockSymbol)}`);
          }
        }, (error: any): void => {
          // in case of any other generic error, stop the Spinner and show previous data
          this.setState({
            loading: false
          });
          // and show the error
          this.props.errorHandler(error);
        })
        .catch((error: any): void => {
          // in case of any other error, stop the Spinner and show previous data
          this.setState({
            loading: false
          });
          // and show the error
          this.props.errorHandler(error);
        });

      // handle autoRefresh logic
      if (autoRefresh) {
        // if autoRefresh is enabled, refresh data every 60sec
        setTimeout(() => { this.loadStockInformation(stockSymbol, apiKey, autoRefresh); }, 60000);
      }
    }
  }
}
