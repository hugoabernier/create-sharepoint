import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {{ COMPONENT_PASCAL }} from './components/{{COMPONENT_PASCAL}}';
import { I{{ COMPONENT_PASCAL }}Props } from './components/I{{COMPONENT_PASCAL}}Props';

export interface I {{ COMPONENT_PASCAL }}WebPartProps {
}

export default class {{ COMPONENT_PASCAL }}WebPart extends BaseClientSideWebPart <I{{ COMPONENT_PASCAL }} WebPartProps> {
  public render(): void {
    const element: React.ReactElement<I{{ COMPONENT_PASCAL }}Props> = React.createElement({{ COMPONENT_PASCAL }}, {
    context: this.context,
    description: this.properties && (this.properties as any).description
  } as any);

ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
  return Version.parse('1.0');
}

  public onDispose(): void {
  ReactDom.unmountComponentAtNode(this.domElement);
}
}
