import * as React from 'react';
import { I{{COMPONENT_PASCAL}}Props } from './I{{COMPONENT_PASCAL}}Props';

const {{ COMPONENT_PASCAL }}: React.FC <I{{ COMPONENT_PASCAL }}Props> = ({ context, description }) => {
  return (
    <div style={{ padding: 12 }}>
      <h2>{{ COMPONENT_PASCAL }} (SPFx 1.21.1)</h2>
      <p>{description || 'Hello from your lightweight template!'}</p>
      <small>Tenant: {context.pageContext?.web?.absoluteUrl}</small>
    </div>
  );
};

export default {{ COMPONENT_PASCAL }};
