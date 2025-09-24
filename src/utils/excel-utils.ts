import XLSX from "xlsx";
import fs from 'fs';
import fse from 'fs-extra';
import colors from 'colors';
import Encoding from 'encoding-japanese';
import path, { dirname } from "path";

import { str_slug, str_ucfirst } from "./str-utils";

colors.green

export interface Json_read_from_excel_Params{
  headerRow?: number,
  sheetIndex?: number,
  sheetName?: string,
  raw?: boolean,
  rawNumbers?: boolean,
  defval?: any,
  transformColumnName?: boolean,
  keepColumnName?: boolean,
  disableClean?: boolean,
}

export function json_read_from_excel(path: string, options?: Json_read_from_excel_Params): any{
  const workbook = XLSX.readFile(path);
  let sheetIndex = 0;
  if(options){
    if(options.sheetIndex){
      sheetIndex = options.sheetIndex;
    }
    else if(options.sheetName){
      sheetIndex = workbook.SheetNames.findIndex(e => e.toLowerCase() === options.sheetName?.toLowerCase());
    }
  }

  const sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];

  const params: {
    range?: number,
    raw?: boolean,
    rawNumbers?: boolean,
    defval?: any
  } = {
    raw: true,
    rawNumbers: true,
    defval: null
  };
  if(options && options.headerRow){
    params.range = options.headerRow;
  }
  const data = XLSX.utils.sheet_to_json(sheet, params);
  
  if(options && options.transformColumnName){
    const columns = extract_column_name(data[0]);
    if(columns.length){
      const tmps: any[] = [];
      data.forEach((e: any, i: number) => {
        const tmp: any = {};
        for(let k in e){
          const c = options && options.keepColumnName ? k.trim() : str_slug(k);
          tmp[c] = e[k];
        }
        tmps.push(tmp);
      });

      return tmps;
    }
  }

  if(options && options.disableClean){
    return data;
  }
  return array_clean_data(data);
}

export interface SheetData{
  name: string,
  data: any[]
}

export function json_read_all_sheets_from_excel(path: string, options?: Json_read_from_excel_Params): SheetData[]{
  const workbook = XLSX.readFile(path);

  console.log(workbook.SheetNames);

  const results: SheetData[] = workbook.SheetNames.map((sheetName, sheetIndex) => {
    const sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const params: {
      range?: number,
      raw?: boolean,
      rawNumbers?: boolean,
      defval?: any
    } = {
      raw: true,
      rawNumbers: true,
      defval: null
    };
    if(options && options.headerRow){
      params.range = options.headerRow;
    }
    const data = XLSX.utils.sheet_to_json(sheet, params);
    
    if(options && options.transformColumnName){
      const columns = extract_column_name(data[0]);
      if(columns.length){
        const tmps: any[] = [];
        data.forEach((e: any, i: number) => {
          const tmp: any = {};
          for(let k in e){
            const c = options && options.keepColumnName ? k.trim() : str_slug(k);
            tmp[c] = e[k];
          }
          tmps.push(tmp);
        });
  
        return {
          name: sheetName,
          data: tmps
        };
      }
    }
  
    if(options && options.disableClean){
      return {
        name: sheetName,
        data: data
      };
    }
    else{
      return {
        name: sheetName,
        data: array_clean_data(data)
      }
    }
  })

  return results;
}

export function extract_column_name(obj: any): string[]{
  if(!obj) return [];
  const result: string[] = [];
  for(let key in obj){
    result.push(key);
  }
  return result;
}

export function excel_to_json(path: string, options?: Json_read_from_excel_Params){
  return json_read_from_excel(path, options);
}

export function str_clean(str: any): string{
  if(!str) return str;

  if(typeof str === 'string'){
    return str.trim();
  }

  return str;
}

export function str_key(str: string): string{
  if(!str) return '';

  return str.trim().toLowerCase().replace(/\s+/gi, '_').replace(/[\.]/i, '');
}

export function obj_clean(obj: any): any{
  if(!obj) return {};

  let result: any = {};
  for(let key in obj){
    result[str_key(key)] = str_clean(obj[key]);
  }

  return result;
}

export function array_clean_data(data: any[]): any[]{
  if(!data || !data.length) return [];

  return data.map(e => obj_clean(e));
}

export function json_to_file(path: string, data: any, callback?: (error: any) => void){
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if(err){
      console.log(`Failed to export to ${path}, error: ${err.message}`.red);
      callback && callback(err);
      return;
    }
  
    console.log(`Wrote to ${path}`.green);
    callback && callback(null);
  })
}

export function str_to_file(filePath: string, data: string, callback?: (error: any) => void){
  const dirName = path.dirname(filePath);
  dir_create(dirName);

  fs.writeFile(filePath, data, (err) => {
    if(err){
      console.log(`Failed to export data to ${filePath}, error: ${err.message}`.red);
      callback && callback(err);
      return;
    }
  
    console.log(`Wrote to ${filePath}`.green);
    callback && callback(null);
  })
}

