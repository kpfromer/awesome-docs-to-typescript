import {Section, SectionBody} from './types';

export const visitType = (type: string) => {
  switch (type) {
    case 'integer':
      return 'number';
    case 'nil':
      return 'undefined';
    case '':
      return 'unknown';
    default:
      return type;
  }
};

export const visitSectionBody = ({
  name,
  type,
  metadata,
}: SectionBody): string => {
  const typeString =
    type.length > 0 ? type.map(visitType).join(' | ') : 'unknown';

  const metadataString = metadata?.reduce(
    (prev, curr) => `${prev}\n*${curr}`,
    ''
  );

  return `/**${metadataString}\n*/\n${name}: ${typeString};`;
};

export const visitSection = ({name, body}: Section): string => {
  const bodyString = body.map(visitSectionBody).join('\n\n');
  return `interface ${name.replace(/\s+/g, '_')}Type \n{${bodyString}\n}`;
};
