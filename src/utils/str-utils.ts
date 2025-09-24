import { v4 as uuidv4 } from 'uuid';

export function str_ucfirst(str: string): string{
  if(!str) return str;
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function str_uuid(firstKey?: string){
  if(!firstKey) {
    return uuidv4();
  }
  else{
    let str = uuidv4();

    const ars = str.split('-');
    ars[0] = firstKey;

    return ars.join('-');
  }
}

export function str_guid(){
  return uuidv4().replace(/-/g, ''); 
}

export function str_slug(str: string): string{
  if(!str) return '';

  str = str.toLowerCase().trim();
  str = str.replace(/[ \.,\(\)\-\\\*]+/g, '_');
  str = str.replace(/^[\.,\-\(\)_ ]+/, '');
  str = str.replace(/[\.,\(\)\*\-_ ]+$/, '');

  return str;
}

export function str_capitalize(str: string): string {
  const lowerCaseStr = str.toLowerCase();
  return lowerCaseStr.replace(/(?:^|\s)\S/g, match => match.toUpperCase());
}

export function str_className(str: string): string{
  return str_capitalize(str).replace(/[ \-_]+/ig, '');
}

export function str_upper_first_letter(str: string): string{
  if(!str) return '';

  if(str.length === 1){
    return str.toUpperCase();
  }

  return str.slice(0, 1).toUpperCase() + str.substring(1);
}

export function str_insert(original: string, index: number, insertString: string): string {
  return original.slice(0, index) + insertString + original.slice(index);
}