import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox
} from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';

import * as strings from 'StockInformationWebPartStrings';
import StockInformation from './components/StockInformation';
import { IStockInformationProps } from './components/IStockInformationProps';

export interface IStockInformationWebPartProps {
  apiKey: string;
  stockSymbol: string;
  autoRefresh: boolean;
}

export default class StockInformationWebPart extends BaseClientSideWebPart<IStockInformationWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IStockInformationProps > = React.createElement(
      StockInformation,
      {
        stockSymbol: this.properties.stockSymbol,
        autoRefresh: this.properties.autoRefresh,
        apiKey: this.properties.apiKey,
        httpClient: this.context.httpClient,
        needsConfiguration: this.needsConfiguration(),
        configureHandler: () => {
          this.context.propertyPane.open();
        },
        errorHandler: (errorMessage: string) => {
          if (this.displayMode === DisplayMode.Edit) {
            this.context.statusRenderer.renderError(this.domElement, errorMessage);
          } else {
            // nothing to do, if we are not in edit Mode
          }
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('apiKey', {
                  label: strings.ApiKeyFieldLabel
                }),
                PropertyPaneTextField('stockSymbol', {
                  label: strings.StockSymbolFieldLabel
                }),
                PropertyPaneCheckbox('autoRefresh', {
                  text: strings.AutoRefreshFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  // method to disable reactive properties in the property pane
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  // method to refresh any error after properties configuration
  protected onAfterPropertyPaneChangesApplied(): void {
    this.context.statusRenderer.clearError(this.domElement);
  }

  // method to determine if the web part has to be configured
  private needsConfiguration(): boolean {
    // as long as we don't have the stock symbol, we need configuration
    return !this.properties.apiKey && (!this.properties.stockSymbol ||
      this.properties.stockSymbol.length === 0);
  }

}
