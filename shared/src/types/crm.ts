export type CRMFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'picklist'
  | 'boolean'
  | 'lookup'
  | 'integer'
  | 'textarea';

export interface CRMFieldDefinition {
  api_name: string;
  display_label: string;
  data_type: CRMFieldType;
  required?: boolean;
  read_only?: boolean;
  pick_list_values?: Array<{ display_value: string; actual_value: string }>;
  lookup_module?: string;
  default_value?: any;
}

export interface CRMModuleSchema {
  api_name: string;
  singular_label: string;
  plural_label: string;
  is_custom: boolean;
  fields: CRMFieldDefinition[];
}

export interface CRMRecord {
  id: string;
  Created_Time?: string;
  Modified_Time?: string;
  Created_By?: { id: string; name: string };
  Modified_By?: { id: string; name: string };
  Owner?: { id: string; name: string; email?: string };
  [key: string]: any;
}

export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: string;
  status: 'active' | 'inactive';
}

export interface CRMOrgInfo {
  id: string;
  company_name: string;
  primary_email: string;
  currency_symbol: string;
  time_zone: string;
  domain_name: string;
}

// Zoho CRM Standard Response Formats
export interface ZohoRecordResponse<T = Record<string, any>> {
  data: T[];
  info?: {
    per_page?: number;
    count?: number;
    page?: number;
    more_records?: boolean;
  };
}

export interface ZohoActionDetail {
  id: string;
  Created_Time?: string;
  Modified_Time?: string;
  Created_By?: { id: string; name: string };
  Modified_By?: { id: string; name: string };
  [key: string]: any;
}

export interface ZohoActionItem {
  code: string;
  details: ZohoActionDetail;
  message: string;
  status: 'success' | 'error';
}

export interface ZohoActionResponse {
  data: ZohoActionItem[];
}

export interface ZohoErrorResponse {
  code: string;
  message: string;
  status: 'error';
  details?: Record<string, any>;
}