export function json_to_interface(obj: any, name: string): string{
  let object: any = obj;
  if(Array.isArray(obj) && obj.length){
    object = obj[0];
  }
  let lines: string[] = [];
  for(let k in object){
    let type = 'string';
    if(typeof object[k] === 'number'){
      type = 'number';
    }
    lines.push(`${k}: ${type}`);
  }

  return `
    export interface ${name}{
      ${lines.join("\n")}
    }
  `;
}

export function array_obj_to_array_array(data: any[]): any[]{
  if(!data) return [];

  return data.map(e => Object.values(e));
}

export function extract_obj(data: any[], columns: string[]): any[]{
  if(!data) return [];

  return data.map(e => {
    let result: any = {};
    
    for(let name in columns){
      const key = columns[name];
      if(e[key] !== undefined){
        result[name] = e[key];
      }
      else{
        result[name] = null;
      }
    }

    return result;
  })
}

export interface Json_to_xlsx_Options_Sheet{
  columns?: any,
  sheetName: string,
  skipColumns?: string[],
  capitalColumnName?: boolean,
  wordSeparate?: string,
  data?: any[],
}

export interface Json_to_xlsx_Options{
  sheets: Json_to_xlsx_Options_Sheet[]
}

export function json_to_xlsx(path: string, inputData: any[], options: Json_to_xlsx_Options){
  const workbook = XLSX.utils.book_new();
  options.sheets.forEach(sheetOpt => {
    const sheetName = sheetOpt.sheetName;
    let columns: any = sheetOpt.columns;
    const data = sheetOpt.data ? sheetOpt.data : inputData;
    if(!columns && data[0]){
      columns = {};
      const first = data[0];
      for(let k in first){
        if(k){
          let name = k;
          if(sheetOpt.capitalColumnName){
            name = k.split(/[_ ]/).filter(e => e).map(e => str_ucfirst(e)).join(sheetOpt.wordSeparate || '_');
          }
          if(sheetOpt.skipColumns && sheetOpt.skipColumns.includes(k)){
            // skip
          }
          else{
            columns[name] = k;
          }
        }
      }
    }
    
    const columString: string[] = [];
    const keys: string[] = [];

    for(let name in columns){
      columString.push(name);
      keys.push(columns[name]);
    }

    const arData = array_obj_to_array_array(extract_obj(data, columns));
    /* Create worksheet */
    var ws_data = [
      columString,
      ...arData
    ];
    
    // json_to_file(`./export.json`, ws_data)
    
    // return;
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  })
  
  XLSX.writeFile(workbook, path);

  console.log(`Write file success: ${path}`.green)
}

const FileEncodings: string[] = ['ascii' , 'utf8' , 'utf-8' , 'utf16le' , 'ucs2' , 'ucs-2' , 'base64' , 'base64url' , 'latin1' , 'binary' , 'hex'];

export function text_from_file(path: string, encoding?: BufferEncoding){
  if(!encoding){
    var fileBuffer = fs.readFileSync(path) as any;
    // Auto detech encoding
    let fileEncode = Encoding.detect(fileBuffer) as string;
    if(fileEncode){
      fileEncode = fileEncode.toLowerCase();
      if(FileEncodings.includes(fileEncode)){
        encoding = fileEncode.toLowerCase() as any;
      }
      else if(fileEncode === 'utf16'){
        encoding = 'utf16le';
      }

      // console.log(`File ${path} encode: ${encoding}`);
    }
  }
  const data = fs.readFileSync(path, {
    encoding: encoding || 'utf8',
    flag: 'r'
  });
  return data;
}

export function json_from_file(path: string){
  const str = fs.readFileSync(path, 'utf8');
  if(!str) return null;

  try {
    const data = JSON.parse(str);
    return data;
  } catch (error) {
    return null;
  }
}

export function dir_create(path: string){
  if(fs.existsSync(path)) return;

  fs.mkdirSync(path, {recursive: true});
}

export function dir_create_and_empty(path: string){
  dir_create(path);
  dir_empty(path);
}

export function dir_empty(path: string){
  if(!fs.existsSync(path)) return;

  fse.emptyDirSync(path);
}

export interface IFile{
  name: string,
  path?: string,
  content?: string,
  isFolder?: boolean,
}

export function fileName_in_folder(folderPath: string, includeFolder = false): IFile[] {
  const files: IFile[] = [];
  const entries = fs.readdirSync(folderPath);

  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry);
    const stats = fs.statSync(entryPath);

    if (stats.isDirectory()) {
      // Recursively read files in subdirectories
      // const subfolderFiles = fileName_in_folder(entryPath);
      // files.push(...subfolderFiles);
      if(includeFolder){
        files.push({
          path: entryPath,
          name: entry,
          isFolder: true,
        });
      }
    } else if (stats.isFile()) {
      files.push({
        path: entryPath,
        name: entry
      });
    }
  }

  return files;
}

export function get_filename(filePath: string): string{
  return path.basename(filePath);
}

export function get_filename_without_extension(filePath: string): string{
  const fileNameWithExtension = path.basename(filePath); // Get the file name with extension
    const fileNameWithoutExtension = path.parse(fileNameWithExtension).name; // Extract the file name without extension
    return fileNameWithoutExtension;
}