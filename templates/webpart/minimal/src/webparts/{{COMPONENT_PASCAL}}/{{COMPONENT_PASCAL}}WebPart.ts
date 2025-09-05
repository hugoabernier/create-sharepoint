import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './{{COMPONENT_PASCAL}}WebPart.module.scss';

export interface I{{COMPONENT_PASCAL}}WebPartProps {
}

export default class {{COMPONENT_PASCAL}}WebPart extends BaseClientSideWebPart<I{{COMPONENT_PASCAL}}WebPartProps> {
  public render(): void {
    this.domElement.innerHTML = `<div class="${ styles.{{COMPONENT_CAMEL}} }"></div>`;
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
